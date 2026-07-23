"use client";

import {
  CalendarDays,
  Heart,
  ImageIcon,
  MoreHorizontal,
  Pin,
  Plus,
  Send,
  UsersRound,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useAppStore } from "@/store/app-store";
import { communities, profiles } from "@/utils/mock-data";

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();
  const group = useMemo(
    () => communities.find((item) => item.id === params.id) ?? communities[0],
    [params.id],
  );
  const { joinedGroups, toggleGroup } = useAppStore();
  const joined = joinedGroups.includes(group.id);
  const [tab, setTab] = useState("Posts");

  return (
    <AppShell title={group.name} back right="notifications">
      <div
        className={`relative bg-gradient-to-br ${group.gradient} px-5 pb-7 pt-5 text-white`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="text-6xl">{group.emoji}</span>
          <Button
            variant={joined ? "soft" : "primary"}
            className={joined ? "bg-white/15 text-white" : ""}
            onClick={() => toggleGroup(group.id)}
          >
            {joined ? "Joined" : "Join group"}
          </Button>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em]">
          {group.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
          {group.description}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex -space-x-2">
            {profiles.slice(0, 3).map((profile) => (
              <Avatar
                key={profile.id}
                src={profile.photo}
                alt={profile.name}
                size="sm"
                className="rounded-full border-2 border-white"
              />
            ))}
          </div>
          <p className="flex items-center gap-1 text-xs font-semibold text-white/80">
            <UsersRound className="size-4" />
            {group.members.toLocaleString("en-IN")} members
          </p>
        </div>
      </div>
      <div className="sticky top-[calc(60px+var(--safe-top))] z-20 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-xl">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {["Posts", "Events", "Media", "About"].map((item) => (
            <Chip key={item} active={tab === item} onClick={() => setTab(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>
      <div className="space-y-4 px-4 py-5 min-[768px]:px-6">
        <div className="flex gap-3 rounded-card border border-border p-4">
          <Avatar
            src="/images/profiles/kabir.webp"
            alt="Your profile"
            size="sm"
          />
          <button
            type="button"
            className="flex-1 rounded-2xl bg-surface px-4 text-left text-sm text-muted"
          >
            Share something with the group…
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-2xl bg-secondary/10 text-secondary"
          >
            <ImageIcon className="size-4" />
          </button>
        </div>
        <article className="rounded-card border border-secondary/10 bg-secondary/5 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Pin className="size-3.5 fill-secondary" />
            Pinned by moderators
          </p>
          <h2 className="mt-3 font-bold">Community kindness guide</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Be curious, keep consent explicit, and don’t move conversations
            off-platform until everyone feels comfortable.
          </p>
        </article>
        <article className="rounded-card border border-border bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar
              src={profiles[2].photo}
              alt={profiles[2].name}
              size="sm"
              online
            />
            <div>
              <p className="text-sm font-bold">{profiles[2].name}</p>
              <p className="text-[11px] text-muted">2 hours ago</p>
            </div>
            <MoreHorizontal className="ml-auto size-5 text-muted" />
          </div>
          <p className="mt-4 text-sm leading-6">
            Anyone interested in a small Saturday morning meetup? Thinking an
            easy route, breakfast after, and no pressure to be fast 🌿
          </p>
          <div className="mt-4 flex items-center gap-5 border-t border-border pt-3 text-xs font-semibold text-muted">
            <button type="button" className="flex items-center gap-1.5">
              <Heart className="size-4" /> 42
            </button>
            <button type="button" className="flex items-center gap-1.5">
              <Send className="size-4" /> 18 replies
            </button>
          </div>
        </article>
        <button
          type="button"
          onClick={() => toast.info("Event creation flow ready")}
          className="flex w-full items-center gap-3 rounded-card bg-primary-soft p-4 text-left"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <CalendarDays className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-bold">Host a group event</span>
            <span className="mt-1 block text-xs text-muted">
              Create a meetup, poll, or activity
            </span>
          </span>
          <Plus className="ml-auto size-5 text-primary" />
        </button>
      </div>
    </AppShell>
  );
}
