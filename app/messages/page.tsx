"use client";

import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { SearchField } from "@/components/ui/search-field";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { conversations, profiles } from "@/utils/mock-data";

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = conversations.filter((conversation) =>
    conversation.profile.name.toLowerCase().includes(search.toLowerCase()),
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
            {profiles.slice(0, 3).map((profile) => (
              <button
                type="button"
                key={profile.id}
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
      <div className="mt-1">
        <ConversationList conversations={filtered} />
      </div>
    </AppShell>
  );
}
