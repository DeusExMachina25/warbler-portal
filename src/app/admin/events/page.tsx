import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, Field, Input, Notice, Select, Table, cell } from "@/components/ui";
import { formatCount, formatDateRange } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { EVENT_STATUSES, type PackagingFormat, type WarblerEvent } from "@/types/catalogue";
import { createEvent } from "./actions";

export const metadata: Metadata = { title: "Events" };

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const [{ data: eventRows }, { data: formatRows }] = await Promise.all([
    supabase.from("events").select("*").order("starts_on"),
    supabase.from("packaging_formats").select("*").eq("active", true).order("name"),
  ]);
  const events = (eventRows ?? []) as WarblerEvent[];
  const formats = (formatRows ?? []) as PackagingFormat[];
  const formatName = new Map(formats.map((f) => [f.id, f.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          New events start as drafts. Advertisers only see an event once you publish it.
        </p>
      </div>
      <Notice error={error} saved={saved} />

      <Card title="All events">
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">No events yet.</p>
        ) : (
          <Table head={["Event", "Dates", "Venue", "Bottles", "Format", "Status"]}>
            {events.map((e) => (
              <tr key={e.id}>
                <td className={cell}>
                  <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline">{e.name}</Link>
                </td>
                <td className={cell}>{formatDateRange(e.starts_on, e.ends_on)}</td>
                <td className={cell}>{e.venue}, {e.city}</td>
                <td className={cell}>{formatCount(e.bottles_planned)}</td>
                <td className={cell}>{formatName.get(e.packaging_format_id) ?? "Switched off"}</td>
                <td className={cell}>{EVENT_STATUSES[e.status]}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Add an event">
        {formats.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Add a <Link href="/admin/formats" className="underline">packaging format</Link> first, so the event knows what bottle it uses.
          </p>
        ) : (
          <form action={createEvent} className="grid gap-4 sm:grid-cols-2">
            <Field label="Event name"><Input name="name" required placeholder="Hyderabad Food Expo" /></Field>
            <Field label="Venue"><Input name="venue" required placeholder="HITEX" /></Field>
            <Field label="City"><Input name="city" required defaultValue="Hyderabad" /></Field>
            <Field label="Packaging format">
              <Select name="packaging_format_id" required>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Starts on"><Input name="starts_on" type="date" required /></Field>
            <Field label="Ends on"><Input name="ends_on" type="date" required /></Field>
            <Field label="Expected attendees"><Input name="expected_attendees" type="number" min={0} /></Field>
            <Field label="Bottles planned"><Input name="bottles_planned" type="number" min={1} required /></Field>
            <Field label="Water price per bottle (Rs, ex-GST)" hint="Paid by the organiser">
              <Input name="water_price_per_bottle_inr" type="number" min={0} step="0.01" required />
            </Field>
            <Field label="Organiser name"><Input name="organiser_name" /></Field>
            <Field label="Organiser email"><Input name="organiser_email" type="email" /></Field>
            <div className="sm:col-span-2"><Button type="submit">Add event</Button></div>
          </form>
        )}
      </Card>
    </div>
  );
}
