"use client";

import { useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/profiles";

export function useProfile(profileId: string) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => profileService.getProfile(profileId),
    enabled: Boolean(profileId),
  });
}
