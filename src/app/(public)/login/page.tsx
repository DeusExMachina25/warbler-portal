import type { Metadata } from "next";
import { sendMagicLink } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  email: "Please enter a valid email address.",
  send: "We couldn't send the link. Please try again in a minute.",
  link: "That sign-in link has expired or was already used. Request a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const { next, sent, error } = await searchParams;

  return (
    <section className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {sent ? (
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Check your inbox. We sent you a sign-in link.
        </p>
      ) : (
        <form action={sendMagicLink} className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input type="hidden" name="next" value={next ?? ""} />
          {error && ERRORS[error] ? <p className="text-sm text-red-600">{ERRORS[error]}</p> : null}
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-white dark:bg-white dark:text-neutral-900"
          >
            Email me a sign-in link
          </button>
        </form>
      )}
    </section>
  );
}
