import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Capability =
  | "bio_generation"
  | "profile_score"
  | "photo_feedback"
  | "compatibility"
  | "reply_suggestion"
  | "conversation_health"
  | "date_planning"
  | "safety_classification";

interface AiRequest {
  capability: Capability;
  input: Record<string, unknown>;
  locale?: string;
  requestId?: string;
}

interface ProviderResult {
  output: unknown;
  model: string;
  confidence?: number;
  safety?: { flagged: boolean; categories: string[] };
}

interface Provider {
  id: string;
  generate(request: AiRequest): Promise<ProviderResult>;
}

class UnconfiguredProvider implements Provider {
  id = "unconfigured";
  async generate(): Promise<ProviderResult> {
    throw new Error(
      "No AI provider is configured. Set AI_PROVIDER and provider credentials in Edge Function secrets.",
    );
  }
}

/**
 * Provider registry: add OpenAIProvider (or another provider) here without
 * changing callers, database records, or client contracts.
 */
function getProvider(): Provider {
  const provider = Deno.env.get("AI_PROVIDER");
  if (!provider) return new UnconfiguredProvider();

  // Intentionally fails closed until a reviewed provider adapter is deployed.
  // This prevents accidental client-side key use or silently hardcoded models.
  return new UnconfiguredProvider();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const body = (await request.json()) as AiRequest;
    if (!body.capability || typeof body.input !== "object") {
      throw new Error("Invalid AI request");
    }

    const requestId = body.requestId ?? crypto.randomUUID();
    const provider = getProvider();
    const result = await provider.generate({ ...body, requestId });

    const encoder = new TextEncoder();
    const inputHashBytes = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(JSON.stringify(body.input)),
    );
    const inputHash = Array.from(new Uint8Array(inputHashBytes))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    await supabase.from("ai_suggestions").insert({
      user_id: user.id,
      capability: body.capability,
      provider: provider.id,
      model: result.model,
      input_hash: inputHash,
      suggestion: result.output,
      safety_metadata: result.safety ?? {},
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    return Response.json({
      requestId,
      provider: provider.id,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: message },
      {
        status: message === "Unauthorized" ? 401 : 503,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  }
});
