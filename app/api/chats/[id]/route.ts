import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { loadProfiles } from "@/services/server/profile-records";
import { authenticateRequest } from "@/supabase/request-auth";
import type { ChatMessage } from "@/types/domain";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  replyTo: z.string().uuid().optional(),
});

async function isMember(
  admin: Awaited<ReturnType<typeof authenticateRequest>>["admin"],
  chatId: string,
  userId: string,
) {
  const { data, error } = await admin
    .from("chat_members")
    .select("chat_id")
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ message: "Invalid chat." }, { status: 400 });
    }
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view this chat." },
        { status: 401 },
      );
    }
    if (!(await isMember(admin, id, user.id))) {
      return NextResponse.json({ message: "Chat not found." }, { status: 404 });
    }

    const [memberResult, messagesResult] = await Promise.all([
      admin
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", id)
        .neq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("messages")
        .select(
          "id,sender_user_id,body,created_at,reply_to_id,deleted_at,message_type",
        )
        .eq("chat_id", id)
        .order("created_at", { ascending: true }),
    ]);
    if (memberResult.error) throw memberResult.error;
    if (messagesResult.error) throw messagesResult.error;
    const otherUserId = memberResult.data?.user_id as string | undefined;
    const [record] = otherUserId
      ? await loadProfiles(admin, [otherUserId])
      : [];
    if (!record) {
      return NextResponse.json({ message: "Chat not found." }, { status: 404 });
    }

    const messages: ChatMessage[] = (messagesResult.data ?? []).map((row) => ({
      id: row.id as string,
      sender: row.sender_user_id === user.id ? "me" : "them",
      body: row.deleted_at
        ? "This message was deleted."
        : ((row.body as string | null) ??
          (row.message_type === "image" ? "Shared a photo" : "Message")),
      sentAt: new Date(row.created_at as string).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "seen",
      replyTo: (row.reply_to_id as string | null) ?? undefined,
    }));

    await admin
      .from("chat_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", id)
      .eq("user_id", user.id);

    return NextResponse.json({
      chat: { id, profile: record.profile, messages },
    });
  } catch {
    return NextResponse.json(
      { message: "This conversation is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = messageSchema.safeParse(await request.json());
    if (!z.string().uuid().safeParse(id).success || !parsed.success) {
      return NextResponse.json(
        { message: "Write a message before sending." },
        { status: 400 },
      );
    }
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to send a message." },
        { status: 401 },
      );
    }
    if (!(await isMember(admin, id, user.id))) {
      return NextResponse.json({ message: "Chat not found." }, { status: 404 });
    }

    const { data, error } = await admin
      .from("messages")
      .insert({
        chat_id: id,
        sender_user_id: user.id,
        message_type: "text",
        body: parsed.data.body,
        reply_to_id: parsed.data.replyTo ?? null,
      })
      .select("id,created_at")
      .single();
    if (error) throw error;

    const { data: recipient } = await admin
      .from("chat_members")
      .select("user_id")
      .eq("chat_id", id)
      .neq("user_id", user.id)
      .maybeSingle();

    await Promise.all([
      admin
        .from("chats")
        .update({ last_message_at: data.created_at })
        .eq("id", id),
      admin
        .from("chat_members")
        .update({ last_read_at: data.created_at })
        .eq("chat_id", id)
        .eq("user_id", user.id),
      recipient
        ? admin.from("notifications").insert({
            user_id: recipient.user_id,
            actor_user_id: user.id,
            type: "message",
            title: "New message",
            body: parsed.data.body.slice(0, 140),
            data: { chat_id: id },
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json(
      {
        message: {
          id: data.id,
          sender: "me",
          body: parsed.data.body,
          sentAt: new Date(data.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sent",
          replyTo: parsed.data.replyTo,
        } satisfies ChatMessage,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Your message could not be sent." },
      { status: 503 },
    );
  }
}
