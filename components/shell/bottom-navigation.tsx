"use client";

import { motion } from "framer-motion";
import {
  Compass,
  Home,
  MessageCircle,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/discover", icon: Compass },
  { label: "Groups", href: "/groups", icon: UsersRound },
  { label: "Messages", href: "/messages", icon: MessageCircle, badge: 2 },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[1024px] px-3 pb-3">
      <div className="glass grid h-[74px] grid-cols-5 rounded-[26px] border border-white/80 px-1 shadow-float">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.href}
              className="relative flex min-w-0 flex-col items-center justify-center gap-1"
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  transition={{ type: "spring", stiffness: 480, damping: 35 }}
                  className="absolute top-2 h-10 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_8px_20px_rgba(255,77,109,0.28)]"
                />
              )}
              <motion.span
                animate={{ scale: active ? 1.08 : 1 }}
                className="relative z-10"
              >
                <Icon
                  className={cn(
                    "size-5 transition-colors",
                    active ? "text-white" : "text-muted",
                  )}
                  fill={
                    active && item.label === "Home" ? "currentColor" : "none"
                  }
                />
                {!!item.badge && !active && (
                  <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-white">
                    {item.badge}
                  </span>
                )}
              </motion.span>
              <span
                className={cn(
                  "relative z-10 max-w-full truncate text-[10px] font-semibold",
                  active ? "text-primary" : "text-muted",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
