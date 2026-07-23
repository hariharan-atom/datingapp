"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Check,
  GripVertical,
  Instagram,
  Music2,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { profiles } from "@/utils/mock-data";

const profileSchema = z.object({
  name: z.string().min(2, "Your name is required").max(40),
  bio: z.string().min(20, "Add a little more detail").max(300),
  occupation: z.string().min(2).max(80),
  education: z.string().min(2).max(80),
  height: z.number().min(120).max(230),
  prompt: z.string().min(10).max(220),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const me = profiles[3];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Hari",
      bio: "Building thoughtful products, exploring new neighbourhoods, and always saving room for dessert.",
      occupation: "Software Engineer",
      education: "Anna University",
      height: 178,
      prompt:
        "A long walk, strong filter coffee, and a conversation that forgets the time.",
    },
  });
  const bio = watch("bio");

  const submit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Profile updated");
    router.push("/profile");
  };

  return (
    <AppShell title="Edit profile" back hideNav hideAi>
      <form
        onSubmit={handleSubmit(submit)}
        className="mx-auto max-w-2xl space-y-7 px-4 py-5 min-[768px]:px-6"
      >
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Photos</h2>
              <p className="mt-1 text-xs text-muted">Tap and drag to reorder</p>
            </div>
            <span className="text-xs font-bold text-success">4 of 6</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[me.photo, me.photo, me.photo, null, null, null].map(
              (photo, index) =>
                photo && index < 3 ? (
                  <div
                    key={index}
                    className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-surface"
                  >
                    <Image
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                    <GripVertical className="absolute left-2 top-2 size-4 text-white drop-shadow" />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-1 text-[8px] font-bold uppercase backdrop-blur">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/35 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    key={index}
                    className="grid aspect-[3/4] place-items-center rounded-[20px] border border-dashed border-secondary/30 bg-secondary/5 text-secondary"
                  >
                    <Camera className="size-5" />
                  </button>
                ),
            )}
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-input bg-primary-soft p-3 text-left"
          >
            <Sparkles className="size-5 text-primary" />
            <span>
              <span className="block text-xs font-bold text-primary">
                AI photo feedback
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">
                Your main photo has clear lighting and a natural smile.
              </span>
            </span>
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">The basics</h2>
          <Field label="Name" error={errors.name?.message}>
            <input {...register("name")} className="field-input" />
          </Field>
          <Field label="Bio" error={errors.bio?.message}>
            <textarea
              {...register("bio")}
              rows={4}
              className="field-input resize-none py-3"
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-muted">
              {bio?.length ?? 0}/300
            </span>
          </Field>
          <Field label="Occupation" error={errors.occupation?.message}>
            <input {...register("occupation")} className="field-input" />
          </Field>
          <Field label="Education" error={errors.education?.message}>
            <input {...register("education")} className="field-input" />
          </Field>
          <Field label="Height (cm)" error={errors.height?.message}>
            <input
              type="number"
              inputMode="numeric"
              {...register("height", { valueAsNumber: true })}
              className="field-input"
            />
          </Field>
        </section>

        <section>
          <h2 className="text-lg font-bold">Interests</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Coding", "Travel", "Music", "Books", "Fitness", "Gaming"].map(
              (item, index) => (
                <Chip key={item} active={index < 5}>
                  {item}
                </Chip>
              ),
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">Profile prompt</h2>
          <p className="mt-2 text-sm font-semibold text-primary">
            My simple pleasures…
          </p>
          <textarea
            {...register("prompt")}
            rows={3}
            className="mt-3 w-full resize-none rounded-input border border-border bg-surface p-4 text-sm leading-6 outline-none focus:border-secondary/30 focus:bg-white"
          />
          {errors.prompt && (
            <p className="mt-1 text-xs text-danger">{errors.prompt.message}</p>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold">Connected accounts</h2>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              className="flex h-14 w-full items-center gap-3 rounded-input bg-surface px-4"
            >
              <Instagram className="size-5 text-pink-600" />
              <span className="text-sm font-semibold">Instagram</span>
              <span className="ml-auto text-xs font-bold text-primary">
                Connect
              </span>
            </button>
            <button
              type="button"
              className="flex h-14 w-full items-center gap-3 rounded-input bg-surface px-4"
            >
              <Music2 className="size-5 text-success" />
              <span className="text-sm font-semibold">Spotify</span>
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-success">
                <Check className="size-3.5" /> Connected
              </span>
            </button>
          </div>
        </section>

        <div className="safe-bottom sticky bottom-0 -mx-4 border-t border-border bg-white/90 px-4 py-3 backdrop-blur-xl min-[768px]:-mx-6 min-[768px]:px-6">
          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
      <style jsx global>{`
        .field-input {
          width: 100%;
          height: 54px;
          border-radius: 18px;
          border: 1px solid #ececec;
          background: #fafafa;
          padding: 0 16px;
          font-size: 14px;
          outline: none;
        }
        .field-input:focus {
          border-color: rgba(124, 92, 252, 0.35);
          background: white;
          box-shadow: 0 0 0 4px rgba(124, 92, 252, 0.05);
        }
      `}</style>
    </AppShell>
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
    <label className="relative block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
