// After login we send people back to the page they wanted ("?next=/dashboard").
// Only same-site paths are allowed, so a crafted link cannot bounce a user
// to another website after they sign in.
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
