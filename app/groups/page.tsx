"use client";

import { Lock, Plus, UsersRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SearchField } from "@/components/ui/search-field";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAppStore } from "@/store/app-store";
import { communities } from "@/utils/mock-data";

const categories = [
  "For you",
  "Travel",
  "Movies",
  "Coding",
  "Books",
  "Fitness",
];

export default function GroupsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("For you");
  const { joinedGroups, toggleGroup } = useAppStore();
  const filtered = useMemo(
    () =>
      communities.filter(
        (community) =>
          community.name.toLowerCase().includes(query.toLowerCase()) &&
          (category === "For you" || community.category === category),
      ),
    [category, query],
  );

  return (
    <AppShell title="Groups" right="search">
      <div className="px-4 pt-3 min-[768px]:px-6">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search groups and interests"
        />
        <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 min-[768px]:-mx-6 min-[768px]:px-6">
          {categories.map((item) => (
            <Chip
              key={item}
              active={item === category}
              onClick={() => setCategory(item)}
            >
              {item}
            </Chip>
          ))}
        </div>

        <section className="mt-6">
          <SectionHeading
            title="Communities for you"
            subtitle="Meet through something you already love"
          />
          <div className="mt-4 grid gap-4 min-[768px]:grid-cols-2">
            {filtered.map((group) => {
              const joined = joinedGroups.includes(group.id);
              return (
                <article
                  key={group.id}
                  className="overflow-hidden rounded-card border border-border bg-white shadow-soft"
                >
                  <Link
                    href={`/groups/${group.id}`}
                    className={`relative block bg-gradient-to-br ${group.gradient} p-5 text-white`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-5xl">{group.emoji}</span>
                      <span className="flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
                        {group.privacy === "Private" && (
                          <Lock className="size-3" />
                        )}
                        {group.privacy}
                      </span>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold">{group.name}</h2>
                    <p className="mt-2 text-sm leading-5 text-white/75">
                      {group.description}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <UsersRound className="size-3.5" />
                        {group.members.toLocaleString("en-IN")} members
                      </p>
                    </div>
                    <Button
                      variant={joined ? "soft" : "primary"}
                      size="sm"
                      onClick={() => {
                        toggleGroup(group.id);
                        toast.success(
                          joined ? "Left group" : "Welcome to the group",
                        );
                      }}
                    >
                      {joined ? "Joined" : "Join"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={() => toast.info("Group creation is ready for Supabase")}
          className="mt-6 flex w-full items-center gap-3 rounded-card border border-dashed border-secondary/30 bg-secondary/5 p-4 text-left"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-white">
            <Plus className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-bold">Start a community</span>
            <span className="mt-1 block text-xs text-muted">
              Build a safe space around a shared interest
            </span>
          </span>
        </button>
      </div>
    </AppShell>
  );
}
