"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=send&next=${encodeURIComponent(next)}`);
  }
  redirect("/login?sent=1");
}
