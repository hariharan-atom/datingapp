"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]"
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 34 }}
            className="safe-bottom fixed inset-x-0 bottom-0 z-[60] mx-auto max-h-[88dvh] max-w-[1024px] overflow-y-auto rounded-t-sheet bg-white px-5 pb-6 shadow-float"
          >
            <div className="sticky top-0 z-10 -mx-5 mb-5 bg-white/95 px-5 pb-3 pt-3 backdrop-blur-xl">
              <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-border" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                  {description && (
                    <p className="mt-1 text-sm leading-5 text-muted">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-surface"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            {children}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
