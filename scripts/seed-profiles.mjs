import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  const source = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && serviceRoleKey, "Supabase environment is required.");

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const interestMetadata = {
  Art: { category: "Creative", icon: "palette" },
  Biryani: { category: "Lifestyle", icon: "utensils" },
  Books: { category: "Culture", icon: "book" },
  Cinema: { category: "Culture", icon: "film" },
  Climate: { category: "Science", icon: "leaf" },
  Coding: { category: "Technology", icon: "code" },
  Cooking: { category: "Lifestyle", icon: "chef-hat" },
  Cricket: { category: "Sports", icon: "trophy" },
  Cycling: { category: "Sports", icon: "bike" },
  Design: { category: "Creative", icon: "palette" },
  Dogs: { category: "Lifestyle", icon: "paw-print" },
  "Filter coffee": { category: "Lifestyle", icon: "coffee" },
  "Indie music": { category: "Culture", icon: "music" },
  Jazz: { category: "Culture", icon: "music" },
  Museums: { category: "Culture", icon: "landmark" },
  Photography: { category: "Creative", icon: "camera" },
  Poetry: { category: "Culture", icon: "book-open" },
  "Street food": { category: "Lifestyle", icon: "utensils" },
  Travel: { category: "Lifestyle", icon: "plane" },
  Trekking: { category: "Sports", icon: "mountain" },
};

const seedProfiles = [
  {
    email: "demo.ananya@theatom.app",
    name: "Ananya",
    birthDate: "1998-02-14",
    gender: "woman",
    pronouns: "she/her",
    city: "Bengaluru",
    locality: "Indiranagar",
    photo: "/images/profiles/ananya.webp",
    bio: "Designing calm interfaces by day, hunting for the city's best filter coffee by weekend.",
    occupation: "Product Designer",
    company: "Fintech studio",
    education: "NID Ahmedabad",
    heightCm: 165,
    religion: "Hindu",
    languages: ["English", "Kannada", "Hindi"],
    relationshipGoal: "long_term",
    drinking: "Socially",
    smoking: "Never",
    pets: "Dog person",
    workout: "Often",
    prompt: {
      question: "The quickest way to my heart is…",
      answer: "A thoughtful playlist and punctual brunch plans.",
    },
    interests: ["Design", "Filter coffee", "Indie music", "Travel", "Dogs"],
    score: 94,
  },
  {
    email: "demo.arjun@theatom.app",
    name: "Arjun",
    birthDate: "1995-06-22",
    gender: "man",
    pronouns: "he/him",
    city: "Mumbai",
    locality: "Bandra West",
    photo: "/images/profiles/arjun.webp",
    bio: "I collect small stories, big sunsets, and restaurant recommendations I fully intend to try.",
    occupation: "Documentary Filmmaker",
    company: "Independent",
    education: "Whistling Woods",
    heightCm: 178,
    religion: "Agnostic",
    languages: ["English", "Hindi", "Marathi"],
    relationshipGoal: "life_partner",
    drinking: "Socially",
    smoking: "Never",
    pets: "Cat person",
    workout: "Sometimes",
    prompt: {
      question: "Together, we could…",
      answer:
        "Take the last local to nowhere and find the best late-night chai.",
    },
    interests: ["Cinema", "Photography", "Street food", "Cricket", "Jazz"],
    score: 91,
  },
  {
    email: "demo.meera@theatom.app",
    name: "Meera",
    birthDate: "2000-01-08",
    gender: "woman",
    pronouns: "she/her",
    city: "Delhi",
    locality: "Hauz Khas",
    photo: "/images/profiles/meera.webp",
    bio: "Art, old Delhi walks, and conversations that get unexpectedly specific.",
    occupation: "Arts Curator",
    company: "Independent gallery",
    education: "JNU",
    heightCm: 162,
    religion: "Spiritual",
    languages: ["English", "Hindi", "Tamil"],
    relationshipGoal: "dating",
    drinking: "Rarely",
    smoking: "Never",
    pets: "Both",
    workout: "Sometimes",
    prompt: {
      question: "A life goal of mine…",
      answer: "Build a public art archive anyone can wander through.",
    },
    interests: ["Art", "Museums", "Poetry", "Books", "Cooking"],
    score: 89,
  },
  {
    email: "demo.kabir@theatom.app",
    name: "Kabir",
    birthDate: "1997-09-03",
    gender: "man",
    pronouns: "he/him",
    city: "Hyderabad",
    locality: "Jubilee Hills",
    photo: "/images/profiles/kabir.webp",
    bio: "Usually on a bicycle, occasionally at a keyboard, always up for biryani.",
    occupation: "Climate Researcher",
    company: "Urban futures lab",
    education: "IIT Madras",
    heightCm: 181,
    religion: "Muslim",
    languages: ["English", "Hindi", "Telugu"],
    relationshipGoal: "exploring",
    drinking: "Never",
    smoking: "Never",
    pets: "Dog person",
    workout: "Daily",
    prompt: {
      question: "My simple pleasures…",
      answer: "First rain, empty cycling lanes, and a perfectly timed joke.",
    },
    interests: ["Cycling", "Climate", "Biryani", "Coding", "Trekking"],
    score: 86,
  },
];

