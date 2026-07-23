"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  badge?: number;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  className,
  badge,
  size = "md",
  active,
}: IconButtonProps) {
  const sizes = {
    sm: "size-9 rounded-[14px]",
    md: "size-11 rounded-2xl",
    lg: "size-14 rounded-[20px]",
  };

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "relative grid place-items-center border border-border bg-white text-ink shadow-soft",
        sizes[size],
        active && "border-primary/20 bg-primary-soft text-primary",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-[18px]" : "size-5"} />
      {!!badge && (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-primary px-1 text-[10px] font-bold leading-4 text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </motion.button>
  );
}
