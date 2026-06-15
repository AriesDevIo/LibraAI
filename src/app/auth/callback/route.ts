import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Magic-link landing. Supabase sends both a 6-digit code (entered on the auth
 * pages) and a clickable link; this handles the link. Newer links carry a
 * `token_hash` + `type`, older ones a `code` — support both, then redirect to
 * the app (or `?next=`, validated to a same-site path so it can't be used as an
 * open redirect — A01/A02).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email" | "magiclink" | "recovery" | "invite",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
