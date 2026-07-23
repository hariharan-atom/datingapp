import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/supabase/admin";

const registrationSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateLimited(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const key = forwardedFor?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json(
      { message: "This request is not allowed." },
      { status: 403 },
    );
  }

  if (rateLimited(request)) {
    return NextResponse.json(
      { message: "Too many account attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The account request is invalid." },
      { status: 400 },
    );
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Enter a valid email and a password of at least 8 characters.",
      },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.createUser({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        registration_method: "email_password_no_verification",
      },
    });

    if (error) {
      const duplicate =
        error.status === 422 ||
        error.code === "email_exists" ||
        /already|registered|exists/i.test(error.message);

      return NextResponse.json(
        {
          message: duplicate
            ? "An account with this email is already created. Please log in."
            : "Couldn’t create your account. Please try again.",
        },
        { status: duplicate ? 409 : 400 },
      );
    }

    return NextResponse.json(
      { created: true },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Account creation is temporarily unavailable." },
      { status: 503 },
    );
  }
}
