"use client";

import { motion } from "framer-motion";
import {
  Camera,
  CameraOff,
  ChevronLeft,
  Mic,
  MicOff,
  PhoneOff,
  RotateCw,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { profiles } from "@/utils/mock-data";

export default function CallPage() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const video = params.type === "video";
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(video);
  const profile = profiles[0];

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#15131f] text-white">
      {video && camera ? (
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          priority
          className="object-cover opacity-75"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#493d70,#15131f_60%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75" />
      <header className="safe-top relative z-10 flex h-[72px] items-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid size-11 place-items-center rounded-full bg-black/20 backdrop-blur"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
      </header>
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5">
        {!video || !camera ? (
          <div className="relative size-36 overflow-hidden rounded-full border-4 border-white/20 shadow-float">
            <Image
              src={profile.photo}
              alt={profile.name}
              fill
              className="object-cover"
            />
            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="absolute inset-0 rounded-full border-2 border-primary/50"
            />
          </div>
        ) : null}
        <h1 className="mt-6 text-3xl font-bold">{profile.name}</h1>
        <p className="mt-2 text-sm text-white/65">
          {video ? "Video calling…" : "Voice calling…"}
        </p>
        <div className="mt-3 flex gap-1">
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: item * 0.15,
              }}
              className="size-1.5 rounded-full bg-success"
            />
          ))}
        </div>
      </main>
      <footer className="safe-bottom relative z-10 px-5 pb-8">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-5">
          <CallControl
            active={muted}
            label={muted ? "Unmute" : "Mute"}
            onClick={() => setMuted((value) => !value)}
            icon={muted ? MicOff : Mic}
          />
          {video ? (
            <CallControl
              active={!camera}
              label={camera ? "Camera off" : "Camera on"}
              onClick={() => setCamera((value) => !value)}
              icon={camera ? Camera : CameraOff}
            />
          ) : (
            <CallControl label="Speaker" icon={Volume2} />
          )}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="End call"
            className="grid size-16 place-items-center rounded-full bg-danger shadow-[0_12px_32px_rgba(239,68,68,.38)]"
          >
            <PhoneOff className="size-6" fill="currentColor" />
          </button>
          {video && <CallControl label="Flip" icon={RotateCw} />}
        </div>
        <p className="mt-5 text-center text-[10px] text-white/45">
          Calls are end-to-end media encrypted when the WebRTC provider is
          connected.
        </p>
      </footer>
    </div>
  );
}

function CallControl({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Mic;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid size-[52px] place-items-center rounded-full backdrop-blur ${
        active ? "bg-white text-ink" : "bg-white/15 text-white"
      }`}
    >
      <Icon className="size-5" />
    </button>
  );
}
