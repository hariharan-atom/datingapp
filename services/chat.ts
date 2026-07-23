import { createClient } from "@/supabase/client";

export const chatService = {
  async sendMessage(chatId: string, body: string, replyTo?: string) {
    const { data, error } = await createClient()
      .from("messages")
      .insert({
        chat_id: chatId,
        body,
        message_type: "text",
        reply_to_id: replyTo ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribe(chatId: string, onMessage: (message: unknown) => void) {
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
        (payload) => onMessage(payload.new),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },

  async setTyping(chatId: string, typing: boolean) {
    return createClient().channel(`presence:${chatId}`).track({
      typing,
      at: new Date().toISOString(),
    });
  },
};
