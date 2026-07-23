"use client";

import { useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/profiles";

export function useCurrentProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileService.getCurrentProfile(),
  });
}
