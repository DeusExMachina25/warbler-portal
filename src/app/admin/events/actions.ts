"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { backWithError, backWithSaved, formToObject } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, eventStatusSchema, firstError, rateCardSchema } from "@/lib/validation/catalogue";

const LIST = "/admin/events";

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const parsed = eventSchema.safeParse(formToObject(formData));
  if (!parsed.success) backWithError(LIST, firstError(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase.from("events").insert(parsed.data).select("id").single();
  if (error || !data) backWithError(LIST, error?.message ?? "Could not create the event");

  revalidatePath(LIST);
  backWithSaved(`${LIST}/${data.id}`, "Event created as a draft. Add prices, then publish it.");
}

export async function setEventStatus(formData: FormData) {
  await requireAdmin();
  const parsed = eventStatusSchema.safeParse(formToObject(formData));
  if (!parsed.success) backWithError(LIST, firstError(parsed.error));
  const { id, status } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("events").update({ status }).eq("id", id);
  if (error) backWithError(`${LIST}/${id}`, error.message);

  revalidatePath(LIST);
  backWithSaved(`${LIST}/${id}`, `Status changed to ${status}`);
}

export async function saveRateCard(formData: FormData) {
  await requireAdmin();
  const values = formToObject(formData);
  const back = `${LIST}/${values.event_id}`;
  const parsed = rateCardSchema.safeParse(values);
  if (!parsed.success) backWithError(back, firstError(parsed.error));

  // One price per slot per event: saving again for the same slot updates it.
  const supabase = await createClient();
  const { error } = await supabase.from("rate_cards").upsert(parsed.data, { onConflict: "event_id,ad_slot_id" });
  if (error) backWithError(back, error.message);

  revalidatePath(back);
  backWithSaved(back, "Price saved");
}

export async function deleteRateCard(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const back = `${LIST}/${String(formData.get("event_id"))}`;

  const supabase = await createClient();
  const { error } = await supabase.from("rate_cards").delete().eq("id", id);
  if (error) backWithError(back, error.message);

  revalidatePath(back);
  backWithSaved(back, "Price removed");
}
