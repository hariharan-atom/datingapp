export type AiCapability =
  | "bio_generation"
  | "profile_score"
  | "photo_feedback"
  | "compatibility"
  | "reply_suggestion"
  | "conversation_health"
  | "date_planning"
  | "safety_classification";

export interface AiRequest<TInput = Record<string, unknown>> {
  capability: AiCapability;
  input: TInput;
  locale?: string;
  requestId?: string;
}

export interface AiResponse<TOutput = unknown> {
  requestId: string;
  output: TOutput;
  provider: string;
  model: string;
  confidence?: number;
  safety?: {
    flagged: boolean;
    categories: string[];
  };
}

export interface AiProvider {
  readonly id: string;
  supports(capability: AiCapability): boolean;
  generate<TInput, TOutput>(
    request: AiRequest<TInput>,
  ): Promise<AiResponse<TOutput>>;
}
