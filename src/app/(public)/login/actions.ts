"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NEXT_COOKIE, NEXT_COOKIE_MAX_AGE } from "@/lib/auth/next-cookie";
import { safeNextPath } from "@/lib/auth/safe-redirect";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

// Sends a one-time sign-in link by email. There are no passwords to store or reset.
export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email.includes("@")) {
    redirect(`/login?error=email&next=${encodeURIComponent(next)}`);
  }

  // Send the link back to whichever address the form was used on (local,
  // a Vercel preview or the live site), so one setting works everywhere.
  const origin = (await headers()).get("origin") ?? siteUrl();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // The email template adds ?token_hash=... to this address (see
      // supabase/templates/). Keep it free of its own "?".
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/login?error=send&next=${encodeURIComponent(next)}`);
  }
  (await cookies()).set(NEXT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: NEXT_COOKIE_MAX_AGE,
    path: "/",
  });
  redirect("/login?sent=1");
}
