"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/domain";

interface MatchOverlayProps {
  profile: Profile | null;
  currentProfile?: Profile | null;
  chatId?: string | null;
  chatPending?: boolean;
  onClose: () => void;
}

export function MatchOverlay({
  profile,
  currentProfile,
  chatId,
  chatPending,
  onClose,
}: MatchOverlayProps) {
  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_top,#60A5FA_0%,#2563EB_42%,#0EA5E9_120%)] px-6 text-white"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.span
              key={index}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
              transition={{
                duration: 3 + (index % 3),
                repeat: Infinity,
                delay: index * 0.16,
              }}
              className="absolute top-0 text-xl"
              style={{ left: `${6 + index * 8}%` }}
            >
              {index % 2 ? "✦" : "♥"}
            </motion.span>
          ))}
          <button
            type="button"
            aria-label="Close match"
            onClick={onClose}
            className="absolute right-5 top-[calc(20px+var(--safe-top))] grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur"
          >
            <X className="size-5" />
          </button>
          <div className="relative z-10 w-full max-w-sm text-center">
            <motion.div
              initial={{ scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <Sparkles className="mx-auto mb-3 size-8 text-accent" />
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75">
                It’s mutual
              </p>
              <h2 className="mt-2 text-5xl font-black tracking-[-0.06em]">
                It’s a match!
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/80">
                You and {profile.name} liked each other. Start with something
                genuine.
              </p>
            </motion.div>
            <div className="relative mx-auto my-8 flex h-36 w-60 items-center justify-center">
              <div className="absolute left-5 size-32 -rotate-6 overflow-hidden rounded-full border-4 border-white shadow-float">
                <Image
                  src={
                    currentProfile?.photo || "/images/profiles/placeholder.svg"
                  }
                  alt={
                    currentProfile
                      ? `${currentProfile.name}'s profile`
                      : "Your profile"
                  }
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute right-5 size-32 rotate-6 overflow-hidden rounded-full border-4 border-white shadow-float">
                <Image
                  src={profile.photo}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="bg-white/12 rounded-card p-4 text-left backdrop-blur-xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                <Sparkles className="size-4 text-accent" />
                AI icebreaker
              </p>
              <p className="mt-2 text-sm leading-6">
                “Your {profile.interests[0].toLowerCase()} recommendation could
                decide our first date. What’s your most underrated pick?”
              </p>
            </div>
            <div className="mt-5">
              {chatPending ? (
                <Button
                  fullWidth
                  size="lg"
                  loading
                  aria-label="Preparing your chat"
                  className="bg-white text-primary shadow-float hover:bg-white"
                />
              ) : (
                <Link href={chatId ? `/messages/${chatId}` : "/messages"}>
                  <Button
                    fullWidth
                    size="lg"
                    className="bg-white text-primary shadow-float hover:bg-white"
                  >
                    <MessageCircle className="size-5" />
                    Say hello
                  </Button>
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 text-sm font-semibold text-white/80"
            >
              Keep discovering
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
