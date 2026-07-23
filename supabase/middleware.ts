import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_AUTH_ROUTES = ["/login"];
const PUBLIC_API_ROUTES = ["/api/auth/register", "/api/health"];

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  return target;
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname, search } = request.nextUrl;
  const isPublicApiRoute = PUBLIC_API_ROUTES.includes(pathname);

  if (!url || !anonKey) {
    if (
      PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route)) ||
      isPublicApiRoute
    ) {
      return NextResponse.next({ request });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "configuration");
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicApiRoute) {
    return response;
  }

  if (!user) {
    if (isPublicAuthRoute) return response;

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", `${pathname}${search}`);
    }
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();
  const onboardingComplete = appUser?.onboarding_complete === true;

  if (pathname === "/" || isPublicAuthRoute) {
    const destination = request.nextUrl.clone();
    destination.pathname = onboardingComplete ? "/home" : "/onboarding";
    destination.search = "";
    return copyCookies(response, NextResponse.redirect(destination));
  }

  if (!onboardingComplete && pathname !== "/onboarding") {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    onboardingUrl.search = "";
    return copyCookies(response, NextResponse.redirect(onboardingUrl));
  }

  if (onboardingComplete && pathname === "/onboarding") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";
    homeUrl.search = "";
    return copyCookies(response, NextResponse.redirect(homeUrl));
  }

  return response;
}
