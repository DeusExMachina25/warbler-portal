import Link from "next/link";
import { brand } from "@/config/brand";
import { getCurrentProfile } from "@/lib/auth/session";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          {brand.name}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/events" className="hover:underline">
            Events
          </Link>
          {profile ? (
            <>
              <Link href={profile.role === "admin" ? "/admin" : "/dashboard"} className="hover:underline">
                {profile.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="hover:underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-white dark:bg-white dark:text-neutral-900"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
