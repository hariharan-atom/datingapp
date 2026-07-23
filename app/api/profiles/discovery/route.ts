import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { loadProfiles } from "@/services/server/profile-records";
import { authenticateRequest } from "@/supabase/request-auth";

// Temporary launch behavior: keep liked and passed profiles in the deck while
// the member pool is small. Blocks and explicit hides still take precedence.
const REPEAT_DISCOVERY_PROFILES = true;

const querySchema = z.object({
  minAge: z.coerce.number().int().min(18).max(99).default(18),
  maxAge: z.coerce.number().int().min(18).max(99).default(99),
  verifiedOnly: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  recentlyActiveOnly: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  relationshipGoal: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to discover profiles." },
        { status: 401 },
      );
    }

    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success || parsed.data.minAge > parsed.data.maxAge) {
      return NextResponse.json(
        { message: "The discovery filters are invalid." },
        { status: 400 },
      );
    }

    const [records, hiddenProfilesResult, blockedByMeResult, blockedMeResult] =
      await Promise.all([
        loadProfiles(admin),
        admin
          .from("profile_actions")
          .select("target_user_id,action")
          .eq("actor_user_id", user.id)
          .in(
            "action",
            REPEAT_DISCOVERY_PROFILES ? ["hide"] : ["pass", "hide"],
          ),
        admin
          .from("blocks")
          .select("blocked_user_id")
          .eq("blocker_user_id", user.id),
        admin
          .from("blocks")
          .select("blocker_user_id")
          .eq("blocked_user_id", user.id),
      ]);

    const firstError = [
      hiddenProfilesResult.error,
      blockedByMeResult.error,
      blockedMeResult.error,
    ].find(Boolean);
    if (firstError) throw firstError;

    const excluded = new Set<string>([
      user.id,
      ...(hiddenProfilesResult.data ?? []).map(
        (row) => row.target_user_id as string,
      ),
      ...(blockedByMeResult.data ?? []).map(
        (row) => row.blocked_user_id as string,
      ),
      ...(blockedMeResult.data ?? []).map(
        (row) => row.blocker_user_id as string,
      ),
    ]);

    const profiles = records
      .filter(
        ({ profile, completed, active, discoverable, incognito }) =>
          completed &&
          active &&
          discoverable &&
          !incognito &&
          !excluded.has(profile.id) &&
          profile.age >= parsed.data.minAge &&
          profile.age <= parsed.data.maxAge &&
          (!parsed.data.verifiedOnly || profile.verified) &&
          (!parsed.data.recentlyActiveOnly || profile.online) &&
          (!parsed.data.relationshipGoal ||
            profile.relationshipGoal === parsed.data.relationshipGoal),
      )
      .map(({ profile }) => profile)
      .sort(
        (left, right) =>
          Number(right.online) - Number(left.online) ||
          right.compatibility - left.compatibility ||
          left.name.localeCompare(right.name),
      );

    return NextResponse.json(
      { profiles },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "Profiles are temporarily unavailable." },
      { status: 503 },
    );
  }
}
