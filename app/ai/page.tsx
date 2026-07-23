"use client";

import { motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  CalendarHeart,
  Camera,
  HeartHandshake,
  Lightbulb,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Chip } from "@/components/ui/chip";

const tools = [
  {
    icon: WandSparkles,
    title: "Improve my profile",
    description: "Bio, prompts, missing details",
    prompt: "Help me improve my dating profile",
    color: "bg-primary-soft text-primary",
  },
  {
    icon: MessageCircleHeart,
    title: "Conversation coach",
    description: "Replies, starters, tone",
    prompt: "Help me with a conversation",
    color: "bg-violet-50 text-secondary",
  },
  {
    icon: CalendarHeart,
    title: "Plan a date",
    description: "Ideas based on both of you",
    prompt: "Plan a thoughtful date nearby",
    color: "bg-amber-50 text-warning",
  },
  {
    icon: HeartHandshake,
    title: "Compatibility",
    description: "Understand your shared fit",
    prompt: "Explain our compatibility",
    color: "bg-emerald-50 text-success",
  },
  {
    icon: Camera,
    title: "Photo feedback",
    description: "Clarity, variety, authenticity",
    prompt: "Review my profile photo mix",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Safety check",
    description: "Spot pressure or red flags",
    prompt: "Help me evaluate a safety concern",
    color: "bg-red-50 text-danger",
  },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text = draft) => {
    if (!text.trim()) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setDraft("");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        text: "I can help with that. I’ll use only the profile and conversation details you choose to share, explain why I’m suggesting something, and keep you in control of the final choice.",
      },
    ]);
    setLoading(false);
  };

  return (
    <AppShell title="Milo AI" back hideNav hideAi>
      <div className="flex min-h-[calc(100dvh-60px-var(--safe-top))] flex-col">
        <div className="flex-1 px-4 py-5 min-[768px]:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative mx-auto grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-primary via-[#e85da7] to-secondary text-white shadow-glow"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 14,
                    ease: "linear",
                  }}
                  className="absolute inset-2 rounded-full border border-dashed border-white/30"
                />
                <Sparkles className="relative size-8" />
              </motion.div>
              <h1 className="mt-5 text-balance text-center text-3xl font-bold tracking-[-0.045em]">
                Thoughtful help, never autopilot.
              </h1>
              <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-muted">
                Milo can help you express yourself, plan better dates, and
                notice safety concerns. You always make the call.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 min-[768px]:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={tool.title}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => void send(tool.prompt)}
                      className="rounded-card border border-border p-4 text-left shadow-soft"
                    >
                      <span
                        className={`grid size-10 place-items-center rounded-2xl ${tool.color}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="mt-3 block text-sm font-bold">
                        {tool.title}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-muted">
                        {tool.description}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-card bg-surface p-4">
                <Lightbulb className="mt-0.5 size-5 shrink-0 text-warning" />
                <p className="text-xs leading-5 text-muted">
                  AI compatibility and reply probability are estimates—not facts
                  about another person’s feelings or intent.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <span className="mr-2 grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                      <Bot className="size-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-ink text-white"
                        : "rounded-bl-md border border-border bg-white shadow-soft"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-1 pl-10">
                  {[0, 1, 2].map((item) => (
                    <motion.span
                      key={item}
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: item * 0.12,
                      }}
                      className="size-1.5 rounded-full bg-secondary"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="safe-bottom sticky bottom-0 border-t border-border bg-white/90 px-4 pb-3 pt-2 backdrop-blur-xl min-[768px]:px-6">
          <div className="scrollbar-none mx-auto mb-2 flex max-w-2xl gap-2 overflow-x-auto">
            {["Shorter", "More natural", "Explain why"].map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <label className="flex min-h-12 flex-1 items-center rounded-[22px] border border-border bg-surface px-4 focus-within:border-secondary/30 focus-within:bg-white">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder="Ask Milo anything…"
                className="max-h-28 flex-1 resize-none bg-transparent py-3 text-sm outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => void send()}
              aria-label="Send"
              disabled={!draft.trim() || loading}
              className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-primary to-secondary text-white shadow-soft disabled:opacity-40"
            >
              <ArrowUp className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
