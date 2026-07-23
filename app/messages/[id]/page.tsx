"use client";

import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarHeart,
  Camera,
  ChevronLeft,
  Gift,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Phone,
  Plus,
  Send,
  Smile,
  Sparkles,
  Video,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AiReplySheet } from "@/features/chat/components/ai-reply-sheet";
import { DatePlannerSheet } from "@/features/dates/components/date-planner-sheet";
import { chatService } from "@/services/chat";
import type { ChatMessage } from "@/types/domain";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const chatQuery = useQuery({
    queryKey: ["chat", params.id],
    queryFn: () => chatService.getChat(params.id),
  });
  const profile = chatQuery.data?.profile;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatQuery.data) setMessages(chatQuery.data.messages);
  }, [chatQuery.data]);

  useEffect(
    () =>
      chatService.subscribe(params.id, () => {
        void queryClient.invalidateQueries({ queryKey: ["chat", params.id] });
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }),
    [params.id, queryClient],
  );

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      const message = await chatService.sendMessage(params.id, body);
      setMessages((current) => [...current, message]);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      setDraft(body);
      toast.error(
        error instanceof Error ? error.message : "Message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  };

  if (chatQuery.isLoading) {
    return (
      <div className="flex h-dvh flex-col bg-white p-4">
        <Skeleton className="h-16 rounded-card" />
        <div className="mt-auto space-y-3">
          <Skeleton className="ml-auto h-16 w-2/3 rounded-card" />
          <Skeleton className="h-16 w-2/3 rounded-card" />
          <Skeleton className="h-14 rounded-card" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="grid h-dvh place-items-center bg-white">
        <EmptyState
          icon={MessageCircle}
          title="Conversation unavailable"
          description="This conversation may have been removed."
          action="Back to messages"
          onAction={() => router.replace("/messages")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[linear-gradient(180deg,#fff_0%,#eff6ff_100%)]">
      <header className="safe-top z-30 border-b border-border bg-white/85 backdrop-blur-xl">
        <div className="grid h-[64px] grid-cols-[42px_1fr_auto] items-center gap-2 px-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back to messages"
            className="grid size-10 place-items-center rounded-2xl bg-surface"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => router.push(`/discover/${profile.id}`)}
            className="flex min-w-0 items-center gap-2.5 text-left"
          >
            <Avatar src={profile.photo} alt={profile.name} size="sm" online />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">
                {profile.name}
              </span>
              <span className="block text-[11px] font-medium text-success">
                Active now
              </span>
            </span>
          </button>
          <div className="flex">
            <button
              type="button"
              aria-label="Voice call"
              onClick={() => router.push("/calls/voice")}
              className="grid size-9 place-items-center rounded-xl text-secondary"
            >
              <Phone className="size-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Video call"
              onClick={() => router.push("/calls/video")}
              className="grid size-9 place-items-center rounded-xl text-secondary"
            >
              <Video className="size-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Chat options"
              className="grid size-9 place-items-center rounded-xl"
            >
              <MoreHorizontal className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="my-2 text-center">
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-muted shadow-sm">
              You matched on The Atom
            </span>
          </div>
          {!messages.length && (
            <div className="my-5 rounded-card border border-secondary/10 bg-white p-4 text-center shadow-soft">
              <p className="text-sm font-bold">It is a match</p>
              <p className="mt-1 text-sm leading-5 text-muted">
                Start with a friendly hello and be yourself.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${
                  message.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-[20px] px-4 py-3 ${
                    message.sender === "me"
                      ? "rounded-br-md bg-gradient-to-br from-primary to-[#60A5FA] text-white shadow-soft"
                      : "rounded-bl-md border border-border bg-white text-ink shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-6">{message.body}</p>
                  <p
                    className={`mt-1 text-right text-[9px] ${
                      message.sender === "me" ? "text-white/65" : "text-muted"
                    }`}
                  >
                    {message.sentAt}
                    {message.status === "seen" ? " · Seen" : ""}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="border-t border-border bg-white/90 backdrop-blur-xl">
        <div className="scrollbar-none mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2">
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-2xl bg-secondary/10 px-3 text-xs font-bold text-secondary"
          >
            <Sparkles className="size-3.5" />
            Suggest reply
          </button>
          <button
            type="button"
            onClick={() => setDateOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-2xl bg-primary-soft px-3 text-xs font-bold text-primary"
          >
            <CalendarHeart className="size-3.5" />
            Plan a date
          </button>
          <button
            type="button"
            onClick={() => router.push("/gifts")}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-2xl bg-amber-50 px-3 text-xs font-bold text-warning"
          >
            <Gift className="size-3.5" />
            Send a gift
          </button>
        </div>
        <div className="safe-bottom mx-auto flex max-w-2xl items-end gap-2 px-3 pb-3">
          <button
            type="button"
            onClick={() => setAttachOpen(true)}
            aria-label="Add attachment"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface text-secondary"
          >
            <Plus className="size-5" />
          </button>
          <label className="flex min-h-11 flex-1 items-end gap-2 rounded-[22px] border border-border bg-surface px-4 py-2.5 focus-within:border-secondary/30 focus-within:bg-white">
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
              placeholder="Message Ananya"
              className="max-h-28 min-h-6 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted/70"
            />
            <button type="button" aria-label="Choose emoji">
              <Smile className="mb-0.5 size-5 text-muted" />
            </button>
          </label>
          <button
            type="button"
            onClick={draft.trim() ? () => void send() : undefined}
            disabled={sending}
            aria-label={draft.trim() ? "Send message" : "Record voice note"}
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-soft"
          >
            {draft.trim() ? (
              <Send className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
          </button>
        </div>
      </div>

      <AiReplySheet
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onUse={(reply) => {
          setDraft(reply);
          setAiOpen(false);
        }}
      />
      <DatePlannerSheet open={dateOpen} onClose={() => setDateOpen(false)} />
      <BottomSheet
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        title="Share something"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: ImageIcon,
              label: "Photo",
              color: "bg-sky-50 text-secondary",
            },
            { icon: Camera, label: "Camera", color: "bg-sky-50 text-primary" },
            { icon: Gift, label: "Gift", color: "bg-amber-50 text-warning" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-card ${item.color}`}
              >
                <Icon className="size-6" />
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
