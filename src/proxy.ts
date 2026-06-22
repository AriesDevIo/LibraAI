import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (this Next.js renames `middleware` → `proxy`). Runs before every
 * matched request to:
 *   1. refresh the Supabase auth cookie so SSR stays signed in, and
 *   2. gate access — unauthenticated users can't reach protected pages, and
 *      signed-in users are bounced off the auth pages.
 *
 * Stale `sb-` cookies (deleted user / bad JWT) are wiped so a broken session
 * can't linger (supports A07).
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Until Supabase is configured (no .env.local yet), do nothing — this keeps
  // the app (and every parallel dev server) working before auth is wired up.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return supabaseResponse;

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicPage =
    pathname === "/" ||
    isAuthPage ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/editor") || // standalone demo
    pathname.startsWith("/canvas") || // standalone demo
    pathname.startsWith("/assistant") || // standalone demo
    pathname === "/privacy" ||
    pathname === "/terms";
  const isProtected =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  const sbCookies = request.cookies
    .getAll()
    .filter((c) => c.name.startsWith("sb-"));
  const isStaleSession = !!authError || (sbCookies.length > 0 && !user);

  if (isStaleSession) {
    const response = isPublicPage
      ? NextResponse.next({ request })
      : (() => {
          const url = request.nextUrl.clone();
          url.pathname = "/login";
          return NextResponse.redirect(url);
        })();
    sbCookies.forEach((c) => {
      response.cookies.set(c.name, "", { maxAge: 0, path: "/" });
      response.cookies.delete(c.name);
    });
    return response;
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
