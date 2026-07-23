"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";

interface NativeHeaderProps {
  title: string;
  back?: boolean;
  right?: "notifications" | "search" | "filters" | "profile" | "safety";
  onRightClick?: () => void;
  subtitle?: string;
}

export function NativeHeader({
  title,
  back,
  right = "notifications",
  onRightClick,
  subtitle,
}: NativeHeaderProps) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => setCompact(value > 12));

  const icon = {
    notifications: Bell,
    search: Search,
    filters: SlidersHorizontal,
    safety: ShieldCheck,
    profile: Bell,
  }[right];
  const RightIcon = icon;

  return (
    <motion.header
      animate={{ boxShadow: compact ? "0 1px 0 #ECECEC" : "0 0 0 #FFFFFF" }}
      className="safe-top sticky top-0 z-40 bg-white/80 backdrop-blur-2xl"
    >
      <div className="grid h-[60px] grid-cols-[48px_1fr_48px] items-center px-4">
        <div>
          {back ? (
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.back()}
              className="grid size-10 place-items-center rounded-2xl bg-surface"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <span className="grid size-10 place-items-center rounded-[15px] bg-gradient-to-br from-primary to-secondary text-base font-bold text-white shadow-soft">
              A
            </span>
          )}
        </div>
        <motion.div
          animate={{ y: compact ? -1 : 0 }}
          className="min-w-0 text-center"
        >
          <h1 className="truncate text-[17px] font-bold tracking-[-0.02em]">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[11px] font-medium text-muted">
              {subtitle}
            </p>
          )}
        </motion.div>
        <div className="flex justify-end">
          {right === "profile" ? (
            <button
              type="button"
              onClick={onRightClick}
              aria-label="Open profile"
            >
              <Avatar
                src="/images/profiles/kabir.webp"
                alt="Your profile"
                size="sm"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={
                onRightClick ??
                (() =>
                  router.push(
                    right === "notifications"
                      ? "/notifications"
                      : right === "search"
                        ? "/search"
                        : "/settings/safety",
                  ))
              }
              aria-label={right}
              className="relative grid size-10 place-items-center rounded-2xl bg-surface"
            >
              <RightIcon className="size-[19px]" />
              {right === "notifications" && (
                <span className="absolute right-2 top-2 size-2 rounded-full border border-white bg-primary" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
