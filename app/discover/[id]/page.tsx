"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  Ban,
  Bookmark,
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  VolumeX,
  Wine,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { profileService, type ProfileAction } from "@/services/profiles";

export default function ProfileDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useProfile(params.id);
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [acting, setActing] = useState(false);

  if (profileQuery.isLoading) {
    return (
      <AppShell title="Profile" back right="safety" hideNav hideAi>
        <div className="mx-auto max-w-2xl">
          <Skeleton className="aspect-[4/5] rounded-none" />
          <div className="space-y-4 px-4 py-6">
            <Skeleton className="h-24 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
          </div>
        </div>
      </AppShell>
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return (
      <AppShell title="Profile" back right="safety" hideNav hideAi>
        <EmptyState
          icon={ShieldAlert}
          title="Profile unavailable"
          description="This person may have paused or removed their profile."
          action="Back to discovery"
          onAction={() => router.replace("/discover")}
        />
      </AppShell>
    );
  }

  const details = [
    ...(profile.heightCm
      ? [{ icon: Ruler, value: `${profile.heightCm} cm` }]
      : []),
    { icon: GraduationCap, value: profile.education },
    { icon: BriefcaseBusiness, value: profile.occupation },
    { icon: Wine, value: profile.lifestyle.drinking },
  ].filter((detail) => detail.value && detail.value !== "Not added");

  const saveAction = async (action: ProfileAction, successMessage: string) => {
    if (acting) return null;
    setActing(true);
    try {
      const result = await profileService.act(profile.id, action);
      toast.success(
        result.matched ? `You matched with ${profile.name}!` : successMessage,
      );
      return result;
    } catch (error) {
      toast.error("Action not saved", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      return null;
    } finally {
      setActing(false);
    }
  };

  return (
    <AppShell title={profile.name} back right="safety" hideNav hideAi>
      <div className="mx-auto max-w-2xl">
        <section className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {profile.photos.map((photo, index) => (
              <div
                className="relative aspect-[4/5] min-w-0 flex-[0_0_100%]"
                key={photo}
              >
                <Image
                  src={photo}
                  alt={`${profile.name} photo ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 top-3 flex gap-1 px-4">
            {profile.photos.map((photo, index) => (
              <span
                key={photo}
                className={`h-1 flex-1 rounded-full ${
                  index === 0 ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className="absolute right-4 top-7 grid size-10 place-items-center rounded-full bg-black/20 text-white backdrop-blur"
            aria-label="Profile actions"
          >
            <MoreHorizontal className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold tracking-[-0.05em]">
                {profile.name}, {profile.age}
              </h1>
              {profile.verified && (
                <ShieldCheck className="size-6 fill-secondary text-white" />
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="size-4" />
              {profile.city}
              {profile.distanceKm > 0 ? ` · ${profile.distanceKm} km away` : ""}
            </p>
          </div>
        </section>

        <div className="space-y-7 px-4 py-6 min-[768px]:px-6">
          <section>
            <h2 className="text-lg font-bold">About {profile.name}</h2>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              {profile.bio || "Say hello and start a thoughtful conversation."}
            </p>
          </section>

          <section className="rounded-card border border-border p-5 shadow-soft">
            <p className="text-sm font-semibold text-primary">
              {profile.prompt.question}
            </p>
            <p className="mt-3 text-xl font-semibold leading-8 tracking-[-0.02em]">
              “{profile.prompt.answer}”
            </p>
          </section>

          {details.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">The essentials</h2>
              <div className="grid grid-cols-2 gap-3">
                {details.map((detail) => {
                  const Icon = detail.icon;
                  return (
                    <div
                      key={`${detail.value}-${Icon.displayName ?? "detail"}`}
                      className="flex min-w-0 items-center gap-3 rounded-[20px] bg-surface p-3.5"
                    >
                      <Icon className="size-4 shrink-0 text-secondary" />
                      <span className="truncate text-sm font-medium">
                        {detail.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {profile.interests.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Chip key={interest} active={index < 2}>
                    {interest}
                  </Chip>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold">Looking for</h2>
            <div className="flex items-center gap-3 rounded-card bg-primary-soft p-4">
              <span className="grid size-11 place-items-center rounded-2xl bg-white text-primary shadow-soft">
                <Heart className="size-5" fill="currentColor" />
              </span>
              <p className="text-sm font-bold">{profile.relationshipGoal}</p>
            </div>
          </section>

          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className="mx-auto flex items-center gap-2 text-sm font-semibold text-muted"
          >
            <ShieldAlert className="size-4" />
            Safety &amp; profile actions
          </button>
        </div>

        <div className="safe-bottom sticky bottom-0 z-30 border-t border-border bg-white/90 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto grid max-w-lg grid-cols-[52px_1fr_52px] gap-3">
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                void saveAction("pass", "Profile passed").then((result) => {
                  if (result) router.push("/discover");
                })
              }
              aria-label="Pass"
              className="grid size-[52px] place-items-center rounded-[18px] border border-border bg-white text-muted shadow-soft disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
            <Button
              size="lg"
              loading={acting}
              onClick={() =>
                void saveAction("like", `You liked ${profile.name}`).then(
                  (result) => {
                    if (result?.matched && result.chatId) {
                      router.push(`/messages/${result.chatId}`);
                    }
                  },
                )
              }
            >
              <Heart className="size-5" fill="currentColor" />
              Like {profile.name}
            </Button>
            <button
              type="button"
              disabled={acting}
              onClick={() => {
                const nextSaved = !saved;
                setSaved(nextSaved);
                void saveAction(
                  nextSaved ? "bookmark" : "unbookmark",
                  nextSaved ? "Profile saved" : "Bookmark removed",
                ).then((result) => {
                  if (!result) setSaved(!nextSaved);
                });
              }}
              aria-label="Bookmark"
              className="grid size-[52px] place-items-center rounded-[18px] border border-border bg-white text-secondary shadow-soft disabled:opacity-50"
            >
              <Bookmark
                className="size-5"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      <BottomSheet
        open={safetyOpen}
        onClose={() => setSafetyOpen(false)}
        title="Profile actions"
      >
        <div className="space-y-2">
          {[
            {
              icon: MessageCircle,
              label: "Share profile",
              action: "share" as const,
              color: "text-ink",
            },
            {
              icon: VolumeX,
              label: "Hide profile",
              action: "hide" as const,
              color: "text-ink",
            },
            {
              icon: Ban,
              label: "Block",
              action: "block" as const,
              color: "text-danger",
            },
            {
              icon: ShieldAlert,
              label: "Report",
              action: "report" as const,
              color: "text-danger",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                onClick={async () => {
                  if (item.action === "share") {
                    const url = window.location.href;
                    if (navigator.share) {
                      await navigator.share({
                        title: `${profile.name} on The Atom`,
                        url,
                      });
                    } else {
                      await navigator.clipboard.writeText(url);
                      toast.success("Profile link copied");
                    }
                  } else {
                    const result = await saveAction(
                      item.action,
                      `${item.label} saved`,
                    );
                    if (
                      result &&
                      (item.action === "hide" || item.action === "block")
                    ) {
                      router.replace("/discover");
                    }
                  }
                  setSafetyOpen(false);
                }}
                className={`flex h-14 w-full items-center gap-3 rounded-input px-4 text-sm font-semibold ${item.color} hover:bg-surface`}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </AppShell>
  );
}
