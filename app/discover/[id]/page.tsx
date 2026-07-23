"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  Ban,
  Bookmark,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  VolumeX,
  Wine,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CompatibilitySheet } from "@/features/profile/components/compatibility-sheet";
import { useAppStore } from "@/store/app-store";
import { profiles } from "@/utils/mock-data";

export default function ProfileDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const profile = useMemo(
    () => profiles.find((item) => item.id === params.id) ?? profiles[0],
    [params.id],
  );
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [compatibilityOpen, setCompatibilityOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const { bookmarkedProfiles, toggleBookmark, addLike } = useAppStore();
  const saved = bookmarkedProfiles.includes(profile.id);

  const details = [
    { icon: Ruler, value: `${profile.heightCm} cm` },
    { icon: GraduationCap, value: profile.education },
    { icon: BriefcaseBusiness, value: profile.occupation },
    { icon: Wine, value: profile.lifestyle.drinking },
  ];

  return (
    <AppShell title={profile.name} back right="safety" hideNav hideAi>
      <div className="mx-auto max-w-2xl">
        <section className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {[profile.photo, profile.photo].map((photo, index) => (
              <div
                className="relative aspect-[4/5] min-w-0 flex-[0_0_100%]"
                key={`${photo}-${index}`}
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
            <span className="h-1 flex-1 rounded-full bg-white" />
            <span className="h-1 flex-1 rounded-full bg-white/40" />
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
              {profile.city} · {profile.distanceKm} km away
            </p>
          </div>
        </section>

        <div className="space-y-7 px-4 py-6 min-[768px]:px-6">
          <button
            type="button"
            onClick={() => setCompatibilityOpen(true)}
            className="flex w-full items-center gap-4 rounded-card bg-gradient-to-br from-secondary/10 to-primary/10 p-4 text-left"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-primary to-secondary text-white shadow-soft">
              <Sparkles className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-secondary">
                AI compatibility
              </span>
              <span className="mt-1 block text-lg font-bold">
                {profile.compatibility}% · Strong match
              </span>
            </span>
            <ChevronDown className="size-5 text-secondary" />
          </button>

          <section>
            <p className="text-lg font-bold">About {profile.name}</p>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              {profile.bio}
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

          <section>
            <p className="mb-3 text-lg font-bold">The essentials</p>
            <div className="grid grid-cols-2 gap-3">
              {details.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div
                    key={detail.value}
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

          <section>
            <p className="mb-3 text-lg font-bold">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Chip key={interest} active={index < 2}>
                  {interest}
                </Chip>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-3 text-lg font-bold">Looking for</p>
            <div className="flex items-center gap-3 rounded-card bg-primary-soft p-4">
              <span className="grid size-11 place-items-center rounded-2xl bg-white text-primary shadow-soft">
                <Heart className="size-5" fill="currentColor" />
              </span>
              <div>
                <p className="text-sm font-bold">{profile.relationshipGoal}</p>
                <p className="mt-0.5 text-xs text-muted">
                  Open to building something meaningful
                </p>
              </div>
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
              onClick={() => router.push("/discover")}
              aria-label="Pass"
              className="grid size-[52px] place-items-center rounded-[18px] border border-border bg-white text-muted shadow-soft"
            >
              <X className="size-5" />
            </button>
            <Button
              size="lg"
              onClick={() => {
                addLike(profile.id);
                toast.success(`You liked ${profile.name}`);
              }}
            >
              <Heart className="size-5" fill="currentColor" />
              Like {profile.name}
            </Button>
            <button
              type="button"
              onClick={() => toggleBookmark(profile.id)}
              aria-label="Bookmark"
              className="grid size-[52px] place-items-center rounded-[18px] border border-border bg-white text-secondary shadow-soft"
            >
              <Bookmark
                className="size-5"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      <CompatibilitySheet
        profile={profile}
        open={compatibilityOpen}
        onClose={() => setCompatibilityOpen(false)}
      />
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
              color: "text-ink",
            },
            { icon: VolumeX, label: "Hide profile", color: "text-ink" },
            { icon: Ban, label: "Block", color: "text-danger" },
            { icon: ShieldAlert, label: "Report", color: "text-danger" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                onClick={() => {
                  toast.success(`${item.label} action noted`);
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
