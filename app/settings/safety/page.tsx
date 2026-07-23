"use client";

import {
  AlertTriangle,
  Ban,
  Bot,
  EyeOff,
  HeartHandshake,
  MessageSquareWarning,
  ShieldCheck,
  Siren,
  UserX,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";

export default function SafetyPage() {
  return (
    <AppShell title="Safety centre" back hideAi>
      <div className="mx-auto max-w-2xl px-4 py-5 min-[768px]:px-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#17122f] to-secondary p-6 text-white">
          <ShieldCheck className="size-9 text-accent" />
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em]">
            Your comfort comes first.
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Control who can reach you, get support quickly, and understand how
            automated safety checks work.
          </p>
          <Button
            className="mt-5 bg-white text-secondary shadow-none hover:bg-white"
            onClick={() =>
              toast.info("Emergency contacts are ready to configure")
            }
          >
            <Siren className="size-4" />
            Set up date check-in
          </Button>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-bold">Your safety controls</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              {
                icon: Ban,
                label: "Block",
                text: "Stop all contact",
                color: "bg-red-50 text-danger",
              },
              {
                icon: AlertTriangle,
                label: "Report",
                text: "Tell our safety team",
                color: "bg-amber-50 text-warning",
              },
              {
                icon: EyeOff,
                label: "Hide",
                text: "Remove from discovery",
                color: "bg-violet-50 text-secondary",
              },
              {
                icon: VolumeX,
                label: "Mute",
                text: "Pause notifications",
                color: "bg-slate-100 text-muted",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => toast.info(`${item.label} controls opened`)}
                  className="rounded-card border border-border p-4 text-left"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-2xl ${item.color}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="mt-3 block text-sm font-bold">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {item.text}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-bold">AI-powered protection</h2>
          <div className="mt-3 space-y-3">
            {[
              {
                icon: MessageSquareWarning,
                label: "Toxic message detection",
                text: "Warn before you receive potentially abusive language.",
              },
              {
                icon: Bot,
                label: "Spam & scam detection",
                text: "Detect repeated scripts, suspicious links, and money requests.",
              },
              {
                icon: UserX,
                label: "Fake profile signals",
                text: "Review unusual account and photo patterns.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-card bg-surface p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-secondary shadow-sm">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {item.text}
                    </p>
                  </div>
                  <ShieldCheck className="ml-auto size-4 shrink-0 text-success" />
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] leading-4 text-muted">
            Automated systems can make mistakes. They assist human review and
            never replace your ability to block or report.
          </p>
        </section>

        <section className="mt-7 rounded-card border border-primary/10 bg-primary-soft p-5">
          <HeartHandshake className="size-6 text-primary" />
          <h2 className="mt-3 text-lg font-bold">Need help right now?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Contact Milo’s safety team, share a date plan with someone you
            trust, or access local emergency guidance.
          </p>
          <Button variant="soft" className="mt-4 bg-white">
            Contact safety support
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