async function findUserByEmail(email) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    );
    if (user) return user;
    if (data.users.length < 1000) return null;
  }
  return null;
}

async function ensureAuthUser(profile) {
  const existing = await findUserByEmail(profile.email);
  if (existing) return existing;

  const { data, error } = await admin.auth.admin.createUser({
    email: profile.email,
    password: `Atom-${crypto.randomUUID()}!`,
    email_confirm: true,
    user_metadata: {
      display_name: profile.name,
      seed_profile: true,
    },
  });
  if (error) throw error;
  assert(data.user, `Auth user was not created for ${profile.name}.`);
  return data.user;
}

async function seedProfile(profile) {
  const user = await ensureAuthUser(profile);
  const now = new Date().toISOString();

  const { error: userError } = await admin.from("users").upsert({
    id: user.id,
    email: profile.email,
    onboarding_complete: true,
    is_active: true,
    last_active_at: now,
  });
  if (userError) throw userError;

  const { error: profileError } = await admin.from("profiles").upsert({
    user_id: user.id,
    display_name: profile.name,
    birth_date: profile.birthDate,
    gender: profile.gender,
    pronouns: profile.pronouns,
    bio: profile.bio,
    occupation: profile.occupation,
    company: profile.company,
    education: profile.education,
    height_cm: profile.heightCm,
    religion: profile.religion,
    languages: profile.languages,
    relationship_goal: profile.relationshipGoal,
    drinking: profile.drinking,
    smoking: profile.smoking,
    pets: profile.pets,
    workout: profile.workout,
    prompt_answers: [profile.prompt],
    is_verified: true,
    is_incognito: false,
    is_discoverable: true,
    profile_score: profile.score,
  });
  if (profileError) throw profileError;

  const { error: photoError } = await admin.from("photos").upsert(
    {
      user_id: user.id,
      storage_path: profile.photo,
      sort_order: 0,
      is_primary: true,
      moderation_status: "approved",
    },
    { onConflict: "user_id,storage_path" },
  );
  if (photoError) throw photoError;

  const { error: locationError } = await admin.from("locations").upsert({
    user_id: user.id,
    city: profile.city,
    locality: profile.locality,
    country_code: "IN",
    sharing_precision: "approximate",
  });
  if (locationError) throw locationError;

  const interestRows = profile.interests.map((name) => {
    const metadata = interestMetadata[name] ?? {
      category: "Lifestyle",
      icon: null,
    };
    return { name, ...metadata, is_active: true };
  });
  const { error: interestError } = await admin
    .from("interests")
    .upsert(interestRows, { onConflict: "name" });
  if (interestError) throw interestError;

  const { data: interests, error: interestLookupError } = await admin
    .from("interests")
    .select("id,name")
    .in("name", profile.interests);
  if (interestLookupError) throw interestLookupError;

  const { error: profileInterestError } = await admin
    .from("profile_interests")
    .upsert(
      (interests ?? []).map((interest) => ({
        user_id: user.id,
        interest_id: interest.id,
        affinity: 3,
      })),
      { onConflict: "user_id,interest_id" },
    );
  if (profileInterestError) throw profileInterestError;

  console.log(`Seeded ${profile.name} (${user.id})`);
}

for (const profile of seedProfiles) {
  await seedProfile(profile);
}

console.log(`Seeded ${seedProfiles.length} launch profiles.`);
