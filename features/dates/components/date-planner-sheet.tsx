"use client";

import {
  Bike,
  Coffee,
  IndianRupee,
  MapPin,
  Navigation,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface DatePlannerSheetProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  { label: "Coffee", icon: Coffee },
  { label: "Dinner", icon: Utensils },
  { label: "Activity", icon: Bike },
];

const places = [
  {
    name: "Green Theory",
    type: "Garden cafe",
    rating: "4.6",
    distance: "1.4 km",
    cost: "₹800 for two",
    open: true,
  },
  {
    name: "Dyu Art Cafe",
    type: "Art cafe",
    rating: "4.5",
    distance: "2.1 km",
    cost: "₹600 for two",
    open: true,
  },
];

export function DatePlannerSheet({ open, onClose }: DatePlannerSheetProps) {
  const [category, setCategory] = useState("Coffee");

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Plan a thoughtful date"
      description="Suggestions use your shared interests, budget, and travel distance."
    >
      <div className="rounded-card bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
          <Sparkles className="size-4" />
          Best fit for both of you
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Quiet coffee spots with outdoor seating match your shared love for
          design, conversation, and parks.
        </p>
      </div>
      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <Chip
              key={item.label}
              active={category === item.label}
              onClick={() => setCategory(item.label)}
              icon={<Icon className="size-3.5" />}
            >
              {item.label}
            </Chip>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] bg-surface p-4">
          <p className="text-xs text-muted">Your budget</p>
          <p className="mt-1 flex items-center text-sm font-bold">
            <IndianRupee className="size-4" />
            500 – 1,200
          </p>
        </div>
        <div className="rounded-[20px] bg-surface p-4">
          <p className="text-xs text-muted">Travel radius</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-bold">
            <MapPin className="size-4" />5 km
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {places.map((place, index) => (
          <article
            key={place.name}
            className="rounded-card border border-border p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{place.name}</h3>
                  {index === 0 && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-black uppercase text-primary">
                      Best match
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {place.type} · ★ {place.rating}
                </p>
              </div>
              <span className="text-xs font-bold text-success">Open now</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>{place.distance} away</span>
              <span>{place.cost}</span>
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <Button
                variant="soft"
                onClick={() => toast.success(`${place.name} sent to chat`)}
              >
                Suggest this place
              </Button>
              <Button variant="ghost" className="px-4">
                <Navigation className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </BottomSheet>
  );
}
