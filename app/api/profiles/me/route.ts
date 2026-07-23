import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  getRequestProfile,
  loadProfiles,
} from "@/services/server/profile-records";
import { authenticateRequest } from "@/supabase/request-auth";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(40),
  bio: z.string().trim().min(20).max(500),
  occupation: z.string().trim().max(80).optional(),
  company: z.string().trim().max(80).optional(),
  education: z.string().trim().max(120).optional(),
  heightCm: z.number().int().min(120).max(230).optional(),
  prompt: z.string().trim().min(10).max(220).optional(),
  interests: z.array(z.string().trim().min(1).max(50)).max(12).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view your profile." },
        { status: 401 },
      );
    }

    const record = await getRequestProfile(admin, user);
    if (!record) {
      return NextResponse.json(
        { message: "Complete onboarding to create your profile." },
        { status: 404 },
      );
    }

    const [likesResult, bookmarksResult] = await Promise.all([
      admin
        .from("likes")
        .select("id", { head: true, count: "exact" })
        .eq("target_user_id", user.id),
      admin
        .from("profile_actions")
        .select("target_user_id", { head: true, count: "exact" })
        .eq("target_user_id", user.id)
        .eq("action", "bookmark"),
    ]);
    if (likesResult.error) throw likesResult.error;
    if (bookmarksResult.error) throw bookmarksResult.error;

    return NextResponse.json(
      {
        profile: record.profile,
        stats: {
          views: 0,
          likes: likesResult.count ?? 0,
          bookmarks: bookmarksResult.count ?? 0,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "Your profile is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to update your profile." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Check the profile details and try again." },
        { status: 400 },
      );
    }

    const update = parsed.data;
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        display_name: update.name,
        bio: update.bio,
        occupation: update.occupation ?? null,
        company: update.company ?? null,
        education: update.education ?? null,
        height_cm: update.heightCm ?? null,
        prompt_answers: update.prompt
          ? [
              {
                question: "My simple pleasures",
                answer: update.prompt,
              },
            ]
          : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    if (profileError) throw profileError;

    if (update.interests) {
      const { data: interestRows, error: interestError } = await admin
        .from("interests")
        .select("id,name")
        .in("name", update.interests);
      if (interestError) throw interestError;

      const { error: clearError } = await admin
        .from("profile_interests")
        .delete()
        .eq("user_id", user.id);
      if (clearError) throw clearError;

      if (interestRows?.length) {
        const { error: insertError } = await admin
          .from("profile_interests")
          .insert(
            interestRows.map((interest) => ({
              user_id: user.id,
              interest_id: interest.id,
            })),
          );
        if (insertError) throw insertError;
      }
    }

    const [record] = await loadProfiles(admin, [user.id]);
    return NextResponse.json(
      { profile: record?.profile ?? null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "Your profile could not be updated." },
      { status: 503 },
    );
  }
}
