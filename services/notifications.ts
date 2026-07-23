import type { Profile } from "@/types/domain";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
  href: string;
  profile?: Profile;
}

async function responseJson<T>(response: Response): Promise<T> {
  const result = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(result.message ?? "The request could not be completed.");
  }
  return result;
}

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const result = await responseJson<{ notifications: AppNotification[] }>(
      await fetch("/api/notifications", { cache: "no-store" }),
    );
    return result.notifications;
  },

  async markRead(id?: string) {
    return responseJson<{ saved: boolean }>(
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { all: true }),
      }),
    );
  },
};
