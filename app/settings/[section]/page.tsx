import {
  ChevronRight,
  CircleHelp,
  FileText,
  Lock,
  ShieldCheck,
  UserX,
} from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";

const copy: Record<
  string,
  { title: string; icon: typeof Lock; description: string }
> = {
  privacy: {
    title: "Privacy",
    icon: Lock,
    description:
      "Control profile visibility, location precision, read receipts, and data permissions.",
  },
  blocked: {
    title: "Blocked users",
    icon: UserX,
    description: "Profiles you block cannot view or contact you.",
  },
  help: {
    title: "Help & support",
    icon: CircleHelp,
    description: "Find answers or contact Milo support.",
  },
  legal: {
    title: "Terms & privacy",
    icon: FileText,
    description: "Clear policies about your rights, safety, and data.",
  },
};

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = copy[section] ?? copy.privacy;
  const Icon = content.icon;

  return (
    <AppShell title={content.title} back hideAi>
      <div className="mx-auto max-w-2xl px-4 py-6 min-[768px]:px-6">
        <div className="rounded-card bg-gradient-to-br from-secondary/10 to-primary/10 p-5">
          <Icon className="size-7 text-secondary" />
          <h1 className="mt-4 text-2xl font-bold">{content.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {content.description}
          </p>
        </div>
        <div className="mt-6 divide-y divide-border rounded-card border border-border">
          {["Account controls", "Data & permissions", "Contact support"].map(
            (item) => (
              <button
                type="button"
                key={item}
                className="flex h-14 w-full items-center gap-3 px-4 text-sm font-semibold"
              >
                <ShieldCheck className="size-4 text-secondary" />
                {item}
                <ChevronRight className="ml-auto size-4 text-muted" />
              </button>
            ),
          )}
        </div>
      </div>
    </AppShell>
  );
}
