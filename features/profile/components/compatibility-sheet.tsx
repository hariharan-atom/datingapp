"use client";

import {
  Activity,
  HeartHandshake,
  Languages,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/domain";

interface CompatibilitySheetProps {
  profile: Profile;
  open: boolean;
  onClose: () => void;
}

export function CompatibilitySheet({
  profile,
  open,
  onClose,
}: CompatibilitySheetProps) {
  const factors = [
    {
      icon: HeartHandshake,
      label: "Shared interests",
      value: "Excellent",
      score: 96,
      text: `${profile.interests.slice(0, 2).join(" and ")} are strong overlap points.`,
    },
    {
      icon: Target,
      label: "Relationship goals",
      value: "Aligned",
      score: 94,
      text: `You’re both looking for something intentional.`,
    },
    {
      icon: Languages,
      label: "Communication",
      value: "Natural",
      score: 91,
      text: `You share ${profile.languages.slice(0, 2).join(" and ")}.`,
    },
    {
      icon: Activity,
      label: "Lifestyle",
      value: "Compatible",
      score: 87,
      text: `Your day-to-day rhythms should fit comfortably.`,
    },
  ];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`You + ${profile.name}`}
      description="AI compatibility is guidance, not a prediction. Chemistry is yours to discover."
    >
      <div className="mb-7 flex items-center gap-5 rounded-card bg-gradient-to-br from-[#0B1F3A] to-secondary p-5 text-white">
        <div className="relative grid size-24 shrink-0 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="rgba(255,255,255,.14)"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="270"
              strokeDashoffset={270 * (1 - profile.compatibility / 100)}
            />
          </svg>
          <div className="text-center">
            <p className="text-3xl font-black">{profile.compatibility}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
              out of 100
            </p>
          </div>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/65">
            <Sparkles className="size-4 text-accent" />
            Strong potential
          </p>
          <h3 className="mt-2 text-xl font-bold">
            Your worlds overlap beautifully.
          </h3>
          <p className="mt-2 text-xs leading-5 text-white/65">
            Built from profile details, goals, and shared interests.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <div
              key={factor.label}
              className="rounded-card border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">{factor.label}</p>
                    <p className="text-xs font-bold text-success">
                      {factor.value}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">{factor.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-card bg-surface p-4">
        <p className="flex items-center gap-2 text-sm font-bold">
          <UsersRound className="size-4 text-secondary" />
          Why this could work
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>✓ Same pace for building a relationship</li>
          <li>✓ Shared curiosity and thoughtful communication</li>
          <li>✓ Complementary social energy</li>
        </ul>
      </div>
      <Button fullWidth size="lg" className="mt-5" onClick={onClose}>
        <Sparkles className="size-5" />
        Get a conversation starter
      </Button>
    </BottomSheet>
  );
}
