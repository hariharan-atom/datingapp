"use client";

import {
  Heart,
  Laugh,
  MessageSquareText,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useState } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface AiReplySheetProps {
  open: boolean;
  onClose: () => void;
  onUse: (reply: string) => void;
}

const tones = [
  { label: "Natural", icon: MessageSquareText },
  { label: "Funny", icon: Laugh },
  { label: "Cute", icon: Sparkles },
  { label: "Romantic", icon: Heart },
];

const replies = [
  "That sounds like exactly my kind of plan. What’s the one thing I should order there?",
  "You had me at Cubbon Park—and fully won me over with coffee 🌿",
  "Deal. I’ll bring the good conversation if you promise an elite coffee recommendation.",
];

export function AiReplySheet({ open, onClose, onUse }: AiReplySheetProps) {
  const [tone, setTone] = useState("Natural");

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Reply with your voice"
      description="Milo suggests, you decide. Edit anything before sending."
    >
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-3">
        {tones.map((item) => {
          const Icon = item.icon;
          return (
            <Chip
              key={item.label}
              active={tone === item.label}
              onClick={() => setTone(item.label)}
              icon={<Icon className="size-3.5" />}
            >
              {item.label}
            </Chip>
          );
        })}
      </div>
      <div className="mt-3 space-y-3">
        {replies.map((reply, index) => (
          <button
            type="button"
            key={reply}
            onClick={() => onUse(reply)}
            className="w-full rounded-card border border-border p-4 text-left transition hover:border-secondary/25 hover:bg-secondary/5"
          >
            <p className="text-sm leading-6">{reply}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-secondary">
              <WandSparkles className="size-3.5" />
              Use reply {index + 1}
            </span>
          </button>
        ))}
      </div>
      <Button variant="ghost" fullWidth className="mt-4">
        <Sparkles className="size-4" />
        Generate three more
      </Button>
    </BottomSheet>
  );
}
