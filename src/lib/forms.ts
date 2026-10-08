import { redirect } from "next/navigation";

// Server actions report back by redirecting to the page with a message in
// the address bar, e.g. /admin/formats?error=..., which the page then shows.
export function backWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export function backWithSaved(path: string, message = "Saved"): never {
  redirect(`${path}?saved=${encodeURIComponent(message)}`);
}

export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") out[key] = value;
  });
  return out;
}
