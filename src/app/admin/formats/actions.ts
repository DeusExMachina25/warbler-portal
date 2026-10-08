"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { backWithError, backWithSaved, formToObject } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { firstError, formatSchema, slotSchema } from "@/lib/validation/catalogue";

const LIST = "/admin/formats";

export async function createFormat(formData: FormData) {
  await requireAdmin();
  const parsed = formatSchema.safeParse(formToObject(formData));
  if (!parsed.success) backWithError(LIST, firstError(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase.from("packaging_formats").insert(parsed.data).select("id").single();
  if (error || !data) backWithError(LIST, error?.code === "23505" ? "A format with that name already exists" : (error?.message ?? "Could not create the format"));

  revalidatePath(LIST);
  backWithSaved(`${LIST}/${data.id}`, "Format created. Now add its ad slots.");
}

export async function setFormatActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  const supabase = await createClient();
  const { error } = await supabase.from("packaging_formats").update({ active }).eq("id", id);
  if (error) backWithError(`${LIST}/${id}`, error.message);

  revalidatePath(LIST);
  backWithSaved(`${LIST}/${id}`, active ? "Format switched on" : "Format switched off");
}

export async function createSlot(formData: FormData) {
  await requireAdmin();
  const values = formToObject(formData);
  const back = `${LIST}/${values.packaging_format_id}`;
  const parsed = slotSchema.safeParse(values);
  if (!parsed.success) backWithError(back, firstError(parsed.error));

  const slot = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("ad_slots").insert({
    ...slot,
    width_mm: slot.kind === "digital" ? null : slot.width_mm,
    height_mm: slot.kind === "digital" ? null : slot.height_mm,
  });
  if (error) backWithError(back, error.code === "23505" ? "This format already has a slot with that name" : error.message);

  revalidatePath(back);
  backWithSaved(back, "Ad slot added");
}

export async function deleteSlot(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const back = `${LIST}/${String(formData.get("packaging_format_id"))}`;

  const supabase = await createClient();
  const { error } = await supabase.from("ad_slots").delete().eq("id", id);
  // 23503: the slot is priced on an event, so it cannot be removed.
  if (error) backWithError(back, error.code === "23503" ? "This slot is priced on an event. Remove that rate card first." : error.message);

  revalidatePath(back);
  backWithSaved(back, "Ad slot removed");
}
