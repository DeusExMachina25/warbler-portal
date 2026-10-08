import { describe, expect, it } from "vitest";
import { eventSchema, formatSchema, rateCardSchema, slotSchema } from "@/lib/validation/catalogue";

const uuid = "10000000-0000-4000-8000-000000000001";

describe("formatSchema", () => {
  it("reads form strings into numbers and booleans", () => {
    const r = formatSchema.parse({ name: "500 ml can", material: "aluminium_can", volume_ml: "500", unit_cost_inr: "13.5", reusable: "on", notes: "" });
    expect(r).toEqual({ name: "500 ml can", material: "aluminium_can", volume_ml: 500, unit_cost_inr: 13.5, reusable: true, notes: undefined });
  });

  it("rejects an unknown material", () => {
    expect(formatSchema.safeParse({ name: "x", material: "tin", volume_ml: "1", unit_cost_inr: "1" }).success).toBe(false);
  });
});

describe("slotSchema", () => {
  it("needs a size for printed panels", () => {
    expect(slotSchema.safeParse({ packaging_format_id: uuid, name: "Front", kind: "printed", width_mm: "", height_mm: "" }).success).toBe(false);
  });

  it("allows a digital slot without a size", () => {
    expect(slotSchema.safeParse({ packaging_format_id: uuid, name: "QR page", kind: "digital", width_mm: "", height_mm: "" }).success).toBe(true);
  });
});

describe("eventSchema", () => {
  const base = { name: "Expo", venue: "HITEX", city: "Hyderabad", bottles_planned: "5000", packaging_format_id: uuid, water_price_per_bottle_inr: "30" };

  it("rejects an end date before the start date", () => {
    expect(eventSchema.safeParse({ ...base, starts_on: "2026-12-03", ends_on: "2026-12-01" }).success).toBe(false);
  });

  it("accepts a one-day event with optional fields left blank", () => {
    const r = eventSchema.safeParse({ ...base, starts_on: "2026-12-01", ends_on: "2026-12-01", expected_attendees: "", organiser_email: "" });
    expect(r.success).toBe(true);
  });
});

describe("rateCardSchema", () => {
  it("fills defaults for blank optional fields", () => {
    const r = rateCardSchema.parse({ event_id: uuid, ad_slot_id: uuid, price_per_bottle_inr: "12", minimum_bottles: "", setup_fee_inr: "", event_multiplier: "" });
    expect(r).toMatchObject({ minimum_bottles: 0, setup_fee_inr: 0, event_multiplier: 1 });
  });
});
