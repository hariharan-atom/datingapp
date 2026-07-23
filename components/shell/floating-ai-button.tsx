"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function FloatingAiButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", delay: 0.35 }}
      whileHover={{ y: -2 }}
      className="fixed bottom-[104px] right-5 z-30 min-[768px]:right-8"
    >
      <Link
        href="/ai"
        aria-label="Open The Atom AI"
        className="relative grid size-14 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary via-[#3B82F6] to-secondary text-white shadow-glow"
      >
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute inset-1 rounded-full border border-dashed border-white/35"
        />
        <Sparkles className="relative size-6" />
      </Link>
    </motion.div>
  );
}
