"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Download, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa";
import { authService, type AuthMode } from "@/services/auth";
import { safeNextPath } from "@/utils/auth-routing";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("create");
  const [submitting, setSubmitting] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { canInstall, install, isInstalled, isIos } = usePwaInstall();
  const next = safeNextPath(
    searchParams.get("next"),
    mode === "create" ? "/onboarding" : "/home",
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async ({ email, password }) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        await authService.createAccount(email, password);
        toast.success("Account created", {
          description: "Let’s build your profile.",
        });
      } else {
        await authService.signIn(email, password);
      }
      router.replace(next);
      router.refresh();
    } catch (error) {
      toast.error(mode === "create" ? "Account not created" : "Login failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  });

  const installApp = async () => {
    if (isIos) {
      toast.info("Add The Atom to your Home Screen", {
        description:
          "Tap the Share button in Safari, then choose “Add to Home Screen”.",
        duration: 7000,
      });
      return;
    }

    if (!canInstall) {
      toast.info("Install from your browser", {
        description:
          "Open the browser menu and choose “Install app” or “Add to Home screen”.",
        duration: 7000,
      });
      return;
    }

    setInstalling(true);
    try {
      const result = await install();
      if (result === "accepted") {
        toast.success("The Atom was added to your device");
      }
    } finally {
      setInstalling(false);
    }
  };

  const error = searchParams.get("error");

  return (
    <div className="safe-top min-h-dvh bg-[#f8f8f6]">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[calc(24px+var(--safe-bottom))] pt-6">
        <header className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-white">
            A
          </span>
          <p className="text-base font-bold tracking-[-0.025em]">The Atom</p>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Dating with intention
            </p>
            <h1 className="mt-3 max-w-sm text-[40px] font-bold leading-[1.04] tracking-[-0.05em] text-ink">
              Meet someone real.
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-6 text-muted">
              A thoughtful place for genuine conversations and meaningful
              connections.
            </p>
          </motion.div>

          <section className="mt-9">
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 border-b border-border"
            >
              {[
                { value: "create" as const, label: "Create account" },
                { value: "login" as const, label: "Log in" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setMode(item.value)}
                  role="tab"
                  aria-selected={mode === item.value}
                  aria-controls="auth-form"
                  className={`relative h-12 text-sm font-semibold transition-colors ${
                    mode === item.value
                      ? "text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                  {mode === item.value && (
                    <motion.span
                      layoutId="active-auth-mode"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs leading-5 text-danger"
              >
                {error === "configuration"
                  ? "Authentication is not configured on this deployment."
                  : "Authentication could not be completed. Please try again."}
              </p>
            )}

            <form id="auth-form" onSubmit={submit} className="mt-7">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Email address
                </span>
                <input
                  {...register("email")}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-14 w-full rounded-2xl border border-border bg-white px-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>
              {errors.email && (
                <p className="mt-2 text-xs text-danger">
                  {errors.email.message}
                </p>
              )}

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold">
                  Password
                </span>
                <span className="relative block">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "create" ? "new-password" : "current-password"
                    }
                    placeholder="At least 8 characters"
                    className="h-14 w-full rounded-2xl border border-border bg-white px-4 pr-14 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </span>
              </label>
              {errors.password && (
                <p className="mt-2 text-xs text-danger">
                  {errors.password.message}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={submitting}
                className="mt-6 rounded-2xl bg-primary shadow-none [background-image:none] hover:bg-primary-hover"
              >
                {mode === "create" ? "Create account" : "Log in"}
              </Button>

              {!isInstalled && (
                <Button
                  type="button"
                  variant="soft"
                  fullWidth
                  size="lg"
                  loading={installing}
                  onClick={installApp}
                  className="mt-3 rounded-2xl shadow-none"
                >
                  <Download className="size-4" />
                  Download app
                </Button>
              )}
            </form>
          </section>
        </div>

        <p className="mx-auto max-w-xs text-center text-[11px] leading-5 text-muted">
          By continuing, you confirm you’re 18+ and agree to our{" "}
          <Link
            href="/settings/legal"
            className="font-semibold text-ink underline decoration-border underline-offset-2"
          >
            Terms and Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
