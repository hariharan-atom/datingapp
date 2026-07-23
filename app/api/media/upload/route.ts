import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/supabase/admin";
import { createClient as createServerClient } from "@/supabase/server";

const MAX_USER_IMAGE_BYTES = 150 * 1024;
const uploadSchema = z.object({
  purpose: z.enum(["profile", "chat", "group", "verification", "report"]),
  targetId: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]{1,80}$/)
    .optional(),
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 30;

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function rateLimited(userId: string) {
  const now = Date.now();
  const current = attempts.get(userId);

  if (!current || current.resetAt <= now) {
    attempts.set(userId, {
      count: 1,
      resetAt: now + ATTEMPT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

interface EncodedImageFormat {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
}

function detectImageFormat(bytes: Uint8Array): EncodedImageFormat | null {
  const isWebP =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  if (isWebP) return { contentType: "image/webp", extension: "webp" };

  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  if (isPng) return { contentType: "image/png", extension: "png" };

  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  if (isJpeg) return { contentType: "image/jpeg", extension: "jpg" };

  return null;
}

async function getAuthenticatedUser(request: NextRequest) {
  const admin = createAdminClient();
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : undefined;

  if (token) {
    const { data, error } = await admin.auth.getUser(token);
    return { admin, user: error ? null : data.user };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  return { admin, user: error ? null : data.user };
}

async function resolveStorageTarget(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  purpose: z.infer<typeof uploadSchema>["purpose"],
  extension: EncodedImageFormat["extension"],
  targetId?: string,
) {
  const objectId = crypto.randomUUID();

  switch (purpose) {
    case "profile":
      return {
        bucket: "profile-photos",
        path: `${userId}/${objectId}.${extension}`,
      };
    case "verification":
      return {
        bucket: "verification",
        path: `${userId}/images/${objectId}.${extension}`,
      };
    case "group":
    case "report":
      return {
        bucket: "user-images",
        path: `${userId}/${purpose}/${targetId ?? "general"}/${objectId}.${extension}`,
      };
    case "chat": {
      if (!targetId) {
        throw new Error("A chat ID is required for chat images.");
      }

      const { data: membership, error } = await admin
        .from("chat_members")
        .select("chat_id")
        .eq("chat_id", targetId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !membership) {
        throw new Error("You cannot upload images to this conversation.");
      }

      return {
        bucket: "chat-media",
        path: `${targetId}/${userId}/${objectId}.${extension}`,
      };
    }
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: "This upload request is not allowed." },
      { status: 403 },
    );
  }

  try {
    const { admin, user } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in before uploading an image." },
        { status: 401 },
      );
    }

    if (rateLimited(user.id)) {
      return NextResponse.json(
        { message: "Too many image uploads. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const parsed = uploadSchema.safeParse({
      purpose: formData.get("purpose"),
      targetId: formData.get("targetId") || undefined,
    });

    if (!parsed.success || !(file instanceof File)) {
      return NextResponse.json(
        { message: "Choose a valid image to upload." },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_USER_IMAGE_BYTES) {
      return NextResponse.json(
        { message: "The compressed image must be under 150 KB." },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = detectImageFormat(bytes);
    if (!format) {
      return NextResponse.json(
        { message: "The uploaded file is not a valid image." },
        { status: 400 },
      );
    }

    const target = await resolveStorageTarget(
      admin,
      user.id,
      parsed.data.purpose,
      format.extension,
      parsed.data.targetId,
    );
    const { error } = await admin.storage
      .from(target.bucket)
      .upload(target.path, bytes, {
        cacheControl: "31536000",
        contentType: format.contentType,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { message: "The image could not be uploaded. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(target, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Image upload is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
