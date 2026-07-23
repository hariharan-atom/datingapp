"use client";

import { CheckCheck, Pin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";

import { Avatar } from "@/components/ui/avatar";
import type { Conversation } from "@/types/domain";

export function ConversationList({
  conversations,
}: {
  conversations: Conversation[];
}) {
  return (
    <Virtuoso
      useWindowScroll
      data={conversations}
      itemContent={(_, conversation) => (
        <Link
          href={`/messages/${conversation.id}`}
          className="flex items-center gap-3 border-b border-border/70 px-4 py-4 transition-colors hover:bg-surface min-[768px]:px-6"
        >
          <Avatar
            src={conversation.profile.photo}
            alt={conversation.profile.name}
            size="lg"
            online={conversation.profile.online}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-bold">
                {conversation.profile.name}
              </h3>
              {conversation.id === "chat-ananya" && (
                <Pin className="size-3 rotate-45 fill-muted text-muted" />
              )}
              <span className="ml-auto text-[11px] font-medium text-muted">
                {conversation.time}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {conversation.typing ? (
                <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-medium text-primary">
                  <span className="flex gap-0.5">
                    <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                    <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                    <span className="size-1 animate-bounce rounded-full bg-primary" />
                  </span>
                  typing
                </p>
              ) : (
                <p className="min-w-0 flex-1 truncate text-sm text-muted">
                  {conversation.lastMessage}
                </p>
              )}
              {conversation.unread > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-5 text-white">
                  {conversation.unread}
                </span>
              ) : (
                <CheckCheck className="size-4 text-secondary" />
              )}
            </div>
          </div>
        </Link>
      )}
      components={{
        Footer: () => (
          <div className="mx-4 mt-6 flex items-start gap-3 rounded-card bg-secondary/5 p-4 min-[768px]:mx-6">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-bold">Conversation check-in</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                The Atom can suggest kinder replies and flag unsafe language.
                Your private chats are never used to train shared models.
              </p>
            </div>
          </div>
        ),
      }}
    />
  );
}
