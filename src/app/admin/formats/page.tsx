import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, Field, Input, Notice, Select, Table, cell } from "@/components/ui";
import { formatInr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { MATERIALS, type PackagingFormat } from "@/types/catalogue";
import { createFormat } from "./actions";

export const metadata: Metadata = { title: "Packaging formats" };

export default async function FormatsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("packaging_formats").select("*").order("created_at");
  const formats = (data ?? []) as PackagingFormat[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Packaging formats</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Each bottle or can you offer. Switch a format off to hide it without deleting its history.
        </p>
      </div>
      <Notice error={error} saved={saved} />

      <Card title="All formats">
        {formats.length === 0 ? (
          <p className="text-sm text-neutral-500">No formats yet. Add the first one below.</p>
        ) : (
          <Table head={["Name", "Material", "Volume", "Unit cost", "Reusable", "Status"]}>
            {formats.map((f) => (
              <tr key={f.id}>
                <td className={cell}>
                  <Link href={`/admin/formats/${f.id}`} className="font-medium hover:underline">{f.name}</Link>
                </td>
                <td className={cell}>{MATERIALS[f.material]}</td>
                <td className={cell}>{f.volume_ml} ml</td>
                <td className={cell}>{formatInr(f.unit_cost_inr)}</td>
                <td className={cell}>{f.reusable ? "Yes" : "No"}</td>
                <td className={cell}>{f.active ? "On" : "Off"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Add a format">
        <form action={createFormat} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><Input name="name" required placeholder="500 ml aluminium can" /></Field>
          <Field label="Material">
            <Select name="material" required defaultValue="aluminium_can">
              {Object.entries(MATERIALS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Volume (ml)"><Input name="volume_ml" type="number" min={1} required /></Field>
          <Field label="Unit cost (Rs, ex-GST)" hint="Cost of one empty container">
            <Input name="unit_cost_inr" type="number" min={0} step="0.01" required />
          </Field>
          <Field label="Notes"><Input name="notes" placeholder="Supplier, MOQ, quote date" /></Field>
          <label className="flex items-center gap-2 self-end text-sm">
            <input type="checkbox" name="reusable" /> Reusable or refillable
          </label>
          <div className="sm:col-span-2"><Button type="submit">Add format</Button></div>
        </form>
      </Card>
    </div>
  );
}
