import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

async function countRows(table: "packaging_formats" | "events", filter?: { column: string; value: string }) {
  const supabase = await createClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminOverviewPage() {
  const [formats, events, published] = await Promise.all([
    countRows("packaging_formats"),
    countRows("events"),
    countRows("events", { column: "status", value: "published" }),
  ]);

  const tiles = [
    { label: "Packaging formats", value: formats, href: "/admin/formats" },
    { label: "Events", value: events, href: "/admin/events" },
    { label: "Published events", value: published, href: "/admin/events" },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold">Admin console</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Set up what you sell: packaging formats and their ad slots, then events and the price of each slot.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800">
            <div className="text-3xl font-semibold">{t.value}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t.label}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
