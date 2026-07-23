import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/supabase/server";
import { safeNextPath } from "@/utils/auth-routing";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(
    request.nextUrl.searchParams.get("next"),
    "/onboarding",
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const errorUrl = new URL("/login", request.url);
  errorUrl.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(errorUrl);
}
