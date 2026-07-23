"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
}

const goals = ["Long-term", "Life partner", "Dating", "Open to exploring"];
const filters = ["Verified only", "Recently active", "Doesn’t smoke"];

export function FilterSheet({ open, onClose }: FilterSheetProps) {
  const [distance, setDistance] = useState(25);
  const [selectedGoal, setSelectedGoal] = useState("Long-term");
  const [selectedFilters, setSelectedFilters] = useState(["Verified only"]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Discovery preferences"
      description="Fine-tune who you see. You can change these anytime."
    >
      <div className="space-y-7">
        <section>
          <div className="mb-3 flex justify-between text-sm font-semibold">
            <span>Age range</span>
            <span className="text-primary">24 – 34</span>
          </div>
          <div className="relative h-2 rounded-full bg-border">
            <div className="absolute left-[22%] right-[30%] h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
            <span className="absolute left-[20%] top-1/2 size-5 -translate-y-1/2 rounded-full border-4 border-white bg-primary shadow-soft" />
            <span className="absolute right-[28%] top-1/2 size-5 -translate-y-1/2 rounded-full border-4 border-white bg-secondary shadow-soft" />
          </div>
        </section>
        <section>
          <div className="mb-3 flex justify-between text-sm font-semibold">
            <span>Maximum distance</span>
            <span className="text-primary">{distance} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={distance}
            onChange={(event) => setDistance(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-primary"
          />
        </section>
        <section>
          <p className="mb-3 text-sm font-semibold">Relationship goal</p>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <Chip
                key={goal}
                active={selectedGoal === goal}
                onClick={() => setSelectedGoal(goal)}
              >
                {goal}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <p className="mb-3 text-sm font-semibold">More preferences</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Chip
                key={filter}
                active={selectedFilters.includes(filter)}
                onClick={() =>
                  setSelectedFilters((current) =>
                    current.includes(filter)
                      ? current.filter((item) => item !== filter)
                      : [...current, filter],
                  )
                }
              >
                {filter}
              </Chip>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-[auto_1fr] gap-3 pt-2">
          <Button
            variant="ghost"
            className="px-4"
            onClick={() => {
              setDistance(25);
              setSelectedGoal("Long-term");
              setSelectedFilters([]);
            }}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button
            onClick={() => {
              toast.success("Preferences updated");
              onClose();
            }}
          >
            Show matches
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
