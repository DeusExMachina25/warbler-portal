import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const profile = await requireAdmin();

  return (
    <ComingSoon title="Admin console" step={2}>
      <p className="mt-6 text-sm">Signed in as {profile.email} (admin).</p>
    </ComingSoon>
  );
}
