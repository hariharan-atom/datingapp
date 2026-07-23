"use client";

import {
  BriefcaseBusiness,
  MapPin,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { communities, profiles } from "@/utils/mock-data";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const profileResults = useMemo(
    () =>
      profiles.filter((profile) =>
        [profile.name, profile.occupation, profile.city, ...profile.interests]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <AppShell title="Search" back hideAi>
      <div className="px-4 pt-3 min-[768px]:px-6">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="People, groups, interests, places"
          autoFocus
        />
        <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-2">
          {["All", "People", "Groups", "Interests", "Places"].map((item) => (
            <Chip
              key={item}
              active={type === item}
              onClick={() => setType(item)}
            >
              {item}
            </Chip>
          ))}
        </div>
        {!query ? (
          <div className="mt-7">
            <p className="text-sm font-bold">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Photography",
                "Bengaluru",
                "Product designer",
                "Long-term",
                "Trekking",
                "Books",
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setQuery(item)}
                  className="rounded-2xl bg-surface px-4 py-3 text-sm font-medium"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-card bg-gradient-to-br from-secondary/10 to-primary/10 p-5">
              <Sparkles className="size-6 text-secondary" />
              <h2 className="mt-3 text-lg font-bold">Try natural search</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Search “people nearby who love books and don’t smoke” when AI
                search is connected.
              </p>
            </div>
          </div>
        ) : profileResults.length ? (
          <div className="mt-6 space-y-6">
            {(type === "All" || type === "People") && (
              <section>
                <p className="text-sm font-bold">People</p>
                <div className="mt-3 space-y-2">
                  {profileResults.map((profile) => (
                    <Link
                      href={`/discover/${profile.id}`}
                      key={profile.id}
                      className="flex items-center gap-3 rounded-card border border-border p-3"
                    >
                      <Avatar
                        src={profile.photo}
                        alt={profile.name}
                        size="md"
                        online={profile.online}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">
                          {profile.name}, {profile.age}
                        </p>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
                          <BriefcaseBusiness className="size-3" />
                          {profile.occupation}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                        <MapPin className="size-3" />
                        {profile.distanceKm} km
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {(type === "All" || type === "Groups") && (
              <section>
                <p className="text-sm font-bold">Groups</p>
                <div className="mt-3 grid gap-2">
                  {communities.slice(0, 2).map((group) => (
                    <Link
                      href={`/groups/${group.id}`}
                      key={group.id}
                      className="flex items-center gap-3 rounded-card bg-surface p-3"
                    >
                      <span className="relative block size-12 shrink-0 overflow-hidden rounded-[18px] bg-primary-soft">
                        <Image
                          src={group.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{group.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                          <UsersRound className="size-3" />
                          {group.members.toLocaleString("en-IN")} members
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No exact matches"
            description="Try another interest, nearby place, occupation, or a broader phrase."
            action="Clear search"
            onAction={() => setQuery("")}
          />
        )}
      </div>
    </AppShell>
  );
}
