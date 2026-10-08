import Link from "next/link";
import { brand } from "@/config/brand";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">{brand.tagline}</h1>
      <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
        Book space on the bottles handed out at Hyderabad expos and conferences, upload your
        artwork, and see how many attendees scanned your QR code.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/events"
          className="rounded-md bg-neutral-900 px-4 py-2 text-white dark:bg-white dark:text-neutral-900"
        >
          See upcoming events
        </Link>
        <Link href="/login" className="rounded-md border border-neutral-300 px-4 py-2 dark:border-neutral-700">
          Advertiser sign in
        </Link>
      </div>
    </section>
  );
}
