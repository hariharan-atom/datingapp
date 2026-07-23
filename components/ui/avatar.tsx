import Image from "next/image";

import { cn } from "@/utils/cn";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt,
  size = "md",
  online,
  className,
}: AvatarProps) {
  const sizes = {
    sm: "size-10",
    md: "size-12",
    lg: "size-16",
    xl: "size-24",
  };

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-visible",
        sizes[size],
        className,
      )}
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 z-10 size-3.5 rounded-full border-[3px] border-white bg-success shadow-sm" />
      )}
    </span>
  );
}
