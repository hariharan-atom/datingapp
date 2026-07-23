"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService } from "@/services/notifications";

function relativeTime(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(elapsed / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
  });
  const readMutation = useMutation({
    mutationFn: (id?: string) => notificationService.markRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const notifications = notificationsQuery.data ?? [];

  return (
    <AppShell title="Notifications" back right="profile">
      <div className="flex items-center justify-between px-4 pb-2 pt-3 min-[768px]:px-6">
        <p className="text-sm font-bold">
          {notifications.filter((item) => item.unread).length} unread
        </p>
        {notifications.some((item) => item.unread) && (
          <button
            type="button"
            onClick={() => readMutation.mutate(undefined)}
            className="text-xs font-bold text-primary"
          >
            Mark all read
          </button>
        )}
      </div>
      {notificationsQuery.isLoading ? (
        <div className="space-y-3 px-4 py-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-20 rounded-card" />
          ))}
        </div>
      ) : notificationsQuery.isError ? (
        <EmptyState
          icon={Bell}
          title="Notifications are unavailable"
          description="Check your connection and try again."
          action="Try again"
          onAction={() => void notificationsQuery.refetch()}
        />
      ) : notifications.length ? (
        <div className="mt-2">
          {notifications.map((notification) => {
            const Icon = notification.type === "match" ? Heart : MessageCircle;
            return (
              <Link
                href={notification.href}
                key={notification.id}
                onClick={() => {
                  if (notification.unread) readMutation.mutate(notification.id);
                }}
                className={`relative flex items-start gap-3 border-b border-border/70 px-4 py-4 min-[768px]:px-6 ${
                  notification.unread ? "bg-primary/[0.035]" : ""
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
                  <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <h2 className="text-sm font-bold">{notification.title}</h2>
                    <span className="ml-auto shrink-0 text-[10px] text-muted">
                      {relativeTime(notification.createdAt)}
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
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Likes, matches, and messages will appear here."
        />
      )}
    </AppShell>
  );
}
