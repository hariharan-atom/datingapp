"use client";

import { motion } from "framer-motion";

import { cn } from "@/utils/cn";

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({
  children,
  active,
  onClick,
  icon,
  className,
}: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? Boolean(active) : undefined}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-medium text-muted transition-colors",
        active &&
          "border-primary bg-primary text-white shadow-[0_8px_22px_rgba(37,99,235,0.24)]",
        className,
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
