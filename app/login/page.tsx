"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  const [showPassword, setShowPassword] = useState(false);
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

  const error = searchParams.get("error");

  return (
    <div className="safe-top min-h-dvh bg-[radial-gradient(circle_at_top,#dbeafe_0%,#ffffff_48%)]">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-[calc(24px+var(--safe-bottom))] pt-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-[18px] bg-gradient-to-br from-primary to-secondary font-black text-white shadow-glow">
            A
          </span>
          <div>
            <p className="text-lg font-black tracking-[-0.035em]">The Atom</p>
            <p className="text-xs font-medium text-muted">
              Meet with intention
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-bold text-primary">
              <Heart className="size-3.5" fill="currentColor" />
              Thoughtful dating for India
            </span>
            <h1 className="mt-5 text-[38px] font-black leading-[1.05] tracking-[-0.055em]">
              Real people.
              <br />
              Better connections.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Create your profile instantly or return to your matches. No email
              verification is required.
            </p>
          </motion.div>

          <section className="mt-8 rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-float backdrop-blur-xl">
            <div className="grid grid-cols-2 rounded-[18px] bg-surface p-1">
              {[
                { value: "create" as const, label: "Create account" },
                { value: "login" as const, label: "Log in" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setMode(item.value)}
                  className={`h-11 rounded-[15px] text-sm font-bold transition-all ${
                    mode === item.value
                      ? "bg-white text-primary shadow-soft"
                      : "text-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-2xl bg-red-50 px-3 py-2.5 text-xs leading-5 text-danger"
              >
                {error === "configuration"
                  ? "Authentication is not configured on this deployment."
                  : "That sign-in link is invalid or expired. Request a new one below."}
              </p>
            )}

            <form onSubmit={submit} className="mt-5">
              <label>
                <span className="mb-2 block text-xs font-bold">
                  Email address
                </span>
                <span className="flex h-14 items-center gap-3 rounded-input border border-border bg-surface px-4 focus-within:border-primary/40">
                  <Mail className="size-5 text-muted" />
                  <input
                    {...register("email")}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </span>
              </label>
              {errors.email && (
                <p className="mt-2 text-xs text-danger">
                  {errors.email.message}
                </p>
              )}

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-bold">Password</span>
                <span className="flex h-14 items-center gap-3 rounded-input border border-border bg-surface px-4 focus-within:border-primary/40">
                  <LockKeyhole className="size-5 text-muted" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "create" ? "new-password" : "current-password"
                    }
                    placeholder="At least 8 characters"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="grid size-9 place-items-center text-muted"
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
                className="mt-4"
              >
                {mode === "create" ? "Create my account" : "Log in"}
                <ArrowRight className="size-5" />
              </Button>
            </form>

            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-primary-soft/70 p-3 text-[11px] leading-5 text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              Accounts open immediately without a verification email. Your
              password protects your profile and conversations.
            </div>
          </section>
        </div>

        <p className="text-center text-[11px] leading-5 text-muted">
          By continuing, you confirm you’re 18+ and agree to our{" "}
          <Link href="/settings/legal" className="font-bold text-ink">
            Terms and Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
