import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-card bg-primary-soft text-primary">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      {action && (
        <Button variant="soft" className="mt-6" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
