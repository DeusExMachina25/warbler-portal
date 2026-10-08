// Display helpers shared by pages.
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const count = new Intl.NumberFormat("en-IN");

export const formatInr = (n: number) => inr.format(n);
export const formatCount = (n: number) => count.format(n);

export function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return start === end ? fmt(start) : `${fmt(start)} to ${fmt(end)}`;
}
