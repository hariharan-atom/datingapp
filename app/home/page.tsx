"use client";

import {
  CalendarDays,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCard } from "@/features/discovery/components/profile-card";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useDiscovery } from "@/hooks/use-discovery";
import { communities, events } from "@/utils/mock-data";

type ProfileFeed = "ai" | "nearby" | "verified" | "active";

export default function HomePage() {
  const [profileFeed, setProfileFeed] = useState<ProfileFeed>("ai");
  const discovery = useDiscovery({});
  const currentProfile = useCurrentProfile();
  const profiles = useMemo(
    () => discovery.data?.pages.flat() ?? [],
    [discovery.data],
  );
  const featuredProfiles = useMemo(() => {
    const rankedProfiles = [...profiles];

    if (profileFeed === "nearby") {
      return rankedProfiles.sort(
        (left, right) => left.distanceKm - right.distanceKm,
      );
    }

    if (profileFeed === "verified") {
      return rankedProfiles
        .filter((profile) => profile.verified)
        .sort((left, right) => right.compatibility - left.compatibility);
    }

    if (profileFeed === "active") {
      return rankedProfiles
        .filter((profile) => profile.online)
        .sort((left, right) => right.compatibility - left.compatibility);
    }

    return rankedProfiles.sort(
      (left, right) => right.compatibility - left.compatibility,
    );
  }, [profileFeed, profiles]);
  const profileScore = currentProfile.data?.profile.compatibility ?? 0;

  return (
    <AppShell title="The Atom" right="notifications">
      <div className="space-y-8 px-4 pt-4 min-[768px]:px-6">
        <section>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted">
                Your best matches
              </p>
              <h2 className="mt-1 text-[28px] font-bold tracking-[-0.04em]">
                Made for your vibe
              </h2>
            </div>
            <div className="rounded-2xl bg-primary-soft px-3 py-2 text-center">
              <p className="text-lg font-black text-primary">
                {profiles.length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-primary/70">
                New
              </p>
            </div>
          </div>
          <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 min-[768px]:-mx-6 min-[768px]:px-6">
            <Link
              href="/discover"
              className="flex w-[72px] shrink-0 flex-col items-center gap-2"
            >
              <span className="grid size-[68px] place-items-center rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
                <span className="grid size-full place-items-center rounded-full border-[3px] border-white bg-white">
                  <Sparkles className="size-6 text-primary" />
                </span>
              </span>
              <span className="text-center text-[11px] font-semibold">
                For you
              </span>
            </Link>
            {profiles.slice(0, 8).map((profile) => (
              <Link
                href={`/discover/${profile.id}`}
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
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1">
            <Chip
              active={profileFeed === "ai"}
              onClick={() => setProfileFeed("ai")}
              icon={<Sparkles className="size-3.5" />}
            >
              AI picks
            </Chip>
            <Chip
              active={profileFeed === "nearby"}
              onClick={() => setProfileFeed("nearby")}
              icon={<MapPin className="size-3.5" />}
            >
              Nearby
            </Chip>
            <Chip
              active={profileFeed === "verified"}
              onClick={() => setProfileFeed("verified")}
              icon={<ShieldCheck className="size-3.5" />}
            >
              Verified
            </Chip>
            <Chip
              active={profileFeed === "active"}
              onClick={() => setProfileFeed("active")}
              icon={<Zap className="size-3.5" />}
            >
              Active now
            </Chip>
          </div>
          {discovery.isLoading ? (
            <Skeleton className="h-[560px] rounded-[28px]" />
          ) : featuredProfiles[0] ? (
            <ProfileCard profile={featuredProfiles[0]} />
          ) : (
            <div className="rounded-card border border-dashed border-primary/20 bg-primary-soft/40 px-6 py-10 text-center">
              <p className="font-bold">No profiles in this group yet</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Try another filter while your community keeps growing.
              </p>
              <Link
                href="/discover"
                className="mt-4 inline-flex text-sm font-bold text-primary"
              >
                Check discovery
              </Link>
            </div>
          )}
        </section>

        <section>
          <SectionHeading
            title="Nearby & noteworthy"
            subtitle="Sorted by distance"
            href="/discover"
          />
          <div className="mt-4 grid grid-cols-2 gap-3 min-[768px]:grid-cols-3">
            {profiles.slice(1, 7).map((profile) => (
              <ProfileCard key={profile.id} profile={profile} compact />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-card bg-gradient-to-br from-[#0B1F3A] to-secondary p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="size-3 text-accent" />
                Profile assistant
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">
                Your profile is {profileScore}% strong
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
                Add one prompt answer and a candid photo to get seen by more
                compatible people.
              </p>
              <Link
                href="/profile/edit"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold"
              >
                Improve profile <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="relative grid size-20 shrink-0 place-items-center rounded-full bg-white/10">
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="43"
                  fill="none"
                  stroke="rgba(255,255,255,.12)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="43"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="270"
                  strokeDashoffset={270 - profileScore * 2.7}
                />
              </svg>
              <span className="text-xl font-black">{profileScore}</span>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading title="Happening near you" href="/events" />
          <Link
            href="/events"
            className={`relative mt-4 block overflow-hidden rounded-card bg-gradient-to-br ${events[0].gradient} p-5 text-white shadow-soft`}
          >
            <div className="flex justify-between gap-4">
              <div>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {events[0].category}
                </span>
                <h3 className="mt-4 text-2xl font-bold">{events[0].title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                  <CalendarDays className="size-4" />
                  {events[0].date} · {events[0].venue}
                </p>
              </div>
              <span className="text-5xl opacity-80">✨</span>
            </div>
          </Link>
        </section>

        <section>
          <SectionHeading title="Find your people" href="/groups" />
          <div className="mt-4 grid gap-3 min-[768px]:grid-cols-2">
            {communities.slice(0, 2).map((group) => (
              <Link
                href={`/groups/${group.id}`}
                key={group.id}
                className="flex items-center gap-4 rounded-card border border-border bg-white p-4 shadow-soft"
              >
                <span className="relative block size-14 shrink-0 overflow-hidden rounded-[20px] bg-primary-soft shadow-soft">
                  <Image
                    src={group.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{group.name}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {group.members.toLocaleString("en-IN")} members
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
