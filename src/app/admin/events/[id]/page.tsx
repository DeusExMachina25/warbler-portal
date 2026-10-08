import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, Select, Table, cell } from "@/components/ui";
import { formatCount, formatDateRange, formatInr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { EVENT_STATUSES, type AdSlot, type PackagingFormat, type RateCard, type WarblerEvent } from "@/types/catalogue";
import { deleteRateCard, saveRateCard, setEventStatus } from "../actions";

export const metadata: Metadata = { title: "Event" };

export default async function AdminEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const { data: eventRow } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!eventRow) notFound();
  const event = eventRow as WarblerEvent;

  const [{ data: formatRow }, { data: slotRows }, { data: rateRows }] = await Promise.all([
    supabase.from("packaging_formats").select("*").eq("id", event.packaging_format_id).single(),
    supabase.from("ad_slots").select("*").eq("packaging_format_id", event.packaging_format_id).order("created_at"),
    supabase.from("rate_cards").select("*").eq("event_id", id).order("created_at"),
  ]);
  const format = formatRow as PackagingFormat | null;
  const slots = (slotRows ?? []) as AdSlot[];
  const rates = (rateRows ?? []) as RateCard[];
  const slotName = new Map(slots.map((s) => [s.id, s.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/events" className="text-sm text-neutral-500 hover:underline">Events</Link>
        <h1 className="text-2xl font-semibold">{event.name}</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {formatDateRange(event.starts_on, event.ends_on)} · {event.venue}, {event.city} · {formatCount(event.bottles_planned)} bottles
          {event.expected_attendees ? ` · ${formatCount(event.expected_attendees)} expected attendees` : ""}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {format?.name ?? "Unknown format"} · water {formatInr(event.water_price_per_bottle_inr)} per bottle
          {event.organiser_name ? ` · organiser ${event.organiser_name}` : ""}
          {event.organiser_email ? ` (${event.organiser_email})` : ""}
        </p>
      </div>
      <Notice error={error} saved={saved} />

      <form action={setEventStatus} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="id" value={event.id} />
        <Field label="Status">
          <Select name="status" defaultValue={event.status}>
            {Object.entries(EVENT_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="secondary">Change status</Button>
      </form>

      <Card title="Ad slot prices">
        {rates.length === 0 ? (
          <p className="text-sm text-neutral-500">No prices yet. Advertisers can only book slots that have a price.</p>
        ) : (
          <Table head={["Slot", "Per bottle", "Multiplier", "Minimum bottles", "Setup fee", ""]}>
            {rates.map((r) => (
              <tr key={r.id}>
                <td className={cell}>{slotName.get(r.ad_slot_id) ?? "Unknown slot"}</td>
                <td className={cell}>{formatInr(r.price_per_bottle_inr)}</td>
                <td className={cell}>× {r.event_multiplier}</td>
                <td className={cell}>{formatCount(r.minimum_bottles)}</td>
                <td className={cell}>{formatInr(r.setup_fee_inr)}</td>
                <td className={cell}>
                  <form action={deleteRateCard}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="event_id" value={event.id} />
                    <button type="submit" className="text-red-600 hover:underline">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Set a slot price">
        {slots.length === 0 ? (
          <p className="text-sm text-neutral-500">
            This event&apos;s format has no ad slots. <Link href={`/admin/formats/${event.packaging_format_id}`} className="underline">Add slots</Link> first.
          </p>
        ) : (
          <form action={saveRateCard} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="event_id" value={event.id} />
            <Field label="Ad slot" hint="Saving a slot that already has a price updates it">
              <Select name="ad_slot_id" required>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Price per bottle (Rs, ex-GST)"><Input name="price_per_bottle_inr" type="number" min={0} step="0.01" required /></Field>
            <Field label="Event multiplier" hint="1 = standard, 1.5 = premium event"><Input name="event_multiplier" type="number" min={0.1} max={10} step="0.05" defaultValue={1} /></Field>
            <Field label="Minimum bottles"><Input name="minimum_bottles" type="number" min={0} defaultValue={0} /></Field>
            <Field label="Artwork setup fee (Rs)"><Input name="setup_fee_inr" type="number" min={0} step="0.01" defaultValue={0} /></Field>
            <div className="sm:col-span-2"><Button type="submit">Save price</Button></div>
          </form>
        )}
      </Card>
    </div>
  );
}
