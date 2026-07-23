import { createClient } from "@/supabase/client";

export type AuthMode = "create" | "login";

async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw new Error("Account not found or password is incorrect.");
  }
  return data;
}

export const authService = {
  async createAccount(email: string, password: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = (await response.json()) as {
      created?: boolean;
      message?: string;
    };

    if (!response.ok) {
      throw new Error(result.message ?? "Couldn’t create your account.");
    }

    return signIn(email, password);
  },

  signIn,

  async signOut() {
    const { error } = await createClient().auth.signOut({ scope: "global" });
    if (error) throw error;
  },
};
