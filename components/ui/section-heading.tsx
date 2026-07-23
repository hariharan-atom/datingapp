import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  action = "See all",
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-[-0.025em] text-ink">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="mb-0.5 inline-flex items-center text-sm font-semibold text-primary"
        >
          {action}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
