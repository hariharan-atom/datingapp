"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Instagram, Music2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CompressedImagePicker } from "@/components/media/compressed-image-picker";
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
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const handlePhotoChange = useCallback(
    (files: File[]) => setSelectedPhotos(files),
    [],
  );
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
    const supabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    if (selectedPhotos.length && supabaseConfigured) {
      const [{ uploadUserImage }, { createClient }] = await Promise.all([
        import("@/services/media/user-image-upload"),
        import("@/supabase/client"),
      ]);
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Sign in before uploading profile photos.");

      const uploaded = [];
      for (const file of selectedPhotos) {
        uploaded.push(
          await uploadUserImage({
            file,
            purpose: "profile",
          }),
        );
      }

      const { error: photoError } = await supabase.from("photos").insert(
        uploaded.map((image, index) => ({
          user_id: user.id,
          storage_path: image.path,
          sort_order: index + 3,
          is_primary: false,
          moderation_status: "pending",
          width: image.width,
          height: image.height,
        })),
      );
      if (photoError) throw photoError;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    toast.success(
      selectedPhotos.length
        ? `${selectedPhotos.length} compressed photo${
            selectedPhotos.length === 1 ? "" : "s"
          } saved`
        : "Profile updated",
      {
        description: selectedPhotos.length
          ? "Every uploaded image is 150 KB or less."
          : undefined,
      },
    );
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
          <CompressedImagePicker
            existingImages={[me.photo, me.photo, me.photo]}
            maxImages={6}
            onChange={handlePhotoChange}
            className="mt-4"
          />
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
              <Instagram className="size-5 text-blue-600" />
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
          border-color: rgba(37, 99, 235, 0.35);
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.05);
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
