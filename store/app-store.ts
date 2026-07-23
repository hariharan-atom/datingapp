"use client";

import { create } from "zustand";

interface AppState {
  likedProfiles: string[];
  bookmarkedProfiles: string[];
  joinedGroups: string[];
  incognito: boolean;
  addLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  toggleGroup: (id: string) => void;
  toggleIncognito: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  likedProfiles: [],
  bookmarkedProfiles: [],
  joinedGroups: ["weekend-trekkers", "pages-and-chai"],
  incognito: false,
  addLike: (id) =>
    set((state) => ({
      likedProfiles: Array.from(new Set([...state.likedProfiles, id])),
    })),
  toggleBookmark: (id) =>
    set((state) => ({
      bookmarkedProfiles: state.bookmarkedProfiles.includes(id)
        ? state.bookmarkedProfiles.filter((profileId) => profileId !== id)
        : [...state.bookmarkedProfiles, id],
    })),
  toggleGroup: (id) =>
    set((state) => ({
      joinedGroups: state.joinedGroups.includes(id)
        ? state.joinedGroups.filter((groupId) => groupId !== id)
        : [...state.joinedGroups, id],
    })),
  toggleIncognito: () => set((state) => ({ incognito: !state.incognito })),
}));
