"use client";

import {
  Bell,
  ChevronRight,
  CircleHelp,
  EyeOff,
  FileText,
  Languages,
  Lock,
  LogOut,
  ShieldCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export default function SettingsPage() {
  const { incognito, toggleIncognito } = useAppStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <AppShell title="Settings" back hideAi>
      <div className="mx-auto max-w-2xl px-4 py-4 min-[768px]:px-6">
        <section>
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            Privacy &amp; safety
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-card border border-border">
            <SettingLink
              icon={ShieldCheck}
              label="Safety centre"
              description="Block, report, and safety tools"
              href="/settings/safety"
            />
            <SettingLink
              icon={Lock}
              label="Privacy"
              description="Visibility and data controls"
              href="/settings/privacy"
            />
            <SettingLink
              icon={UserX}
              label="Blocked users"
              description="Review blocked profiles"
              href="/settings/blocked"
            />
            <SettingToggle
              icon={EyeOff}
              label="Incognito mode"
              description="Only people you like can see you"
              checked={incognito}
              onChange={toggleIncognito}
            />
          </div>
        </section>

        <section className="mt-7">
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            App preferences
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-card border border-border">
            <SettingToggle
              icon={Bell}
              label="Notifications"
              description="Matches, messages, groups, and safety"
              checked={notifications}
              onChange={() => setNotifications((value) => !value)}
            />
            <SettingLink
              icon={Languages}
              label="Language"
              description="English"
              href="/onboarding"
            />
          </div>
        </section>

        <section className="mt-7">
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            Support &amp; legal
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-card border border-border">
            <SettingLink
              icon={CircleHelp}
              label="Help & support"
              description="FAQs and contact"
              href="/settings/help"
            />
            <SettingLink
              icon={FileText}
              label="Terms & privacy"
              description="How Milo protects you"
              href="/settings/legal"
            />
          </div>
        </section>

        <Button
          variant="danger"
          fullWidth
          className="mt-7"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
        <button
          type="button"
          onClick={() =>
            toast.error("Account deletion requires identity confirmation")
          }
          className="mt-4 w-full text-center text-xs font-semibold text-danger"
        >
          Delete account
        </button>
        <p className="mt-6 text-center text-[10px] text-muted">
          Milo 1.0.0 · Made with care in India
        </p>
      </div>

      <BottomSheet
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out of Milo?"
        description="You’ll need your phone number and OTP to sign back in."
      >
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={() => setLogoutOpen(false)}>
            Stay logged in
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setLogoutOpen(false);
              toast.success("Logged out");
            }}
          >
            Log out
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}

function SettingLink({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 hover:bg-surface">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface text-muted">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">
          {description}
        </span>
      </span>
      <ChevronRight className="size-4 text-muted" />
    </Link>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface text-muted">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">
          {description}
        </span>
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
