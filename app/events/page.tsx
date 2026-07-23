"use client";

import dynamic from "next/dynamic";
import { CalendarDays, Map, MapPin, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { events } from "@/utils/mock-data";

const EventsMap = dynamic(
  () => import("@/features/events/components/events-map"),
  {
    ssr: false,
    loading: () => <div className="h-full animate-pulse bg-surface" />,
  },
);

export default function EventsPage() {
  const [view, setView] = useState<"list" | "map">("list");
  const [category, setCategory] = useState("All");

  return (
    <AppShell title="Nearby events" back right="search">
      <div className="px-4 pt-3 min-[768px]:px-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Chip active={view === "list"} onClick={() => setView("list")}>
              List
            </Chip>
            <Chip
              active={view === "map"}
              onClick={() => setView("map")}
              icon={<Map className="size-4" />}
            >
              Map
            </Chip>
          </div>
          <p className="flex items-center gap-1 text-xs font-semibold text-muted">
            <MapPin className="size-3.5 text-primary" />
            Indiranagar
          </p>
        </div>
        <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 min-[768px]:-mx-6 min-[768px]:px-6">
          {["All", "Dating", "Coffee", "Gaming", "Networking"].map((item) => (
            <Chip
              key={item}
              active={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </Chip>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className="mx-4 mt-4 h-[calc(100dvh-260px)] overflow-hidden rounded-card border border-border shadow-soft min-[768px]:mx-6">
          <EventsMap />
        </div>
      ) : (
        <div className="space-y-4 px-4 py-5 min-[768px]:grid min-[768px]:grid-cols-2 min-[768px]:gap-4 min-[768px]:space-y-0 min-[768px]:px-6">
          {events
            .filter(
              (event) => category === "All" || event.category === category,
            )
            .map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-card border border-border bg-white shadow-soft"
              >
                <div
                  className={`relative bg-gradient-to-br ${event.gradient} p-5 text-white`}
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {event.category}
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold">
                      {event.distanceKm} km
                    </span>
                  </div>
                  <h2 className="mt-7 text-2xl font-bold">{event.title}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                    <CalendarDays className="size-4" />
                    {event.date}
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{event.venue}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <UsersRound className="size-3.5" />
                        {event.attendees} people going
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => toast.success("You’re going!")}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}
    </AppShell>
  );
}
