"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
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
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useDiscovery } from "@/hooks/use-discovery";
import type { Profile } from "@/types/domain";

export default function DiscoverPage() {
  const [view, setView] = useState<"swipe" | "grid">("swipe");
  const [filterOpen, setFilterOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [match, setMatch] = useState<{
    profile: Profile;
    chatId: string | null;
    pending: boolean;
  } | null>(null);
  const swipeX = useMotionValue(0);
  const nextCardScale = useTransform(swipeX, [-320, 0, 320], [1, 0.955, 1]);
  const nextCardY = useTransform(swipeX, [-320, 0, 320], [0, 14, 0]);
  const nextCardOpacity = useTransform(swipeX, [-220, 0, 220], [1, 0.74, 1]);
  const discovery = useDiscovery({});
  const currentProfile = useCurrentProfile();
  const profiles = discovery.data?.pages.flat() ?? [];
  const currentIndex = profiles.length ? index % profiles.length : 0;
  const current = profiles[currentIndex];
  const nextProfile =
    profiles.length > 1 ? profiles[(currentIndex + 1) % profiles.length] : null;

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
            <div className="relative isolate pb-3">
              {nextProfile && (
                <motion.div
                  key={`next-${nextProfile.id}`}
                  aria-hidden
                  style={{
                    scale: nextCardScale,
                    y: nextCardY,
                    opacity: nextCardOpacity,
                  }}
                  className="pointer-events-none absolute inset-x-0 top-0 z-0 origin-bottom transform-gpu will-change-transform"
                >
                  <ProfileCard profile={nextProfile} />
                </motion.div>
              )}
              <div className="relative z-10">
                <ProfileCard
                  key={current.id}
                  profile={current}
                  swipeable
                  dragX={swipeX}
                  onSwipeComplete={(action) => {
                    if (action !== "pass") {
                      setMatch({
                        profile: current,
                        chatId: null,
                        pending: true,
                      });
                    }
                    next();
                  }}
                  onActionError={(action) => {
                    if (action !== "pass") {
                      setMatch((existing) =>
                        existing?.profile.id === current.id ? null : existing,
                      );
                    }
                  }}
                  onLike={(result) => {
                    setMatch((existing) => {
                      if (existing?.profile.id !== current.id) return existing;
                      if (!result.matched) return null;
                      return {
                        ...existing,
                        chatId: result.chatId,
                        pending: false,
                      };
                    });
                  }}
                />
              </div>
            </div>
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
        currentProfile={currentProfile.data?.profile ?? null}
        chatId={match?.chatId ?? null}
        chatPending={match?.pending ?? false}
        onClose={() => setMatch(null)}
      />
    </AppShell>
  );
}
