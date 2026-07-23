import type {
  AiCapability,
  AiProvider,
  AiRequest,
  AiResponse,
} from "@/services/ai/types";

export abstract class BaseAiProvider implements AiProvider {
  abstract readonly id: string;
  abstract readonly capabilities: ReadonlySet<AiCapability>;

  supports(capability: AiCapability) {
    return this.capabilities.has(capability);
  }

  abstract generate<TInput, TOutput>(
    request: AiRequest<TInput>,
  ): Promise<AiResponse<TOutput>>;

  protected assertSupported(capability: AiCapability) {
    if (!this.supports(capability)) {
      throw new Error(`${this.id} does not support ${capability}`);
    }
  }
}
