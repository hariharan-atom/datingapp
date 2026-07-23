import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { loadProfiles } from "@/services/server/profile-records";
import { authenticateRequest } from "@/supabase/request-auth";

const updateSchema = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view notifications." },
        { status: 401 },
      );
    }
    const { data, error } = await admin
      .from("notifications")
      .select("id,actor_user_id,type,title,body,data,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const actorIds = [
      ...new Set(
        (data ?? [])
          .map((row) => row.actor_user_id as string | null)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const profiles = new Map(
      (await loadProfiles(admin, actorIds)).map(({ profile }) => [
        profile.id,
        profile,
      ]),
    );
    const notifications = (data ?? []).map((row) => {
      const metadata = (row.data ?? {}) as Record<string, unknown>;
      const chatId =
        typeof metadata.chat_id === "string" ? metadata.chat_id : undefined;
      const actorId = row.actor_user_id as string | null;
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body ?? "",
        createdAt: row.created_at,
        unread: !row.read_at,
        href:
          (row.type === "match" || row.type === "message") && chatId
            ? `/messages/${chatId}`
            : row.type === "like"
              ? "/discover"
              : "/notifications",
        profile: actorId ? profiles.get(actorId) : undefined,
      };
    });
    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json(
      { message: "Notifications are temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to update notifications." },
        { status: 401 },
      );
    }
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success || (!parsed.data.id && !parsed.data.all)) {
      return NextResponse.json(
        { message: "Select a notification to update." },
        { status: 400 },
      );
    }
    let update = admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (parsed.data.id) update = update.eq("id", parsed.data.id);
    const { error } = await update;
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json(
      { message: "Notification could not be updated." },
      { status: 503 },
    );
  }
}
