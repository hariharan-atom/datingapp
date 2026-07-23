import { isSupabaseConfigured } from "@/supabase/client";
import type { Profile } from "@/types/domain";
import { profiles as mockProfiles } from "@/utils/mock-data";

export interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  recentlyActiveOnly?: boolean;
  relationshipGoals?: string[];
}

export interface ProfileStats {
  views: number;
  likes: number;
  bookmarks: number;
}

export interface CurrentProfile {
  profile: Profile;
  stats: ProfileStats;
}

export type ProfileAction =
  | "like"
  | "super_like"
  | "pass"
  | "bookmark"
  | "unbookmark"
  | "hide"
  | "block"
  | "report";

export interface ProfileActionResult {
  saved: boolean;
  matched: boolean;
  matchId: string | null;
  chatId: string | null;
}

export interface UpdateCurrentProfileInput {
  name: string;
  bio: string;
  occupation?: string;
  company?: string;
  education?: string;
  heightCm?: number;
  prompt?: string;
  interests?: string[];
}

async function responseJson<T>(response: Response): Promise<T> {
  const result = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(result.message ?? "The request could not be completed.");
  }
  return result;
}

export const profileService = {
  async getDiscoveryProfiles(
    filters: DiscoveryFilters = {},
  ): Promise<Profile[]> {
    if (!isSupabaseConfigured()) {
      return mockProfiles
        .filter(
          (profile) =>
            (!filters.minAge || profile.age >= filters.minAge) &&
            (!filters.maxAge || profile.age <= filters.maxAge) &&
            (!filters.verifiedOnly || profile.verified),
        )
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    const search = new URLSearchParams();
    if (filters.minAge) search.set("minAge", String(filters.minAge));
    if (filters.maxAge) search.set("maxAge", String(filters.maxAge));
    if (filters.verifiedOnly) search.set("verifiedOnly", "true");
    if (filters.recentlyActiveOnly) {
      search.set("recentlyActiveOnly", "true");
    }
    if (filters.relationshipGoals?.[0]) {
      search.set("relationshipGoal", filters.relationshipGoals[0]);
    }

    const response = await fetch(`/api/profiles/discovery?${search}`, {
      cache: "no-store",
    });
    const result = await responseJson<{ profiles: Profile[] }>(response);
    return result.profiles;
  },

  async getCurrentProfile(): Promise<CurrentProfile> {
    if (!isSupabaseConfigured()) {
      return {
        profile: mockProfiles[3],
        stats: { views: 0, likes: 0, bookmarks: 0 },
      };
    }

    return responseJson<CurrentProfile>(
      await fetch("/api/profiles/me", { cache: "no-store" }),
    );
  },

  async getProfile(profileId: string): Promise<Profile> {
    if (!isSupabaseConfigured()) {
      return (
        mockProfiles.find((profile) => profile.id === profileId) ??
        mockProfiles[0]
      );
    }

    const result = await responseJson<{ profile: Profile }>(
      await fetch(`/api/profiles/${encodeURIComponent(profileId)}`, {
        cache: "no-store",
      }),
    );
    return result.profile;
  },

  async updateCurrentProfile(input: UpdateCurrentProfileInput) {
    const result = await responseJson<{ profile: Profile | null }>(
      await fetch("/api/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );
    return result.profile;
  },

  async act(
    profileId: string,
    action: ProfileAction,
    reason?: string,
  ): Promise<ProfileActionResult> {
    if (!isSupabaseConfigured()) {
      return {
        saved: true,
        matched: false,
        matchId: null,
        chatId: null,
      };
    }

    return responseJson<ProfileActionResult>(
      await fetch(`/api/profiles/${encodeURIComponent(profileId)}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      }),
    );
  },
};
