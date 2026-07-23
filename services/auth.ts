import { createClient } from "@/supabase/client";

export const authService = {
  async sendOtp(phone: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    if (error) throw error;
  },

  async verifyOtp(phone: string, token: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: "sms",
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) throw error;
  },
};
