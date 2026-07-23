import type { Profile } from "@/types/domain";
import { profiles as mockProfiles } from "@/utils/mock-data";
import { createClient, isSupabaseConfigured } from "@/supabase/client";

export interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  relationshipGoals?: string[];
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
            (!filters.maxDistanceKm ||
              profile.distanceKm <= filters.maxDistanceKm) &&
            (!filters.verifiedOnly || profile.verified),
        )
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_discovery_profiles", {
      max_distance_km: filters.maxDistanceKm ?? 50,
      min_age: filters.minAge ?? 18,
      max_age: filters.maxAge ?? 99,
      verified_only: filters.verifiedOnly ?? false,
    });
    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  async like(profileId: string, kind: "like" | "super_like" = "like") {
    const { data, error } = await createClient()
      .from("likes")
      .upsert({ target_user_id: profileId, kind })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async pass(profileId: string) {
    const { error } = await createClient()
      .from("profile_actions")
      .upsert({ target_user_id: profileId, action: "pass" });
    if (error) throw error;
  },
};
