"use client";

import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
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
import { useRef, useState } from "react";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import { profileService, type ProfileActionResult } from "@/services/profiles";
import type { Profile } from "@/types/domain";
import { cn } from "@/utils/cn";

export type SwipeAction = "like" | "super_like" | "pass";

interface ProfileCardProps {
  profile: Profile;
  compact?: boolean;
  swipeable?: boolean;
  dragX?: MotionValue<number>;
  onSwipeComplete?: (action: SwipeAction) => void;
  onActionError?: (action: SwipeAction) => void;
  onPass?: (result: ProfileActionResult) => void;
  onLike?: (result: ProfileActionResult) => void;
}

export function ProfileCard({
  profile,
  compact,
  swipeable = false,
  dragX,
  onSwipeComplete,
  onActionError,
  onPass,
  onLike,
}: ProfileCardProps) {
  const localX = useMotionValue(0);
  const x = dragX ?? localX;
  const reduceMotion = useReducedMotion();
  const rotate = useTransform(x, [-320, 0, 320], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [24, 145], [0, 1]);
  const passOpacity = useTransform(x, [-145, -24], [1, 0]);
  const actionInFlight = useRef(false);
  const didDrag = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const [acting, setActing] = useState(false);

  const settleAtCenter = () =>
    animate(
      x,
      0,
      reduceMotion
        ? { duration: 0.12 }
        : { type: "spring", stiffness: 460, damping: 34, mass: 0.72 },
    );

  const swipe = async (action: SwipeAction, direction: -1 | 1) => {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setActing(true);
    setDragging(false);

    const exitDistance =
      typeof window === "undefined"
        ? 720
        : Math.max(window.innerWidth * 1.15, 720);

    const request = profileService.act(profile.id, action).then(
      (result) => ({ result, error: null }),
      (error: unknown) => ({ result: null, error }),
    );

    await animate(x, direction * exitDistance, {
      duration: reduceMotion ? 0.1 : 0.18,
      ease: [0.32, 0.72, 0, 1],
    });
    // Reset the shared deck position before React promotes the next card.
    // Resetting it after the profile changes makes the new card flash off-screen.
    x.jump(0);
    onSwipeComplete?.(action);

    const outcome = await request;
    try {
      if (outcome.error || !outcome.result) throw outcome.error;
      const result = outcome.result;
      if (action === "pass") {
        onPass?.(result);
      } else {
        toast.success(
          result.matched
            ? `You matched with ${profile.name}!`
            : action === "super_like"
              ? `You super liked ${profile.name}`
              : `You liked ${profile.name}`,
          {
            description: result.matched
              ? "Start a conversation from Messages."
              : "We’ll let you know if it’s a match.",
          },
        );
        onLike?.(result);
      }
    } catch (error) {
      onActionError?.(action);
      toast.error(
        action === "pass"
          ? "Couldn’t pass this profile"
          : "Couldn’t save your like",
        {
          description:
            error instanceof Error ? error.message : "Please try again.",
        },
      );
    } finally {
      actionInFlight.current = false;
      setActing(false);
    }
  };

  const like = (kind: "like" | "super_like" = "like") => swipe(kind, 1);
  const pass = () => swipe("pass", -1);

  const bookmark = async () => {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    const nextSaved = !saved;
    setSaved(nextSaved);
    setActing(true);
    try {
      await profileService.act(
        profile.id,
        nextSaved ? "bookmark" : "unbookmark",
      );
      toast.success(nextSaved ? "Profile saved" : "Bookmark removed");
    } catch (error) {
      setSaved(!nextSaved);
      toast.error("Couldn’t update the bookmark", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      actionInFlight.current = false;
      setActing(false);
    }
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
            {profile.distanceKm > 0
              ? `${profile.distanceKm} km away`
              : profile.city}
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
      style={
        swipeable
          ? {
              x,
              rotate,
              touchAction: "pan-y",
            }
          : undefined
      }
      drag={swipeable && !acting ? "x" : false}
      dragMomentum={false}
      dragPropagation={false}
      onDragStart={() => {
        didDrag.current = false;
        setDragging(true);
      }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 6) didDrag.current = true;
      }}
      onDragEnd={(_, info) => {
        setDragging(false);
        const projectedOffset = info.offset.x + info.velocity.x * 0.12;
        if (projectedOffset > 65) {
          void like();
        } else if (projectedOffset < -65) {
          void pass();
        } else {
          void settleAtCenter();
        }
      }}
      className={cn(
        "relative transform-gpu select-none overflow-hidden rounded-[28px] bg-white shadow-float will-change-transform",
        dragging && "cursor-grabbing",
        acting && "pointer-events-none",
      )}
    >
      <Link
        href={`/discover/${profile.id}`}
        className="relative block aspect-[4/5] min-h-[440px] overflow-hidden"
        onClick={(event) => {
          if (didDrag.current) {
            event.preventDefault();
            event.stopPropagation();
            didDrag.current = false;
          }
        }}
      >
        <Image
          src={profile.photo}
          alt={`${profile.name}, ${profile.age}`}
          fill
          draggable={false}
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
            {profile.distanceKm > 0
              ? `${profile.distanceKm} km away`
              : profile.city}{" "}
            · {profile.occupation}
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
          onClick={() => void pass()}
          size="md"
          className="text-muted"
          disabled={acting}
        />
        <IconButton
          icon={Star}
          label="Super like"
          size="lg"
          className="border-secondary/10 bg-secondary/10 text-secondary shadow-none"
          onClick={() => void like("super_like")}
          disabled={acting}
        />
        <IconButton
          icon={Heart}
          label="Like"
          onClick={() => void like()}
          size="lg"
          className="border-0 bg-gradient-to-br from-primary to-[#60A5FA] text-white shadow-glow"
          disabled={acting}
        />
        <IconButton
          icon={Bookmark}
          label="Bookmark"
          size="md"
          active={saved}
          onClick={() => void bookmark()}
          disabled={acting}
        />
      </div>
    </motion.article>
  );
}
