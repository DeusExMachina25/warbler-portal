import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return <ComingSoon title="Upcoming events" step={3} />;
}
