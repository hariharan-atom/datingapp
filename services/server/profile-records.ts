import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/supabase/admin";
import type { Profile, RelationshipGoal } from "@/types/domain";

type AdminClient = ReturnType<typeof createAdminClient>;

interface ProfileRow {
  user_id: string;
  display_name: string;
  birth_date: string;
  pronouns: string | null;
  bio: string | null;
  occupation: string | null;
  company: string | null;
  education: string | null;
  height_cm: number | null;
  religion: string | null;
  languages: string[];
  relationship_goal:
    "long_term" | "life_partner" | "dating" | "exploring" | null;
  drinking: string | null;
  smoking: string | null;
  pets: string | null;
  workout: string | null;
  prompt_answers: unknown;
  is_verified: boolean;
  is_incognito: boolean;
  is_discoverable: boolean;
  profile_score: number;
}

interface UserRow {
  id: string;
  onboarding_complete: boolean;
  is_active: boolean;
  last_active_at: string;
}

interface PhotoRow {
  user_id: string;
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
}

interface InterestRow {
  user_id: string;
  interests: { name: string } | { name: string }[] | null;
}

interface LocationRow {
  user_id: string;
  city: string | null;
  locality: string | null;
}

const relationshipGoals: Record<
  NonNullable<ProfileRow["relationship_goal"]>,
  RelationshipGoal
> = {
  long_term: "Long-term relationship",
  life_partner: "Life partner",
  dating: "Dating",
  exploring: "Open to exploring",
};

function ageFromBirthDate(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function promptFrom(value: unknown, bio: string) {
  if (Array.isArray(value)) {
    const first = value[0];
    if (
      first &&
      typeof first === "object" &&
      "question" in first &&
      "answer" in first &&
      typeof first.question === "string" &&
      typeof first.answer === "string"
    ) {
      return { question: first.question, answer: first.answer };
    }
  }

  return {
    question: "A little more about me",
    answer: bio || "Say hello and get to know me.",
  };
}

function interestName(row: InterestRow) {
  if (Array.isArray(row.interests)) return row.interests[0]?.name;
  return row.interests?.name;
}

function isRecentlyActive(value: string) {
  return Date.now() - new Date(value).getTime() <= 10 * 60 * 1000;
}

export interface LoadedProfile {
  profile: Profile;
  completed: boolean;
  active: boolean;
  discoverable: boolean;
  incognito: boolean;
}

export async function loadProfiles(
  admin: AdminClient,
  profileIds?: string[],
): Promise<LoadedProfile[]> {
  let profileQuery = admin
    .from("profiles")
    .select(
      "user_id,display_name,birth_date,pronouns,bio,occupation,company,education,height_cm,religion,languages,relationship_goal,drinking,smoking,pets,workout,prompt_answers,is_verified,is_incognito,is_discoverable,profile_score",
    );

  if (profileIds?.length) {
    profileQuery = profileQuery.in("user_id", profileIds);
  }

  const { data: profileData, error: profileError } = await profileQuery;
  if (profileError) throw profileError;
  const profileRows = (profileData ?? []) as unknown as ProfileRow[];
  if (!profileRows.length) return [];

  const userIds = profileRows.map((profile) => profile.user_id);
  const [usersResult, photosResult, interestsResult, locationsResult] =
    await Promise.all([
      admin
        .from("users")
        .select("id,onboarding_complete,is_active,last_active_at")
        .in("id", userIds),
      admin
        .from("photos")
        .select("user_id,storage_path,sort_order,is_primary")
        .in("user_id", userIds)
        .order("sort_order"),
      admin
        .from("profile_interests")
        .select("user_id,interests(name)")
        .in("user_id", userIds),
      admin
        .from("locations")
        .select("user_id,city,locality")
        .in("user_id", userIds),
    ]);

  const firstError = [
    usersResult.error,
    photosResult.error,
    interestsResult.error,
    locationsResult.error,
  ].find(Boolean);
  if (firstError) throw firstError;

  const users = new Map(
    ((usersResult.data ?? []) as unknown as UserRow[]).map((row) => [
      row.id,
      row,
    ]),
  );
  const photos = (photosResult.data ?? []) as unknown as PhotoRow[];
  const interests = (interestsResult.data ?? []) as unknown as InterestRow[];
  const locations = new Map(
    ((locationsResult.data ?? []) as unknown as LocationRow[]).map((row) => [
      row.user_id,
      row,
    ]),
  );

  return profileRows.flatMap((row) => {
    const appUser = users.get(row.user_id);
    if (!appUser) return [];

    const photoRows = photos
      .filter((photo) => photo.user_id === row.user_id)
      .sort(
        (left, right) =>
          Number(right.is_primary) - Number(left.is_primary) ||
          left.sort_order - right.sort_order,
      );
    const photoUrls = photoRows.map((photo) =>
      photo.storage_path.startsWith("/")
        ? photo.storage_path
        : admin.storage.from("profile-photos").getPublicUrl(photo.storage_path)
            .data.publicUrl,
    );
    const fallbackPhoto = "/images/profiles/placeholder.svg";
    const profileInterests = interests
      .filter((interest) => interest.user_id === row.user_id)
      .map(interestName)
      .filter((name): name is string => Boolean(name));
    const location = locations.get(row.user_id);
    const bio = row.bio?.trim() ?? "";

    return [
      {
        completed: appUser.onboarding_complete,
        active: appUser.is_active,
        discoverable: row.is_discoverable,
        incognito: row.is_incognito,
        profile: {
          id: row.user_id,
          name: row.display_name,
          age: ageFromBirthDate(row.birth_date),
          pronouns: row.pronouns ?? "",
          city: location?.locality || location?.city || "India",
          distanceKm: 0,
          photo: photoUrls[0] ?? fallbackPhoto,
          photos: photoUrls.length ? photoUrls : [fallbackPhoto],
          verified: row.is_verified,
          online: isRecentlyActive(appUser.last_active_at),
          compatibility: Math.max(55, Math.min(96, row.profile_score || 70)),
          occupation: row.occupation?.trim() || "The Atom member",
          company: row.company?.trim() ?? "",
          education: row.education?.trim() || "Not added",
          bio,
          prompt: promptFrom(row.prompt_answers, bio),
          interests: profileInterests,
          languages: row.languages ?? [],
          heightCm: row.height_cm ?? 0,
          religion: row.religion?.trim() || "Not added",
          relationshipGoal: row.relationship_goal
            ? relationshipGoals[row.relationship_goal]
            : "Open to exploring",
          lifestyle: {
            drinking: row.drinking?.trim() || "Not added",
            smoking: row.smoking?.trim() || "Not added",
            pets: row.pets?.trim() || "Not added",
            workout: row.workout?.trim() || "Not added",
          },
        },
      },
    ];
  });
}

export async function getRequestProfile(
  admin: AdminClient,
  user: User,
): Promise<LoadedProfile | null> {
  const [record] = await loadProfiles(admin, [user.id]);
  return record ?? null;
}
