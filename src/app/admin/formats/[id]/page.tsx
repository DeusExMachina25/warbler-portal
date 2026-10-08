import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, Select, Table, cell } from "@/components/ui";
import { formatInr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { MATERIALS, SLOT_KINDS, type AdSlot, type PackagingFormat } from "@/types/catalogue";
import { createSlot, deleteSlot, setFormatActive } from "../actions";

export const metadata: Metadata = { title: "Packaging format" };

export default async function FormatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const [{ data: format }, { data: slotRows }] = await Promise.all([
    supabase.from("packaging_formats").select("*").eq("id", id).maybeSingle(),
    supabase.from("ad_slots").select("*").eq("packaging_format_id", id).order("created_at"),
  ]);
  if (!format) notFound();
  const f = format as PackagingFormat;
  const slots = (slotRows ?? []) as AdSlot[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/formats" className="text-sm text-neutral-500 hover:underline">Packaging formats</Link>
        <h1 className="text-2xl font-semibold">{f.name}</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {MATERIALS[f.material]} · {f.volume_ml} ml · {formatInr(f.unit_cost_inr)} per unit · {f.reusable ? "reusable" : "single use"}
          {f.notes ? ` · ${f.notes}` : ""}
        </p>
      </div>
      <Notice error={error} saved={saved} />

      <form action={setFormatActive} className="flex items-center gap-3 text-sm">
        <input type="hidden" name="id" value={f.id} />
        <input type="hidden" name="active" value={String(!f.active)} />
        <span>This format is <strong>{f.active ? "on" : "off"}</strong>.</span>
        <Button type="submit" variant="secondary">{f.active ? "Switch off" : "Switch on"}</Button>
      </form>

      <Card title="Ad slots">
        {slots.length === 0 ? (
          <p className="text-sm text-neutral-500">No ad slots yet. Add the panels an advertiser can buy on this bottle.</p>
        ) : (
          <Table head={["Name", "Kind", "Size", ""]}>
            {slots.map((s) => (
              <tr key={s.id}>
                <td className={cell}>{s.name}</td>
                <td className={cell}>{SLOT_KINDS[s.kind]}</td>
                <td className={cell}>{s.width_mm && s.height_mm ? `${s.width_mm} × ${s.height_mm} mm` : "None"}</td>
                <td className={cell}>
                  <form action={deleteSlot}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="packaging_format_id" value={f.id} />
                    <button type="submit" className="text-red-600 hover:underline">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Add an ad slot">
        <form action={createSlot} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="packaging_format_id" value={f.id} />
          <Field label="Name"><Input name="name" required placeholder="Front panel" /></Field>
          <Field label="Kind">
            <Select name="kind" defaultValue="printed">
              {Object.entries(SLOT_KINDS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Width (mm)" hint="Leave blank for a digital slot"><Input name="width_mm" type="number" min={1} step="0.1" /></Field>
          <Field label="Height (mm)"><Input name="height_mm" type="number" min={1} step="0.1" /></Field>
          <div className="sm:col-span-2"><Button type="submit">Add slot</Button></div>
        </form>
      </Card>
    </div>
  );
}
