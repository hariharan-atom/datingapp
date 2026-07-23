"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Bookmark,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import { useAppStore } from "@/store/app-store";
import type { Profile } from "@/types/domain";
import { cn } from "@/utils/cn";

interface ProfileCardProps {
  profile: Profile;
  compact?: boolean;
  swipeable?: boolean;
  onPass?: () => void;
  onLike?: () => void;
}

export function ProfileCard({
  profile,
  compact,
  swipeable = false,
  onPass,
  onLike,
}: ProfileCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [20, 130], [0, 1]);
  const passOpacity = useTransform(x, [-130, -20], [1, 0]);
  const [dragging, setDragging] = useState(false);
  const { bookmarkedProfiles, toggleBookmark, addLike } = useAppStore();
  const saved = bookmarkedProfiles.includes(profile.id);

  const like = () => {
    addLike(profile.id);
    toast.success(`You liked ${profile.name}`, {
      description: "We’ll let you know if it’s a match.",
    });
    onLike?.();
  };

  if (compact) {
    return (
      <Link
        href={`/discover/${profile.id}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-card bg-surface shadow-soft"
      >
        <Image
          src={profile.photo}
          alt={`${profile.name}'s profile`}
          fill
          sizes="(max-width: 767px) 48vw, 32vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-12 text-white">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-bold">
              {profile.name}, {profile.age}
            </h3>
            {profile.verified && (
              <ShieldCheck className="size-4 fill-white text-secondary" />
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
            <MapPin className="size-3" />
            {profile.distanceKm} km away
          </p>
        </div>
        {profile.online && (
          <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[10px] font-bold text-success backdrop-blur">
            Online
          </span>
        )}
      </Link>
    );
  }

  return (
    <motion.article
      style={swipeable ? { x, rotate } : undefined}
      drag={swipeable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        if (info.offset.x > 110) like();
        if (info.offset.x < -110) onPass?.();
      }}
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-white shadow-float",
        dragging && "cursor-grabbing",
      )}
    >
      <Link
        href={`/discover/${profile.id}`}
        className="relative block aspect-[4/5] min-h-[440px] overflow-hidden"
        onClick={(event) => dragging && event.preventDefault()}
      >
        <Image
          src={profile.photo}
          alt={`${profile.name}, ${profile.age}`}
          fill
          priority={profile.id === "ananya"}
          sizes="(max-width: 767px) 100vw, 55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/5" />
        {swipeable && (
          <>
            <motion.span
              style={{ opacity: likeOpacity }}
              className="absolute left-5 top-6 rotate-[-8deg] rounded-xl border-2 border-success bg-white/85 px-4 py-2 text-lg font-black uppercase tracking-widest text-success backdrop-blur"
            >
              Like
            </motion.span>
            <motion.span
              style={{ opacity: passOpacity }}
              className="absolute right-5 top-6 rotate-[8deg] rounded-xl border-2 border-danger bg-white/85 px-4 py-2 text-lg font-black uppercase tracking-widest text-danger backdrop-blur"
            >
              Pass
            </motion.span>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="mb-3 flex items-center gap-2">
            {profile.online && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
                <span className="mr-1.5 inline-block size-2 rounded-full bg-success" />
                Online now
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
              <Sparkles className="size-3 text-accent" />
              {profile.compatibility}% match
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-[30px] font-bold tracking-[-0.04em]">
              {profile.name}, {profile.age}
            </h2>
            {profile.verified && (
              <ShieldCheck className="size-6 fill-secondary text-white" />
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="size-4" />
            {profile.distanceKm} km away · {profile.occupation}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-center gap-3 bg-white px-4 py-4">
        <IconButton
          icon={X}
          label="Pass"
          onClick={onPass}
          size="md"
          className="text-muted"
        />
        <IconButton
          icon={Star}
          label="Super like"
          size="lg"
          className="border-secondary/10 bg-secondary/10 text-secondary shadow-none"
          onClick={() => toast.success(`Super liked ${profile.name}`)}
        />
        <IconButton
          icon={Heart}
          label="Like"
          onClick={like}
          size="lg"
          className="border-0 bg-gradient-to-br from-primary to-[#60A5FA] text-white shadow-glow"
        />
        <IconButton
          icon={Bookmark}
          label="Bookmark"
          size="md"
          active={saved}
          onClick={() => toggleBookmark(profile.id)}
        />
      </div>
    </motion.article>
  );
}
