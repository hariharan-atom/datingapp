"use client";

import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { SearchField } from "@/components/ui/search-field";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { chatService } from "@/services/chat";

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: chatService.listConversations,
  });
  const conversations = conversationsQuery.data ?? [];
  const filtered = conversations.filter(
    (conversation) =>
      conversation.profile.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter !== "Unread" || conversation.unread > 0),
  );

  return (
    <AppShell title="Messages" right="search" hideAi>
      <div className="px-4 pt-3 min-[768px]:px-6">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search conversations"
        />
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">New matches</h2>
            <span className="text-xs font-semibold text-primary">See all</span>
          </div>
          <div className="scrollbar-none -mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-2 min-[768px]:-mx-6 min-[768px]:px-6">
            <button
              type="button"
              className="flex w-[72px] shrink-0 flex-col items-center gap-2"
            >
              <span className="grid size-[68px] place-items-center rounded-full bg-primary-soft text-primary">
                <Heart className="size-6" fill="currentColor" />
              </span>
              <span className="text-[11px] font-semibold">Likes</span>
            </button>
            {conversations.slice(0, 5).map(({ id, profile }) => (
              <button
                type="button"
                key={id}
                onClick={() => {
                  window.location.href = `/messages/${id}`;
                }}
                className="flex w-[72px] shrink-0 flex-col items-center gap-2"
              >
                <Avatar
                  src={profile.photo}
                  alt={profile.name}
                  size="lg"
                  ring
                  online={profile.online}
                />
                <span className="w-full truncate text-center text-[11px] font-semibold">
                  {profile.name}
                </span>
              </button>
            ))}
          </div>
        </section>
        <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-3">
          {[
            { label: "All", icon: MessageCircle },
            { label: "Unread", icon: Sparkles },
            { label: "Matches", icon: Heart },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Chip
                key={item.label}
                active={filter === item.label}
                onClick={() => setFilter(item.label)}
                icon={<Icon className="size-3.5" />}
              >
                {item.label}
              </Chip>
            );
          })}
        </div>
      </div>
      {conversationsQuery.isLoading ? (
        <div className="space-y-3 px-4 py-2">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-20 rounded-card" />
          ))}
        </div>
      ) : conversationsQuery.isError ? (
        <EmptyState
          icon={MessageCircle}
          title="Messages are unavailable"
          description="Check your connection and try again."
          action="Try again"
          onAction={() => void conversationsQuery.refetch()}
        />
      ) : filtered.length ? (
        <div className="mt-1">
          <ConversationList conversations={filtered} />
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title={search ? "No conversations found" : "Your matches appear here"}
          description={
            search
              ? "Try searching another name."
              : "When you and another person like each other, you can start chatting here."
          }
        />
      )}
    </AppShell>
  );
}
