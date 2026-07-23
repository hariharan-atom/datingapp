"use client";

import {
  Grid2X2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  Users,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterSheet } from "@/features/discovery/components/filter-sheet";
import { ProfileCard } from "@/features/discovery/components/profile-card";
import { MatchOverlay } from "@/features/matches/components/match-overlay";
import { useDiscovery } from "@/hooks/use-discovery";
import type { Profile } from "@/types/domain";

export default function DiscoverPage() {
  const [view, setView] = useState<"swipe" | "grid">("swipe");
  const [filterOpen, setFilterOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [match, setMatch] = useState<{
    profile: Profile;
    chatId: string | null;
  } | null>(null);
  const discovery = useDiscovery({});
  const profiles = discovery.data?.pages.flat() ?? [];
  const currentIndex = profiles.length ? index % profiles.length : 0;
  const current = profiles[currentIndex];

  const next = () =>
    setIndex((value) => (profiles.length ? (value + 1) % profiles.length : 0));

  return (
    <AppShell title="Discover" right="messages">
      <div className="px-4 pt-3 min-[768px]:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Chip
              active={view === "swipe"}
              onClick={() => setView("swipe")}
              icon={<SquareStack className="size-4" />}
            >
              Swipe
            </Chip>
            <Chip
              active={view === "grid"}
              onClick={() => setView("grid")}
              icon={<Grid2X2 className="size-4" />}
            >
              Grid
            </Chip>
          </div>
          <button
            type="button"
            aria-label="Open filters"
            onClick={() => setFilterOpen(true)}
            className="relative grid size-11 place-items-center rounded-2xl border border-border bg-white shadow-soft"
          >
            <SlidersHorizontal className="size-5" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          </button>
        </div>

        {discovery.isLoading ? (
          <div className="mx-auto mt-4 max-w-xl">
            <Skeleton className="h-[560px] rounded-[28px]" />
          </div>
        ) : discovery.isError ? (
          <EmptyState
            icon={RefreshCw}
            title="Couldn’t load profiles"
            description="Check your connection and try discovery again."
            action="Try again"
            onAction={() => void discovery.refetch()}
          />
        ) : !profiles.length || !current ? (
          <EmptyState
            icon={Users}
            title="You’re early"
            description="No new completed profiles are available yet. Invite your friends—each profile will appear here after onboarding."
            action="Refresh"
            onAction={() => void discovery.refetch()}
          />
        ) : view === "swipe" ? (
          <div className="mx-auto mt-4 max-w-xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Sparkles className="size-3.5 text-secondary" />
                Recommended for you
              </p>
              <p className="text-xs font-semibold text-muted">
                {currentIndex + 1} of {profiles.length}
              </p>
            </div>
            <ProfileCard
              key={current.id}
              profile={current}
              swipeable
              onPass={next}
              onLike={(result) => {
                if (result.matched) {
                  setMatch({ profile: current, chatId: result.chatId });
                }
                next();
              }}
            />
            <p className="mt-4 text-center text-[11px] font-medium text-muted">
              Swipe right to like · left to pass
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 min-[768px]:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} compact />
            ))}
          </div>
        )}
      </div>
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
      <MatchOverlay
        profile={match?.profile ?? null}
        chatId={match?.chatId ?? null}
        onClose={() => setMatch(null)}
      />
    </AppShell>
  );
}
