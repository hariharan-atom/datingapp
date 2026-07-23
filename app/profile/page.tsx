"use client";

import {
  BadgeCheck,
  Bell,
  Bookmark,
  ChevronRight,
  Edit3,
  Eye,
  Gift,
  Heart,
  Languages,
  MapPin,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { profiles } from "@/utils/mock-data";

const me = {
  ...profiles[3],
  name: "Hari",
  age: 28,
  city: "Indiranagar, Bengaluru",
  occupation: "Software Engineer",
  bio: "Building thoughtful products, exploring new neighbourhoods, and always saving room for dessert.",
  interests: ["Coding", "Travel", "Music", "Books", "Fitness"],
};

export default function ProfilePage() {
  return (
    <AppShell title="Your profile" right="notifications">
      <div className="mx-auto max-w-2xl px-4 pt-4 min-[768px]:px-6">
        <section className="relative overflow-hidden rounded-[28px] bg-ink shadow-float">
          <div className="relative aspect-[4/4.7]">
            <Image
              src={me.photo}
              alt="Your profile"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/10" />
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold text-success backdrop-blur">
                <ShieldCheck className="size-3.5" />
                Verified
              </span>
              <span className="rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                82% complete
              </span>
            </div>
            <Link
              href="/profile/edit"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-2xl bg-white/85 text-ink shadow-soft backdrop-blur"
            >
              <Edit3 className="size-4" />
            </Link>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h1 className="text-3xl font-bold tracking-[-0.04em]">
                {me.name}, {me.age}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
                <MapPin className="size-4" />
                {me.city}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "Profile views",
              value: "148",
              icon: Eye,
              color: "text-secondary",
            },
            { label: "Likes", value: "36", icon: Heart, color: "text-primary" },
            {
              label: "Bookmarks",
              value: "12",
              icon: Bookmark,
              color: "text-warning",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[20px] border border-border bg-white p-3 text-center shadow-soft"
              >
                <Icon className={`mx-auto size-4 ${item.color}`} />
                <p className="mt-2 text-lg font-black">{item.value}</p>
                <p className="mt-0.5 truncate text-[9px] font-medium text-muted">
                  {item.label}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-5 overflow-hidden rounded-card bg-gradient-to-br from-[#211747] to-secondary p-5 text-white">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-white/10">
              <Sparkles className="size-5 text-accent" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                AI profile coach
              </p>
              <h2 className="mt-1 text-lg font-bold">
                Strong, with room to shine.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                A candid social photo and one specific prompt could lift your
                profile score.
              </p>
              <Link
                href="/ai"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold"
              >
                See recommendations <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">About you</h2>
            <Link
              href="/profile/edit"
              className="text-xs font-bold text-primary"
            >
              Edit
            </Link>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{me.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {me.interests.map((interest) => (
              <Chip key={interest}>{interest}</Chip>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-bold">Profile details</h2>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-card border border-border">
            {[
              { icon: BadgeCheck, label: "Work", value: me.occupation },
              {
                icon: Languages,
                label: "Languages",
                value: me.languages.join(", "),
              },
              {
                icon: Star,
                label: "Looking for",
                value: me.relationshipGoal,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 p-4">
                  <Icon className="size-4 text-secondary" />
                  <span className="text-xs font-medium text-muted">
                    {item.label}
                  </span>
                  <span className="ml-auto max-w-[55%] truncate text-right text-xs font-bold">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-7 space-y-2">
          {[
            { icon: Settings, label: "Settings", href: "/settings" },
            {
              icon: ShieldCheck,
              label: "Safety centre",
              href: "/settings/safety",
            },
            { icon: Bell, label: "Notifications", href: "/notifications" },
            { icon: Gift, label: "Gifts & history", href: "/gifts" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.label}
                className="flex h-14 items-center gap-3 rounded-input px-3 hover:bg-surface"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-surface text-muted">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
                <ChevronRight className="ml-auto size-4 text-muted" />
              </Link>
            );
          })}
        </section>
        <Link href="/profile/edit" className="mt-6 block">
          <Button fullWidth size="lg">
            <Edit3 className="size-5" />
            Edit profile
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
