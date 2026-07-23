import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { authenticateRequest } from "@/supabase/request-auth";

const idSchema = z.string().uuid();
const actionSchema = z.object({
  action: z.enum([
    "like",
    "super_like",
    "pass",
    "bookmark",
    "unbookmark",
    "hide",
    "block",
    "report",
  ]),
  reason: z.string().trim().min(3).max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to perform this action." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = actionSchema.safeParse(body);
    if (!idSchema.safeParse(id).success || !parsed.success || id === user.id) {
      return NextResponse.json(
        { message: "This profile action is invalid." },
        { status: 400 },
      );
    }

    const { data: target } = await admin
      .from("users")
      .select("id,onboarding_complete,is_active")
      .eq("id", id)
      .maybeSingle();
    if (!target?.onboarding_complete || !target.is_active) {
      return NextResponse.json(
        { message: "This profile is unavailable." },
        { status: 404 },
      );
    }

    const action = parsed.data.action;
    if (action === "like" || action === "super_like") {
      const { data: existingLike } = await admin
        .from("likes")
        .select("id")
        .eq("actor_user_id", user.id)
        .eq("target_user_id", id)
        .maybeSingle();
      const { error } = await admin.from("likes").upsert(
        {
          actor_user_id: user.id,
          target_user_id: id,
          kind: action,
        },
        { onConflict: "actor_user_id,target_user_id" },
      );
      if (error) throw error;
      await admin
        .from("profile_actions")
        .delete()
        .eq("actor_user_id", user.id)
        .eq("target_user_id", id)
        .eq("action", "pass");

      if (!existingLike) {
        await admin.from("notifications").insert({
          user_id: id,
          actor_user_id: user.id,
          type: "like",
          title:
            action === "super_like" ? "New super like" : "Someone likes you",
          body: "Open The Atom to discover who noticed your profile.",
        });
      }
    } else if (action === "unbookmark") {
      const { error } = await admin
        .from("profile_actions")
        .delete()
        .eq("actor_user_id", user.id)
        .eq("target_user_id", id)
        .eq("action", "bookmark");
      if (error) throw error;
    } else if (action === "block") {
      const { error } = await admin.from("blocks").upsert(
        {
          blocker_user_id: user.id,
          blocked_user_id: id,
        },
        { onConflict: "blocker_user_id,blocked_user_id" },
      );
      if (error) throw error;
    } else if (action === "report") {
      const { error } = await admin.from("reports").insert({
        reporter_user_id: user.id,
        reported_user_id: id,
        reason: parsed.data.reason ?? "Profile reported by member",
      });
      if (error) throw error;
    } else {
      const { error } = await admin.from("profile_actions").upsert(
        {
          actor_user_id: user.id,
          target_user_id: id,
          action,
        },
        { onConflict: "actor_user_id,target_user_id,action" },
      );
      if (error) throw error;

      if (action === "pass" || action === "hide") {
        await admin
          .from("likes")
          .delete()
          .eq("actor_user_id", user.id)
          .eq("target_user_id", id);
      }
    }

    const { data: match } = await admin
      .from("matches")
      .select("id")
      .or(
        `and(user_a_id.eq.${user.id},user_b_id.eq.${id}),and(user_a_id.eq.${id},user_b_id.eq.${user.id})`,
      )
      .is("unmatched_at", null)
      .maybeSingle();
    const { data: chat } = match
      ? await admin
          .from("chats")
          .select("id")
          .eq("match_id", match.id)
          .maybeSingle()
      : { data: null };

    if (match && chat && (action === "like" || action === "super_like")) {
      const { data: existingMatchNotification } = await admin
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "match")
        .contains("data", { match_id: match.id })
        .maybeSingle();
      if (!existingMatchNotification) {
        await admin.from("notifications").insert([
          {
            user_id: user.id,
            actor_user_id: id,
            type: "match",
            title: "It is a match!",
            body: "You liked each other. Start a conversation.",
            data: { match_id: match.id, chat_id: chat.id },
          },
          {
            user_id: id,
            actor_user_id: user.id,
            type: "match",
            title: "It is a match!",
            body: "You liked each other. Start a conversation.",
            data: { match_id: match.id, chat_id: chat.id },
          },
        ]);
      }
    }

    return NextResponse.json({
      saved: true,
      matched: Boolean(match),
      matchId: match?.id ?? null,
      chatId: chat?.id ?? null,
    });
  } catch {
    return NextResponse.json(
      { message: "The profile action could not be saved." },
      { status: 503 },
    );
  }
}
