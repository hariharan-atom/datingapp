"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Heart,
  Languages,
  LocateFixed,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CompressedImagePicker } from "@/components/media/compressed-image-picker";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { onboardingService, type OnboardingGoal } from "@/services/onboarding";

const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Tell us your first name").max(40),
  birthday: z.string().refine((value) => {
    const birthday = new Date(value);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    return !Number.isNaN(birthday.getTime()) && birthday <= cutoff;
  }, "You must be at least 18 years old"),
  gender: z.enum(["woman", "man", "non_binary", "self_described"]),
  bio: z.string().trim().min(20, "Write at least 20 characters").max(300),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const steps = [
  "Welcome",
  "Language",
  "Profile",
  "Photos",
  "Bio",
  "Interests",
  "Preferences",
  "Safety",
];

const languages = [
  { label: "English", locale: "en-IN" },
  { label: "हिन्दी", locale: "hi-IN" },
  { label: "தமிழ்", locale: "ta-IN" },
  { label: "తెలుగు", locale: "te-IN" },
  { label: "ಕನ್ನಡ", locale: "kn-IN" },
  { label: "മലയാളം", locale: "ml-IN" },
];

const interests = [
  "Travel",
  "Music",
  "Movies",
  "Books",
  "Fitness",
  "Cooking",
  "Photography",
  "Gaming",
  "Coding",
  "Pets",
  "Cricket",
  "Art",
];

