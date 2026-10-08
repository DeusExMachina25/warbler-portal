"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

// A submit button that greys out while the form is sending, so a slow
// connection doesn't tempt people into pressing it again and again.
export function SubmitButton({ children, pendingText }: { children: ReactNode; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
    >
      {pending ? pendingText : children}
    </button>
  );
}
