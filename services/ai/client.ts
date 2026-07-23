import type { AiRequest, AiResponse } from "@/services/ai/types";
import { createClient, isSupabaseConfigured } from "@/supabase/client";

export const aiService = {
  async generate<TInput, TOutput>(
    request: AiRequest<TInput>,
  ): Promise<AiResponse<TOutput>> {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "AI is running in interface-only mode. Configure Supabase and deploy the ai-assistant Edge Function.",
      );
    }

    const { data, error } = await createClient().functions.invoke(
      "ai-assistant",
      {
        body: request,
      },
    );
    if (error) throw error;
    return data as AiResponse<TOutput>;
  },
};
