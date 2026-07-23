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
      <Image
        src={src}
        alt={alt}
        fill
        sizes="96px"
        className="rounded-full object-cover"
      />
      {online && (
        <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-[3px] border-white bg-success" />
      )}
    </span>
  );
}
