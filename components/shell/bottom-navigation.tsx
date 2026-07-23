"use client";

import { motion } from "framer-motion";
import {
  Compass,
  Home,
  ShoppingBag,
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
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-[max(4px,calc(var(--safe-bottom)-10px))] z-40 mx-auto max-w-[1024px] px-3">
      <div className="glass grid h-16 grid-cols-5 rounded-[26px] border border-white/80 px-1 shadow-float">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.href}
              className="relative grid min-w-0 place-items-center"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  transition={{ type: "spring", stiffness: 480, damping: 35 }}
                  className="absolute size-12 rounded-[17px] bg-gradient-to-br from-primary to-secondary shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
                />
              )}
              <motion.span
                animate={{ scale: active ? 1.08 : 1 }}
                className="relative z-10 grid size-12 place-items-center"
              >
                <Icon
                  className={cn(
                    "size-[22px] transition-colors",
                    active ? "text-white" : "text-muted",
                  )}
                  fill="none"
                  strokeWidth={active ? 2.25 : 2}
                />
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
