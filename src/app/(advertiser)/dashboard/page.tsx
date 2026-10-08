import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");

  return (
    <ComingSoon title="Your bookings" step={3}>
      <p className="mt-6 text-sm">Signed in as {profile.email}.</p>
    </ComingSoon>
  );
}
