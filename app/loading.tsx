import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="safe-top min-h-dvh bg-white">
      <div className="flex h-[60px] items-center justify-between px-4">
        <Skeleton className="size-10 rounded-2xl" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-10 rounded-2xl" />
      </div>
      <div className="space-y-5 px-4 pt-4 min-[768px]:px-6">
        <Skeleton className="h-12 w-full rounded-input" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-[28px]" />
      </div>
    </div>
  );
}
