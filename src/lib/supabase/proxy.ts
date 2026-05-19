import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv, hasSupabaseEnv } from "@/lib/env";

const protectedPrefixes = [
  "/dashboard",
  "/cases",
  "/submissions",
  "/indicators",
  "/reports",
  "/admin",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isProfileComplete(profile: { username: string | null; profile_completed_at: string | null } | null) {
  return Boolean(profile?.username && profile?.profile_completed_at);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (!hasSupabaseEnv()) {
    return response;
  }

  const env = getPublicEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, profile_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    const completed = isProfileComplete(profile ?? null);

    if (!completed && isProtectedPath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/complete-profile";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (!completed && pathname === "/auth/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/complete-profile";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (completed && pathname === "/auth/complete-profile") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (completed && pathname === "/auth/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
