"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/utils/cn";

interface SearchFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchField({
  value = "",
  onChange,
  placeholder = "Search",
  onFilter,
  className,
  autoFocus,
}: SearchFieldProps) {
  return (
    <label
      className={cn(
        "flex h-[52px] items-center gap-3 rounded-input border border-border bg-surface px-4 transition focus-within:border-secondary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary/5",
        className,
      )}
    >
      <Search className="size-5 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange?.("")}
          className="grid size-7 place-items-center rounded-full bg-border text-muted"
        >
          <X className="size-3.5" />
        </button>
      )}
      {onFilter && (
        <button
          type="button"
          aria-label="Open filters"
          onClick={onFilter}
          className="grid size-8 place-items-center rounded-xl bg-white text-ink shadow-sm"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      )}
    </label>
  );
}
