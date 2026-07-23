"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { authService } from "@/services/auth";

interface NativeHeaderProps {
  title: string;
  back?: boolean;
  right?:
    | "notifications"
    | "messages"
    | "search"
    | "filters"
    | "profile"
    | "safety"
    | "logout";
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
  const [signingOut, setSigningOut] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => setCompact(value > 12));

  const icon = {
    notifications: Bell,
    messages: MessageCircle,
    search: Search,
    filters: SlidersHorizontal,
    safety: ShieldCheck,
    profile: Bell,
    logout: LogOut,
  }[right];
  const RightIcon = icon;

  const handleRightClick = async () => {
    if (onRightClick) {
      onRightClick();
      return;
    }

    if (right === "logout") {
      setSigningOut(true);
      try {
        await authService.signOut();
        router.replace("/login");
        router.refresh();
      } catch (error) {
        toast.error("Couldn’t log out", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
        setSigningOut(false);
      }
      return;
    }

    router.push(
      right === "notifications"
        ? "/notifications"
        : right === "messages"
          ? "/messages"
          : right === "search"
            ? "/search"
            : "/settings/safety",
    );
  };

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
              onClick={onRightClick ?? (() => router.push("/profile"))}
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
              onClick={() => void handleRightClick()}
              disabled={signingOut}
              aria-label={right}
              className="relative grid size-10 place-items-center rounded-2xl bg-surface"
            >
              {signingOut ? (
                <LoaderCircle className="size-[19px] animate-spin" />
              ) : (
                <RightIcon className="size-[19px]" />
              )}
              {right === "notifications" && (
                <span className="absolute right-2 top-2 size-2 rounded-full border border-white bg-primary" />
              )}
              {right === "messages" && (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-primary px-1 text-[10px] font-bold leading-4 text-white">
                  2
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
