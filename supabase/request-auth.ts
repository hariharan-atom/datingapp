import type { NextRequest } from "next/server";

import { createAdminClient } from "@/supabase/admin";
import { createClient as createServerClient } from "@/supabase/server";

export async function authenticateRequest(request: NextRequest) {
  const admin = createAdminClient();
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : undefined;

  if (token) {
    const { data, error } = await admin.auth.getUser(token);
    return { admin, user: error ? null : data.user };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  return { admin, user: error ? null : data.user };
}
