import { NextResponse, type NextRequest } from "next/server";

import { loadProfiles } from "@/services/server/profile-records";
import { authenticateRequest } from "@/supabase/request-auth";
import type { Conversation } from "@/types/domain";

interface MessageRow {
  chat_id: string;
  body: string | null;
  message_type: string;
  created_at: string;
  sender_user_id: string;
}

function messagePreview(message: MessageRow | undefined) {
  if (!message) return "You matched! Say hello.";
  if (message.body?.trim()) return message.body;
  return message.message_type === "image" ? "Shared a photo" : "New message";
}

function shortTime(value: string | undefined) {
  if (!value) return "New";
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export async function GET(request: NextRequest) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view messages." },
        { status: 401 },
      );
    }

    const { data: memberships, error: membershipError } = await admin
      .from("chat_members")
      .select("chat_id,last_read_at,is_pinned")
      .eq("user_id", user.id);
    if (membershipError) throw membershipError;
    const chatIds = (memberships ?? []).map((row) => row.chat_id as string);
    if (!chatIds.length) {
      return NextResponse.json({ conversations: [] });
    }

    const [membersResult, chatsResult, messagesResult] = await Promise.all([
      admin
        .from("chat_members")
        .select("chat_id,user_id")
        .in("chat_id", chatIds)
        .neq("user_id", user.id),
      admin
        .from("chats")
        .select("id,last_message_at,created_at,is_archived")
        .in("id", chatIds)
        .eq("is_archived", false),
      admin
        .from("messages")
        .select("chat_id,body,message_type,created_at,sender_user_id")
        .in("chat_id", chatIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);
    const firstError = [
      membersResult.error,
      chatsResult.error,
      messagesResult.error,
    ].find(Boolean);
    if (firstError) throw firstError;

    const otherMembers = new Map(
      (membersResult.data ?? []).map((row) => [
        row.chat_id as string,
        row.user_id as string,
      ]),
    );
    const profileRecords = await loadProfiles(admin, [
      ...new Set(otherMembers.values()),
    ]);
    const profiles = new Map(
      profileRecords.map(({ profile }) => [profile.id, profile]),
    );
    const messages = (messagesResult.data ?? []) as MessageRow[];
    const membershipByChat = new Map(
      (memberships ?? []).map((row) => [row.chat_id as string, row]),
    );

    const conversations = (chatsResult.data ?? [])
      .flatMap((chat): Conversation[] => {
        const otherUserId = otherMembers.get(chat.id as string);
        const profile = otherUserId ? profiles.get(otherUserId) : undefined;
        if (!profile) return [];
        const chatMessages = messages.filter(
          (message) => message.chat_id === chat.id,
        );
        const latest = chatMessages[0];
        const lastReadAt = membershipByChat.get(chat.id as string)
          ?.last_read_at as string | null;
        const unread = chatMessages.filter(
          (message) =>
            message.sender_user_id !== user.id &&
            (!lastReadAt ||
              new Date(message.created_at).getTime() >
                new Date(lastReadAt).getTime()),
        ).length;

        return [
          {
            id: chat.id as string,
            profile,
            lastMessage: messagePreview(latest),
            time: shortTime(latest?.created_at ?? (chat.created_at as string)),
            unread,
          },
        ];
      })
      .sort((left, right) => {
        const leftChat = (chatsResult.data ?? []).find(
          (chat) => chat.id === left.id,
        );
        const rightChat = (chatsResult.data ?? []).find(
          (chat) => chat.id === right.id,
        );
        return (
          new Date(
            (rightChat?.last_message_at ?? rightChat?.created_at ?? 0) as
              string | number,
          ).getTime() -
          new Date(
            (leftChat?.last_message_at ?? leftChat?.created_at ?? 0) as
              string | number,
          ).getTime()
        );
      });

    return NextResponse.json(
      { conversations },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "Conversations are temporarily unavailable." },
      { status: 503 },
    );
  }
}
