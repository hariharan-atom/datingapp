"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { authService, type AuthMode } from "@/services/auth";
import { createClient } from "@/supabase/client";
import { safeNextPath } from "@/utils/auth-routing";

const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type OtpForm = z.infer<typeof otpSchema>;

export default function OtpPage() {
  return (
    <Suspense>
      <OtpContent />
    </Suspense>
  );
}

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode: AuthMode =
    searchParams.get("mode") === "login" ? "login" : "create";
  const next = safeNextPath(
    searchParams.get("next"),
    mode === "create" ? "/onboarding" : "/home",
  );
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    if (!email) router.replace("/login");

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace(next);
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [email, next, router]);

  const verify = handleSubmit(async ({ token }) => {
    setSubmitting(true);
    try {
      await authService.verifyEmailOtp(email, token);
      router.replace(next);
      router.refresh();
    } catch (error) {
      toast.error("Code not accepted", {
        description:
          error instanceof Error ? error.message : "Request a new code.",
      });
    } finally {
      setSubmitting(false);
    }
  });

  const resend = async () => {
    setResending(true);
    try {
      await authService.sendEmailOtp(email, mode, next);
      toast.success("A fresh sign-in email is on its way");
    } catch (error) {
      toast.error("Couldn’t resend email", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="safe-top min-h-dvh bg-[radial-gradient(circle_at_top,#dbeafe_0%,#ffffff_50%)]">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-[calc(24px+var(--safe-bottom))] pt-5">
        <Link
          href="/login"
          className="grid size-11 place-items-center rounded-2xl bg-white shadow-soft"
          aria-label="Back to login"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div className="flex flex-1 flex-col justify-center pb-10">
          <span className="grid size-16 place-items-center rounded-[22px] bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
            <Mail className="size-7" />
          </span>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-primary">
            Check your inbox
          </p>
          <h1 className="mt-2 text-[34px] font-black leading-tight tracking-[-0.05em]">
            Your secure sign-in is waiting.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            We sent a one-time link to{" "}
            <span className="font-bold text-ink">{email}</span>. Tap that link,
            or enter a six-digit code if your email includes one.
          </p>

          <form onSubmit={verify} className="mt-8">
            <label>
              <span className="mb-2 block text-xs font-bold">
                One-time code
              </span>
              <input
                {...register("token")}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="• • • • • •"
                className="h-16 w-full rounded-input border border-border bg-white px-4 text-center text-2xl font-black tracking-[0.4em] shadow-soft outline-none focus:border-primary/40"
              />
            </label>
            {errors.token && (
              <p className="mt-2 text-xs text-danger">{errors.token.message}</p>
            )}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
              className="mt-4"
            >
              <CheckCircle2 className="size-5" />
              Verify and continue
            </Button>
          </form>

          <button
            type="button"
            onClick={() => void resend()}
            disabled={resending}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 text-sm font-bold text-primary disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${resending ? "animate-spin" : ""}`}
            />
            Resend email
          </button>
        </div>
      </main>
    </div>
  );
}
