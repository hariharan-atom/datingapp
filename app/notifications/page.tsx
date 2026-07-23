"use client";

import {
  Bell,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { profiles } from "@/utils/mock-data";

const notifications = [
  {
    id: 1,
    type: "match",
    icon: Heart,
    color: "bg-primary-soft text-primary",
    title: "You and Ananya matched!",
    body: "You both liked each other. Say something genuine.",
    time: "2m",
    profile: profiles[0],
    href: "/messages/chat-ananya",
    unread: true,
  },
  {
    id: 2,
    type: "message",
    icon: MessageCircle,
    color: "bg-secondary/10 text-secondary",
    title: "New message from Meera",
    body: "I’ll send you the exhibit link!",
    time: "18m",
    profile: profiles[2],
    href: "/messages/chat-meera",
    unread: true,
  },
  {
    id: 3,
    type: "nearby",
    icon: MapPin,
    color: "bg-emerald-50 text-success",
    title: "A new event is close by",
    body: "Slow Dating Social is happening 1.8 km away.",
    time: "1h",
    href: "/events",
  },
  {
    id: 4,
    type: "group",
    icon: UsersRound,
    color: "bg-amber-50 text-warning",
    title: "Weekend Trekkers",
    body: "Meera posted a new Saturday meetup.",
    time: "3h",
    href: "/groups/weekend-trekkers",
  },
  {
    id: 5,
    type: "gift",
    icon: Gift,
    color: "bg-sky-50 text-primary",
    title: "Your gift was accepted",
    body: "Meera accepted your coffee voucher.",
    time: "Yesterday",
    href: "/gifts",
  },
  {
    id: 6,
    type: "safety",
    icon: ShieldCheck,
    color: "bg-blue-50 text-blue-600",
    title: "Verification complete",
    body: "Your identity badge is now visible.",
    time: "2d",
    href: "/profile",
  },
];

export default function NotificationsPage() {
  return (
    <AppShell title="Notifications" back right="profile">
      <div className="px-4 pt-3 min-[768px]:px-6">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-3">
          <Chip active>All</Chip>
          <Chip>Matches</Chip>
          <Chip>Messages</Chip>
          <Chip>Groups</Chip>
        </div>
      </div>
      <div className="mt-2">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <Link
              href={notification.href}
              key={notification.id}
              className={`relative flex items-start gap-3 border-b border-border/70 px-4 py-4 min-[768px]:px-6 ${
                notification.unread ? "bg-primary/[0.025]" : ""
              }`}
            >
              {notification.profile ? (
                <Avatar
                  src={notification.profile.photo}
                  alt={notification.profile.name}
                  size="md"
                  online={notification.profile.online}
                />
              ) : (
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-[18px] ${notification.color}`}
                >
                  <Icon className="size-5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <h2 className="text-sm font-bold">{notification.title}</h2>
                  <span className="ml-auto shrink-0 text-[10px] text-muted">
                    {notification.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted">
                  {notification.body}
                </p>
              </div>
              {notification.unread && (
                <span className="absolute right-4 top-10 size-2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="mx-4 mt-6 flex gap-3 rounded-card bg-surface p-4 min-[768px]:mx-6">
        <Bell className="size-5 shrink-0 text-secondary" />
        <p className="text-xs leading-5 text-muted">
          You’re all caught up. Fine-tune notification types in Settings.
        </p>
      </div>
    </AppShell>
  );
}
