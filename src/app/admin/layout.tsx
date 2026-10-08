import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

// Every page under /admin checks for an admin first. Server actions check
// again on their own, because they can be called directly.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/admin" className="hover:underline">Overview</Link>
        <Link href="/admin/formats" className="hover:underline">Packaging formats</Link>
        <Link href="/admin/events" className="hover:underline">Events</Link>
      </nav>
      {children}
    </div>
  );
}
