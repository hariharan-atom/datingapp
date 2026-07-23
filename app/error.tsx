"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="safe-top grid min-h-dvh place-items-center bg-white px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-card bg-red-50 text-danger">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Something didn’t feel right</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your data is safe. Try this screen again, or return to it in a moment.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-3 break-words rounded-2xl bg-surface p-3 text-left text-[10px] text-muted">
            {error.message}
          </p>
        )}
        <Button onClick={reset} className="mt-6">
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
