// Rules for what the admin forms accept. The database checks the same rules,
// but checking here first lets us show a friendly message instead of an error.
import { z } from "zod";
import { EVENT_STATUSES, MATERIALS, SLOT_KINDS } from "@/types/catalogue";

const keys = <T extends Record<string, string>>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

// Empty form fields arrive as "", which should mean "not given".
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optionalText = z.preprocess(blankToUndefined, z.string().trim().max(500).optional());
const requiredText = z.string().trim().min(1, "Required").max(200);
const money = z.coerce.number().min(0, "Cannot be negative").max(1_000_000);
const wholeNumber = z.coerce.number().int("Must be a whole number");
const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date");

export const formatSchema = z.object({
  name: requiredText,
  material: z.enum(keys(MATERIALS)),
  volume_ml: wholeNumber.positive("Must be more than 0"),
  unit_cost_inr: money,
  reusable: checkbox,
  notes: optionalText,
});

export const slotSchema = z
  .object({
    packaging_format_id: z.string().uuid(),
    name: requiredText,
    kind: z.enum(keys(SLOT_KINDS)),
    width_mm: z.preprocess(blankToUndefined, z.coerce.number().positive().optional()),
    height_mm: z.preprocess(blankToUndefined, z.coerce.number().positive().optional()),
  })
  .refine((s) => s.kind === "digital" || (s.width_mm && s.height_mm), {
    message: "Printed panels need a width and height",
    path: ["width_mm"],
  });

export const eventSchema = z
  .object({
    name: requiredText,
    venue: requiredText,
    city: requiredText,
    starts_on: isoDate,
    ends_on: isoDate,
    expected_attendees: z.preprocess(blankToUndefined, wholeNumber.min(0).optional()),
    bottles_planned: wholeNumber.positive("Must be more than 0"),
    packaging_format_id: z.string().uuid("Pick a packaging format"),
    water_price_per_bottle_inr: money,
    organiser_name: optionalText,
    organiser_email: z.preprocess(blankToUndefined, z.string().email("Not a valid email").optional()),
  })
  .refine((e) => e.ends_on >= e.starts_on, { message: "End date is before the start date", path: ["ends_on"] });

export const eventStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(keys(EVENT_STATUSES)),
});

export const rateCardSchema = z.object({
  event_id: z.string().uuid(),
  ad_slot_id: z.string().uuid("Pick an ad slot"),
  price_per_bottle_inr: money,
  minimum_bottles: z.preprocess(blankToUndefined, wholeNumber.min(0).default(0)),
  setup_fee_inr: z.preprocess(blankToUndefined, money.default(0)),
  event_multiplier: z.preprocess(blankToUndefined, z.coerce.number().positive().max(10).default(1)),
});

// Turns the first validation problem into one readable sentence.
export function firstError(error: z.ZodError): string {
  const issue = error.issues[0];
  const field = issue.path.join(".").replaceAll("_", " ");
  return field ? `${field}: ${issue.message}` : issue.message;
}
