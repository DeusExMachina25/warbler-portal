"use server";

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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=send&next=${encodeURIComponent(next)}`);
  }
  redirect("/login?sent=1");
}
