"use client";

import { Check, Clock3, Gift, History, MessageCircleHeart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { gifts, profiles } from "@/utils/mock-data";

export default function GiftsPage() {
  const [tab, setTab] = useState("Send a gift");
  const [selected, setSelected] = useState<(typeof gifts)[number] | null>(null);
  const [message, setMessage] = useState("");

  return (
    <AppShell title="Thoughtful gifts" back right="notifications">
      <div className="px-4 pt-3 min-[768px]:px-6">
        <div className="rounded-card bg-gradient-to-br from-[#eff6ff] via-[#f0f9ff] to-[#ecfeff] p-5">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-[20px] bg-white text-2xl shadow-soft">
              🎁
            </span>
            <div>
              <h2 className="text-xl font-bold">
                Small gesture, real feeling.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Gifts are optional, transparent, and never affect visibility or
                matching.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {["Send a gift", "History"].map((item) => (
            <Chip
              key={item}
              active={tab === item}
              onClick={() => setTab(item)}
              icon={
                item === "History" ? (
                  <History className="size-3.5" />
                ) : (
                  <Gift className="size-3.5" />
                )
              }
            >
              {item}
            </Chip>
          ))}
        </div>

        {tab === "Send a gift" ? (
          <>
            <section className="mt-6">
              <p className="text-sm font-bold">Send to</p>
              <button
                type="button"
                className="mt-3 flex w-full items-center gap-3 rounded-card border border-border p-4 text-left shadow-soft"
              >
                <Avatar
                  src={profiles[0].photo}
                  alt={profiles[0].name}
                  size="md"
                  online
                />
                <span>
                  <span className="block text-sm font-bold">
                    {profiles[0].name}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    Your match · Bengaluru
                  </span>
                </span>
                <Check className="ml-auto size-5 text-success" />
              </button>
            </section>
            <section className="mt-7">
              <p className="text-sm font-bold">Choose something thoughtful</p>
              <div className="mt-3 grid grid-cols-2 gap-3 min-[768px]:grid-cols-4">
                {gifts.map((gift) => (
                  <button
                    type="button"
                    key={gift.id}
                    onClick={() => setSelected(gift)}
                    className="rounded-card border border-border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
                  >
                    <span
                      className={`grid size-12 place-items-center rounded-[18px] ${gift.color} text-2xl`}
                    >
                      {gift.emoji}
                    </span>
                    <span className="mt-4 block text-sm font-bold">
                      {gift.name}
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-muted">
                      {gift.description}
                    </span>
                    <span className="mt-3 block text-xs font-bold text-primary">
                      {gift.value}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-6 space-y-3">
            <article className="flex items-center gap-3 rounded-card border border-border p-4">
              <span className="grid size-12 place-items-center rounded-[18px] bg-amber-50 text-2xl">
                ☕
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Coffee date for Ananya</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-warning">
                  <Clock3 className="size-3.5" />
                  Pending · sent today
                </p>
              </div>
              <span className="text-xs font-bold">₹250</span>
            </article>
            <article className="flex items-center gap-3 rounded-card border border-border p-4">
              <span className="grid size-12 place-items-center rounded-[18px] bg-sky-50 text-2xl">
                💐
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Flowers from Meera</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-success">
                  <Check className="size-3.5" />
                  Accepted · 18 July
                </p>
              </div>
              <span className="text-xs font-bold">₹699</span>
            </article>
          </section>
        )}
      </div>

      <BottomSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Send gift"}
        description="The receiver can accept or decline. Your message stays private."
      >
        {selected && (
          <>
            <div
              className={`grid place-items-center rounded-card ${selected.color} py-7`}
            >
              <span className="text-7xl">{selected.emoji}</span>
              <p className="mt-4 text-xl font-bold">{selected.name}</p>
              <p className="mt-1 text-sm text-muted">{selected.value}</p>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-bold">Add a message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Something warm, no pressure…"
                rows={3}
                maxLength={160}
                className="mt-2 w-full resize-none rounded-input border border-border bg-surface p-4 text-sm outline-none focus:border-secondary/30 focus:bg-white"
              />
              <span className="mt-1 block text-right text-[10px] text-muted">
                {message.length}/160
              </span>
            </label>
            <Button
              fullWidth
              size="lg"
              className="mt-4"
              onClick={() => {
                toast.success(`${selected.name} sent to Ananya`, {
                  description: "You’ll be notified when it’s accepted.",
                });
                setSelected(null);
                setMessage("");
              }}
            >
              <MessageCircleHeart className="size-5" />
              Send gift
            </Button>
            <p className="mt-3 text-center text-[10px] leading-4 text-muted">
              The Atom does not process payments in mock mode. Connect a payment
              provider before enabling live redemption.
            </p>
          </>
        )}
      </BottomSheet>
    </AppShell>
  );
}
