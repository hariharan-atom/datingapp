import type { AiCapability, AiRequest, AiResponse } from "@/services/ai/types";
import { BaseAiProvider } from "@/services/ai/providers/base";

/**
 * Server-only provider adapter. The browser never receives provider secrets.
 * Implement this adapter inside the Supabase Edge Function when enabling OpenAI.
 */
export class OpenAiProvider extends BaseAiProvider {
  readonly id = "openai";
  readonly capabilities = new Set<AiCapability>([
    "bio_generation",
    "profile_score",
    "photo_feedback",
    "compatibility",
    "reply_suggestion",
    "conversation_health",
    "date_planning",
    "safety_classification",
  ]);

  async generate<TInput, TOutput>(
    request: AiRequest<TInput>,
  ): Promise<AiResponse<TOutput>> {
    this.assertSupported(request.capability);
    throw new Error(
      "OpenAI is intentionally not called from the Next.js client. Route this request through the ai-assistant Edge Function.",
    );
  }
}
