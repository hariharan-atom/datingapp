"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { type DiscoveryFilters, profileService } from "@/services/profiles";

export function useDiscovery(filters: DiscoveryFilters) {
  return useInfiniteQuery({
    queryKey: ["discovery", filters],
    queryFn: () => profileService.getDiscoveryProfiles(filters),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
  });
}
