import { createClient } from "@/supabase/client";

export type AuthMode = "create" | "login";

export const authService = {
  async sendEmailOtp(email: string, mode: AuthMode, next = "/onboarding") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: mode === "create",
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) throw error;
  },

  async verifyEmailOtp(email: string, token: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await createClient().auth.signOut({ scope: "global" });
    if (error) throw error;
  },
};
