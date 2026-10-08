// The sign-in email links here with a one-time token. Unlike /auth/callback,
// this works whichever phone, computer or browser opens the email, because
// the token is checked by Supabase rather than matched to a cookie.
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { NEXT_COOKIE } from "@/lib/auth/next-cookie";
import { safeNextPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const next = safeNextPath(request.cookies.get(NEXT_COOKIE)?.value);

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete(NEXT_COOKIE);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