const goals: { label: string; value: OnboardingGoal }[] = [
  { label: "Long-term relationship", value: "long_term" },
  { label: "Life partner", value: "life_partner" },
  { label: "Dating", value: "dating" },
  { label: "Open to exploring", value: "exploring" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [locale, setLocale] = useState("en-IN");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Travel",
    "Music",
    "Books",
  ]);
  const [goal, setGoal] = useState<OnboardingGoal>("long_term");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    watch,
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      birthday: "",
      gender: "man",
      bio: "",
    },
  });
  const bio = watch("bio");

  const next = async () => {
    if (step === 2 && !(await trigger(["name", "birthday", "gender"]))) {
      return;
    }
    if (step === 3 && photoFiles.length === 0) {
      toast.error("Add at least one clear profile photo");
      return;
    }
    if (step === 4 && !(await trigger("bio"))) return;
    if (step === 5 && selectedInterests.length < 5) {
      toast.error("Choose at least five interests");
      return;
    }

    if (step === steps.length - 1) {
      const values = getValues();
      setSubmitting(true);
      try {
        await onboardingService.complete({
          locale,
          name: values.name,
          birthday: values.birthday,
          gender: values.gender,
          bio: values.bio,
          interests: selectedInterests,
          relationshipGoal: goal,
          photos: photoFiles,
        });
        router.replace("/home");
        router.refresh();
      } catch (error) {
        toast.error("Couldn’t finish your profile", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((value) => value + 1);
  };

  return (
    <div className="safe-top min-h-dvh bg-white">
      <header className="flex h-[60px] items-center gap-3 px-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="grid size-10 place-items-center rounded-2xl bg-surface"
            aria-label="Previous step"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span className="grid size-10 place-items-center rounded-[15px] bg-gradient-to-br from-primary to-secondary text-base font-bold text-white">
            A
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">
            {step + 1}/{steps.length}
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
            <motion.div
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-60px-var(--safe-top))] max-w-xl flex-col px-5 pb-[calc(24px+var(--safe-bottom))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            {step === 0 && <WelcomeStep />}
            {step === 1 && (
              <OnboardingSection
                icon={Languages}
                eyebrow="Feel at home"
                title="Choose your language"
                description="You can change this later in settings."
              >
                <div className="space-y-2">
                  {languages.map((item) => (
                    <button
                      type="button"
                      key={item.locale}
                      onClick={() => setLocale(item.locale)}
                      className={`flex h-14 w-full items-center rounded-input border px-4 text-left text-sm font-semibold ${
                        locale === item.locale
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border"
                      }`}
                    >
                      {item.label}
                      {locale === item.locale && (
                        <Check className="ml-auto size-5" />
                      )}
                    </button>
                  ))}
                </div>
              </OnboardingSection>
            )}
            {step === 2 && (
              <OnboardingSection
                icon={Heart}
                eyebrow="The real you"
                title="Tell us the basics"
                description="Your first name and age will be visible on your profile."
              >
                <div className="space-y-4">
                  <Field label="First name" error={errors.name?.message}>
                    <input
                      {...register("name")}
                      autoComplete="given-name"
                      placeholder="What should people call you?"
                      className="h-14 w-full rounded-input border border-border bg-surface px-4 text-sm outline-none focus:border-primary/40"
                    />
                  </Field>
                  <Field label="Birthday" error={errors.birthday?.message}>
                    <input
                      {...register("birthday")}
                      type="date"
                      className="h-14 w-full rounded-input border border-border bg-surface px-4 text-sm outline-none focus:border-primary/40"
                    />
                  </Field>
                  <Field label="Gender identity" error={errors.gender?.message}>
                    <span className="relative block">
                      <select
                        {...register("gender")}
                        className="h-14 w-full appearance-none rounded-input border border-border bg-surface px-4 text-sm outline-none focus:border-primary/40"
                      >
                        <option value="woman">Woman</option>
                        <option value="man">Man</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="self_described">Self-described</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-5 size-4 text-muted" />
                    </span>
                  </Field>
                </div>
              </OnboardingSection>
            )}
            {step === 3 && (
              <OnboardingSection
                icon={Camera}
                eyebrow="Show your energy"
                title="Add your best photos"
                description="Every selected image is compressed to 150 KB or less before upload."
              >
                <CompressedImagePicker maxImages={6} onChange={setPhotoFiles} />
                <div className="mt-4 flex gap-3 rounded-card bg-primary-soft p-4">
                  <Sparkles className="size-5 shrink-0 text-primary" />
                  <p className="text-xs leading-5 text-muted">
                    Start with a clear recent photo. Add more photos later from
                    your profile.
                  </p>
                </div>
              </OnboardingSection>
            )}
            {step === 4 && (
              <OnboardingSection
                icon={Sparkles}
                eyebrow="In your own words"
                title="Write a short bio"
                description="Specific beats impressive. Give someone an easy way to start a conversation."
              >
                <label className="relative block">
                  <textarea
                    {...register("bio")}
                    rows={6}
                    placeholder="A little about you, your everyday life, and what makes you smile…"
                    className="w-full resize-none rounded-input border border-border bg-surface p-4 text-sm leading-6 outline-none focus:border-primary/40"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-muted">
                    {bio?.length ?? 0}/300
                  </span>
                </label>
                {errors.bio && (
                  <p className="mt-2 text-xs text-danger">
                    {errors.bio.message}
                  </p>
                )}
              </OnboardingSection>
            )}
            {step === 5 && (
              <OnboardingSection
                icon={Sparkles}
                eyebrow="What lights you up?"
                title="Choose your interests"
                description="Pick at least five so we can make better introductions."
              >
                <div className="flex flex-wrap gap-2">
                  {interests.map((item) => (
                    <Chip
                      key={item}
                      active={selectedInterests.includes(item)}
                      onClick={() =>
                        setSelectedInterests((current) =>
                          current.includes(item)
                            ? current.filter((interest) => interest !== item)
                            : [...current, item],
                        )
                      }
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
                <p className="mt-4 text-xs font-semibold text-muted">
                  {selectedInterests.length} selected
                </p>
              </OnboardingSection>
            )}
            {step === 6 && (
              <OnboardingSection
                icon={LocateFixed}
                eyebrow="Your kind of connection"
                title="Set your preferences"
                description="These guide discovery—not who you’re allowed to meet."
              >
                <p className="mb-3 text-xs font-bold">Relationship goal</p>
                <div className="space-y-2">
                  {goals.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setGoal(item.value)}
                      className={`flex h-[52px] w-full items-center rounded-input border px-4 text-left text-sm font-semibold ${
                        goal === item.value
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border"
                      }`}
                    >
                      {item.label}
                      {goal === item.value && (
                        <Check className="ml-auto size-4" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Preference label="Age range" value="24 – 34" />
                  <Preference label="Distance" value="Within 25 km" />
                </div>
              </OnboardingSection>
            )}
            {step === 7 && (
              <OnboardingSection
                icon={ShieldCheck}
                eyebrow="Safety by design"
                title="A safer place to connect"
                description="Verification, reporting, blocking, and privacy controls are always available."
              >
                <div className="relative mx-auto grid aspect-square max-w-[250px] place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary-soft to-secondary/10">
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-secondary/25" />
                  <ShieldCheck className="size-14 text-primary" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "Images are compressed before secure upload",
                    "Block and report controls stay one tap away",
                    "You control profile visibility and location precision",
                  ].map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-3 text-sm text-muted"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-success">
                        <Check className="size-3.5" />
                      </span>
                      {item}
                    </p>
                  ))}
                </div>
              </OnboardingSection>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6">
          <Button
            fullWidth
            size="lg"
            loading={submitting}
            onClick={() => void next()}
          >
            {step === steps.length - 1 ? "Start discovering" : "Continue"}
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="flex flex-1 flex-col justify-center pb-8">
      <div className="relative mx-auto flex h-60 w-full max-w-sm items-end justify-center">
        <div className="absolute left-10 top-10 size-24 rounded-full bg-primary/15 blur-2xl" />
        <motion.div
          initial={{ x: -18, rotate: -12, opacity: 0 }}
          animate={{ x: 0, rotate: -8, opacity: 1 }}
          className="relative z-10 h-52 w-36 overflow-hidden rounded-[30px] border-4 border-white shadow-float"
        >
          <Image
            src="/images/profiles/ananya.webp"
            alt="A fictional The Atom member"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <motion.div
          initial={{ x: 18, rotate: 12, opacity: 0 }}
          animate={{ x: 0, rotate: 8, opacity: 1 }}
          className="relative -ml-7 h-52 w-36 overflow-hidden rounded-[30px] border-4 border-white shadow-float"
        >
          <Image
            src="/images/profiles/arjun.webp"
            alt="A fictional The Atom member"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <span className="absolute bottom-3 z-20 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
          <Heart className="size-6" fill="currentColor" />
        </span>
      </div>
      <p className="mt-8 text-center text-sm font-bold uppercase tracking-[0.22em] text-primary">
        Welcome to The Atom
      </p>
      <h1 className="mt-3 text-balance text-center text-[38px] font-bold leading-[1.05] tracking-[-0.055em]">
        Build a profile that feels like you.
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-6 text-muted">
        A few thoughtful details help us introduce you to compatible people.
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

function Preference({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-surface p-4">
      <span className="text-[10px] text-muted">{label}</span>
      <span className="mt-1 block text-sm font-bold">{value}</span>
    </div>
  );
}

function OnboardingSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: typeof Heart;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-8">
      <span className="grid size-12 place-items-center rounded-[18px] bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.045em]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}
