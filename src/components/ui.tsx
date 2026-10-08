// Small building blocks shared by the forms and tables.
import type { ComponentProps, ReactNode } from "react";

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={inputClass} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={inputClass} />;
}

export function Button({ variant = "primary", ...props }: ComponentProps<"button"> & { variant?: "primary" | "secondary" }) {
  const styles =
    variant === "primary"
      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
      : "border border-neutral-300 dark:border-neutral-700";
  return <button {...props} className={`rounded-md px-3 py-2 text-sm font-medium ${styles}`} />;
}

export function Notice({ error, saved }: { error?: string; saved?: string }) {
  if (error) return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>;
  if (saved) return <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{saved}</p>;
  return null;
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
          <tr>
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">{children}</tbody>
      </table>
    </div>
  );
}

export const cell = "py-2 pr-4 align-top";
