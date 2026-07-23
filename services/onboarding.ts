import { uploadUserImage } from "@/services/media/user-image-upload";
import { createClient } from "@/supabase/client";

export type OnboardingGender =
  "woman" | "man" | "non_binary" | "self_described";

export type OnboardingGoal =
  "long_term" | "life_partner" | "dating" | "exploring";

interface CompleteOnboardingInput {
  locale: string;
  name: string;
  birthday: string;
  gender: OnboardingGender;
  bio: string;
  interests: string[];
  relationshipGoal: OnboardingGoal;
  photos: File[];
}

export const onboardingService = {
  async complete(input: CompleteOnboardingInput) {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Your session expired. Please log in again.");
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: input.name.trim(),
        birth_date: input.birthday,
        gender: input.gender,
        bio: input.bio.trim(),
        relationship_goal: input.relationshipGoal,
        profile_score: input.photos.length ? 72 : 58,
      },
      { onConflict: "user_id" },
    );
    if (profileError) throw profileError;

    const { error: preferenceError } = await supabase
      .from("preferences")
      .upsert(
        {
          user_id: user.id,
          min_age: 24,
          max_age: 34,
          max_distance_km: 25,
          relationship_goals: [input.relationshipGoal],
        },
        { onConflict: "user_id" },
      );
    if (preferenceError) throw preferenceError;

    const { data: interestRows, error: interestsError } = await supabase
      .from("interests")
      .select("id,name")
      .in("name", input.interests);
    if (interestsError) throw interestsError;

    const { error: clearInterestsError } = await supabase
      .from("profile_interests")
      .delete()
      .eq("user_id", user.id);
    if (clearInterestsError) throw clearInterestsError;

    if (interestRows?.length) {
      const { error: saveInterestsError } = await supabase
        .from("profile_interests")
        .insert(
          interestRows.map((interest) => ({
            user_id: user.id,
            interest_id: interest.id,
          })),
        );
      if (saveInterestsError) throw saveInterestsError;
    }

    for (const [index, file] of input.photos.entries()) {
      const uploaded = await uploadUserImage({
        file,
        purpose: "profile",
      });
      const { error: photoError } = await supabase.from("photos").insert({
        user_id: user.id,
        storage_path: uploaded.path,
        sort_order: index,
        is_primary: index === 0,
        width: uploaded.width,
        height: uploaded.height,
      });
      if (photoError) throw photoError;
    }

    const { data: completedUser, error: completionError } = await supabase
      .from("users")
      .update({
        locale: input.locale,
        onboarding_complete: true,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id")
      .single();

    if (completionError || !completedUser) {
      throw completionError ?? new Error("Could not finish onboarding.");
    }
  },
};
