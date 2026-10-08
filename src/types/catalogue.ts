// Shapes of the catalogue tables (see supabase/migrations/*_catalogue.sql).
// Later we will generate these from the database with the Supabase CLI.

export const MATERIALS = {
  aluminium_can: "Aluminium can",
  aluminium_bottle: "Aluminium bottle",
  glass: "Glass",
  rpet: "rPET",
  plant_based: "Plant-based (bagasse, PLA)",
  other: "Other",
} as const;
export type Material = keyof typeof MATERIALS;

export const SLOT_KINDS = { printed: "Printed panel", digital: "Digital (QR landing page)" } as const;
export type SlotKind = keyof typeof SLOT_KINDS;

export const EVENT_STATUSES = {
  draft: "Draft",
  published: "Published",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;
export type EventStatus = keyof typeof EVENT_STATUSES;

export type PackagingFormat = {
  id: string;
  name: string;
  material: Material;
  volume_ml: number;
  unit_cost_inr: number;
  reusable: boolean;
  active: boolean;
  notes: string | null;
};

export type AdSlot = {
  id: string;
  packaging_format_id: string;
  name: string;
  kind: SlotKind;
  width_mm: number | null;
  height_mm: number | null;
};

export type WarblerEvent = {
  id: string;
  name: string;
  venue: string;
  city: string;
  starts_on: string;
  ends_on: string;
  expected_attendees: number | null;
  bottles_planned: number;
  packaging_format_id: string;
  water_price_per_bottle_inr: number;
  organiser_name: string | null;
  organiser_email: string | null;
  status: EventStatus;
};

export type RateCard = {
  id: string;
  event_id: string;
  ad_slot_id: string;
  price_per_bottle_inr: number;
  minimum_bottles: number;
  setup_fee_inr: number;
  event_multiplier: number;
};
