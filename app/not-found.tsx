import { Compass, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="safe-top grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,#fff0f3,#fff_55%)] px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-[28px] bg-white text-primary shadow-soft">
          <Compass className="size-8" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
          This connection wandered off.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The page may have moved, but your matches and conversations are right
          where you left them.
        </p>
        <Link href="/home" className="mt-6 block">
          <Button fullWidth>
            <Home className="size-4" />
            Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
