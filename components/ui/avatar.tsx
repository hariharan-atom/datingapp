import Image from "next/image";

import { cn } from "@/utils/cn";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  online?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt,
  size = "md",
  ring,
  online,
  className,
}: AvatarProps) {
  const sizes = {
    sm: "size-10",
    md: "size-12",
    lg: "size-16",
    xl: "size-24",
  };
  const framedSizes = {
    sm: "size-11",
    md: "size-[52px]",
    lg: "size-[68px]",
    xl: "size-[100px]",
  };
  const framed = ring || online;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-visible",
        framed ? framedSizes[size] : sizes[size],
        framed &&
          "rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-[2px]",
        className,
      )}
    >
      <span
        className={cn(
          "relative block size-full overflow-hidden rounded-full",
          framed && "border-[3px] border-white bg-white",
        )}
      >
        <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />
      </span>
      {online && (
        <span
          className={cn(
            "absolute -right-0.5 z-20 rounded-full border-[3px] border-white bg-success shadow-sm",
            size === "lg" || size === "xl"
              ? "bottom-1 size-4"
              : "bottom-0 size-3.5",
          )}
        />
      )}
    </span>
  );
}
