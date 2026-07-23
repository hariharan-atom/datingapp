"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-[#60A5FA] text-white shadow-glow hover:from-primary-hover hover:to-primary",
  secondary: "bg-secondary text-white shadow-soft",
  soft: "bg-primary-soft text-primary",
  ghost: "bg-transparent text-ink hover:bg-surface",
  danger: "bg-red-50 text-danger",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm rounded-[14px]",
  md: "h-12 px-5 text-sm rounded-button",
  lg: "h-14 px-6 text-base rounded-button",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      disabled,
      ...props
    },
    ref,
  ) => (
    <motion.button
      ref={ref}
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : children}
    </motion.button>
  ),
);

Button.displayName = "Button";
