import { createClient, isSupabaseConfigured } from "@/supabase/client";
import type { ChatMessage, Conversation, Profile } from "@/types/domain";
import {
  chatMessages as mockMessages,
  conversations as mockConversations,
  profiles,
} from "@/utils/mock-data";

export interface ChatDetails {
  id: string;
  profile: Profile;
  messages: ChatMessage[];
}

async function responseJson<T>(response: Response): Promise<T> {
  const result = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(result.message ?? "The request could not be completed.");
  }
  return result;
}

export const chatService = {
  async listConversations(): Promise<Conversation[]> {
    if (!isSupabaseConfigured()) return mockConversations;
    const result = await responseJson<{ conversations: Conversation[] }>(
      await fetch("/api/chats", { cache: "no-store" }),
    );
    return result.conversations;
  },

  async getChat(chatId: string): Promise<ChatDetails> {
    if (!isSupabaseConfigured()) {
      return { id: chatId, profile: profiles[0], messages: mockMessages };
    }
    const result = await responseJson<{ chat: ChatDetails }>(
      await fetch(`/api/chats/${encodeURIComponent(chatId)}`, {
        cache: "no-store",
      }),
    );
    return result.chat;
  },

  async sendMessage(
    chatId: string,
    body: string,
    replyTo?: string,
  ): Promise<ChatMessage> {
    if (!isSupabaseConfigured()) {
      return {
        id: crypto.randomUUID(),
        sender: "me",
        body,
        sentAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };
    }
    const result = await responseJson<{ message: ChatMessage }>(
      await fetch(`/api/chats/${encodeURIComponent(chatId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, replyTo }),
      }),
    );
    return result.message;
  },

  subscribe(chatId: string, onMessage: () => void) {
    if (!isSupabaseConfigured()) return () => undefined;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        onMessage,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
