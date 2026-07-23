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
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const onboardingSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  otp: z.string().length(6, "Enter the 6-digit code"),
  name: z.string().min(2, "Tell us your first name").max(40),
  birthday: z.string().min(1, "Your birthday is required"),
  bio: z.string().min(20, "Write at least 20 characters").max(300),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const steps = [
  "Welcome",
  "Language",
  "Login",
  "Verify",
  "Profile",
  "Photos",
  "Bio",
  "Interests",
  "Preferences",
  "Safety",
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("English");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Travel",
    "Music",
    "Books",
  ]);
  const [goal, setGoal] = useState("Long-term relationship");
  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phone: "",
      otp: "",
      name: "",
      birthday: "",
      bio: "",
    },
  });
  const bio = watch("bio");

  const next = async () => {
    const fieldByStep: Partial<Record<number, keyof OnboardingForm>> = {
      2: "phone",
      3: "otp",
      4: "name",
      6: "bio",
    };
    const field = fieldByStep[step];
    if (field && !(await trigger(field))) return;
    if (step === steps.length - 1) {
      router.push("/home");
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
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span className="grid size-10 place-items-center rounded-[15px] bg-gradient-to-br from-primary to-secondary text-base font-bold text-white">
            M
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
                  {[
                    "English",
                    "हिन्दी",
                    "தமிழ்",
                    "తెలుగు",
                    "ಕನ್ನಡ",
                    "മലയാളം",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setLanguage(item)}
                      className={`flex h-14 w-full items-center rounded-input border px-4 text-left text-sm font-semibold ${
                        language === item
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border"
                      }`}
                    >
                      {item}
                      {language === item && (
                        <Check className="ml-auto size-5" />
                      )}
                    </button>
                  ))}
                </div>
              </OnboardingSection>
            )}
            {step === 2 && (
              <OnboardingSection
                icon={MessageCircleHeart}
                eyebrow="Welcome to Milo"
                title="What’s your mobile number?"
                description="We’ll send a one-time code. No passwords to remember."
              >
                <label className="flex h-14 items-center rounded-input border border-border bg-surface px-4 focus-within:border-secondary/30">
                  <span className="border-r border-border pr-3 text-sm font-bold">
                    +91
                  </span>
                  <input
                    {...register("phone")}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="98765 43210"
                    className="min-w-0 flex-1 bg-transparent pl-3 text-base outline-none"
                  />
                </label>
                {errors.phone && (
                  <p className="mt-2 text-xs text-danger">
                    {errors.phone.message}
                  </p>
                )}
                <p className="mt-4 text-[11px] leading-5 text-muted">
                  By continuing, you confirm you’re 18+ and agree to our Terms
                  and Privacy Policy.
                </p>
              </OnboardingSection>
            )}
            {step === 3 && (
              <OnboardingSection
                icon={ShieldCheck}
                eyebrow="Check your messages"
                title="Enter your verification code"
                description="We sent a six-digit code to your mobile number."
              >
                <input
                  {...register("otp")}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="• • • • • •"
                  className="h-16 w-full rounded-input border border-border bg-surface px-4 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:border-secondary/30"
                />
                {errors.otp && (
                  <p className="mt-2 text-xs text-danger">
                    {errors.otp.message}
                  </p>
                )}
                <button
                  type="button"
                  className="mt-4 text-sm font-bold text-primary"
                >
                  Resend code in 00:28
                </button>
              </OnboardingSection>
            )}
            {step === 4 && (
              <OnboardingSection
                icon={Heart}
                eyebrow="The real you"
                title="Tell us the basics"
                description="Your first name and age will be visible on your profile."
              >
                <div className="space-y-4">
                  <label>
                    <span className="mb-2 block text-xs font-bold">
                      First name
                    </span>
                    <input
                      {...register("name")}
                      placeholder="What should people call you?"
                      className="h-14 w-full rounded-input border border-border bg-surface px-4 text-sm outline-none focus:border-secondary/30"
                    />
                    {errors.name && (
                      <span className="mt-1 block text-xs text-danger">
                        {errors.name.message}
                      </span>
                    )}
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-bold">
                      Birthday
                    </span>
                    <input
                      {...register("birthday")}
                      type="date"
                      className="h-14 w-full rounded-input border border-border bg-surface px-4 text-sm outline-none focus:border-secondary/30"
                    />
                  </label>
                  <button
                    type="button"
                    className="flex h-14 w-full items-center rounded-input border border-border bg-surface px-4 text-sm"
                  >
                    Gender identity
                    <ChevronDown className="ml-auto size-4 text-muted" />
                  </button>
                </div>
              </OnboardingSection>
            )}
            {step === 5 && (
              <OnboardingSection
                icon={Camera}
                eyebrow="Show your energy"
                title="Add your best photos"
                description="Choose recent, clear photos where you look like yourself."
              >
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2, 3, 4, 5].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="grid aspect-[3/4] place-items-center rounded-[20px] border border-dashed border-secondary/30 bg-secondary/5 text-secondary"
                    >
                      {item === 0 ? (
                        <Image
                          src="/images/profiles/kabir.webp"
                          alt="Selected profile"
                          width={160}
                          height={210}
                          className="size-full rounded-[20px] object-cover"
                        />
                      ) : (
                        <Camera className="size-5" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 rounded-card bg-primary-soft p-4">
                  <Sparkles className="size-5 shrink-0 text-primary" />
                  <p className="text-xs leading-5 text-muted">
                    Add at least three photos: a clear face, a full-length
                    photo, and something you genuinely enjoy.
                  </p>
                </div>
              </OnboardingSection>
            )}
            {step === 6 && (
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
                    className="w-full resize-none rounded-input border border-border bg-surface p-4 text-sm leading-6 outline-none focus:border-secondary/30"
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
                <button
                  type="button"
                  className="mt-4 flex w-full items-center gap-3 rounded-card bg-gradient-to-r from-secondary/10 to-primary/10 p-4 text-left"
                >
                  <Sparkles className="size-5 text-secondary" />
                  <span>
                    <span className="block text-xs font-bold">
                      Help me write it
                    </span>
                    <span className="mt-1 block text-[11px] text-muted">
                      AI asks questions, then drafts in your voice
                    </span>
                  </span>
                </button>
              </OnboardingSection>
            )}
            {step === 7 && (
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
            {step === 8 && (
              <OnboardingSection
                icon={LocateFixed}
                eyebrow="Your kind of connection"
                title="Set your preferences"
                description="These guide discovery—not who you’re allowed to meet."
              >
                <p className="mb-3 text-xs font-bold">Relationship goal</p>
                <div className="space-y-2">
                  {[
                    "Long-term relationship",
                    "Life partner",
                    "Dating",
                    "Open to exploring",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setGoal(item)}
                      className={`flex h-[52px] w-full items-center rounded-input border px-4 text-left text-sm font-semibold ${
                        goal === item
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border"
                      }`}
                    >
                      {item}
                      {goal === item && <Check className="ml-auto size-4" />}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="rounded-[20px] bg-surface p-4 text-left"
                  >
                    <span className="text-[10px] text-muted">Age range</span>
                    <span className="mt-1 block text-sm font-bold">
                      24 – 34
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rounded-[20px] bg-surface p-4 text-left"
                  >
                    <span className="text-[10px] text-muted">Distance</span>
                    <span className="mt-1 block text-sm font-bold">
                      Within 25 km
                    </span>
                  </button>
                </div>
              </OnboardingSection>
            )}
            {step === 9 && (
              <OnboardingSection
                icon={ShieldCheck}
                eyebrow="Safety by design"
                title="Verify the real you"
                description="A quick liveness check helps keep Milo genuine. Your verification media is not public."
              >
                <div className="relative mx-auto grid aspect-square max-w-[260px] place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary-soft to-secondary/10">
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-secondary/25" />
                  <div className="text-center">
                    <ShieldCheck className="mx-auto size-12 text-secondary" />
                    <p className="mt-3 text-sm font-bold">
                      Private liveness check
                    </p>
                    <p className="mx-auto mt-1 max-w-[180px] text-[11px] leading-5 text-muted">
                      Follow a simple on-screen movement
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "Helps prevent fake profiles",
                    "Adds a visible verification badge",
                    "Sensitive media is securely processed",
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
          <Button fullWidth size="lg" onClick={() => void next()}>
            {step === steps.length - 1 ? "Start discovering" : "Continue"}
            <ArrowRight className="size-5" />
          </Button>
          {step === 9 && (
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="mt-4 w-full text-center text-xs font-semibold text-muted"
            >
              Do this later
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="flex flex-1 flex-col justify-center pb-10">
      <div className="relative mx-auto w-full max-w-sm">
        <div className="absolute -left-2 top-12 size-24 rounded-full bg-primary/15 blur-2xl" />
        <div className="absolute -right-2 top-24 size-24 rounded-full bg-secondary/15 blur-2xl" />
        <div className="relative mx-auto flex h-64 items-end justify-center">
          <motion.div
            initial={{ x: -20, rotate: -12, opacity: 0 }}
            animate={{ x: 0, rotate: -8, opacity: 1 }}
            transition={{ type: "spring", delay: 0.15 }}
            className="relative z-10 h-56 w-40 overflow-hidden rounded-[32px] border-4 border-white shadow-float"
          >
            <Image
              src="/images/profiles/ananya.webp"
              alt="A fictional Milo member"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ x: 20, rotate: 12, opacity: 0 }}
            animate={{ x: 0, rotate: 8, opacity: 1 }}
            transition={{ type: "spring", delay: 0.28 }}
            className="relative -ml-8 h-56 w-40 overflow-hidden rounded-[32px] border-4 border-white shadow-float"
          >
            <Image
              src="/images/profiles/arjun.webp"
              alt="A fictional Milo member"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          <motion.span
            animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3.2 }}
            className="absolute bottom-4 z-20 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-glow"
          >
            <Heart className="size-6" fill="currentColor" />
          </motion.span>
        </div>
      </div>
      <p className="mt-8 text-center text-sm font-bold uppercase tracking-[0.22em] text-primary">
        Meet with intention
      </p>
      <h1 className="mt-3 text-balance text-center text-[38px] font-bold leading-[1.05] tracking-[-0.055em]">
        A better way to find your person.
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-6 text-muted">
        Thoughtful matches, honest profiles, and safer conversations—built for
        modern India.
      </p>
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
