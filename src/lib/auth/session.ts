// Helpers for server pages that need to know who is signed in.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "advertiser" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  organisation_id: string | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, organisation_id")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

export async function requireProfile(nextPath: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile("/admin");
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
