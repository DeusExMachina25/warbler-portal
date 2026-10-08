-- Step 2: what Warbler sells. Packaging formats and their printable ad
-- slots, the events bottles go to, and the price of each slot at an event.

create type public.packaging_material as enum (
  'aluminium_can', 'aluminium_bottle', 'glass', 'rpet', 'plant_based', 'other'
);
create type public.ad_slot_kind as enum ('printed', 'digital');
create type public.event_status as enum ('draft', 'published', 'completed', 'cancelled');

create table public.packaging_formats (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  material public.packaging_material not null,
  volume_ml integer not null check (volume_ml > 0),
  unit_cost_inr numeric(10, 2) not null check (unit_cost_inr >= 0),
  reusable boolean not null default false,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  packaging_format_id uuid not null references public.packaging_formats (id) on delete cascade,
  name text not null,
  kind public.ad_slot_kind not null default 'printed',
  -- Printed slots have a size; the digital slot (the QR landing page) does not.
  width_mm numeric(6, 1) check (width_mm > 0),
  height_mm numeric(6, 1) check (height_mm > 0),
  template_path text,
  created_at timestamptz not null default now(),
  unique (packaging_format_id, name),
  check (kind = 'digital' or (width_mm is not null and height_mm is not null))
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  venue text not null,
  city text not null default 'Hyderabad',
  starts_on date not null,
  ends_on date not null,
  expected_attendees integer check (expected_attendees >= 0),
  bottles_planned integer not null check (bottles_planned > 0),
  packaging_format_id uuid not null references public.packaging_formats (id) on delete restrict,
  -- Paid by the organiser for each bottle of water.
  water_price_per_bottle_inr numeric(10, 2) not null check (water_price_per_bottle_inr >= 0),
  organiser_name text,
  organiser_email text,
  status public.event_status not null default 'draft',
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index events_packaging_format_id_idx on public.events (packaging_format_id);
create index events_starts_on_idx on public.events (starts_on);

create table public.rate_cards (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  ad_slot_id uuid not null references public.ad_slots (id) on delete restrict,
  price_per_bottle_inr numeric(10, 2) not null check (price_per_bottle_inr >= 0),
  minimum_bottles integer not null default 0 check (minimum_bottles >= 0),
  setup_fee_inr numeric(10, 2) not null default 0 check (setup_fee_inr >= 0),
  event_multiplier numeric(4, 2) not null default 1 check (event_multiplier > 0),
  created_at timestamptz not null default now(),
  unique (event_id, ad_slot_id)
);

create index rate_cards_ad_slot_id_idx on public.rate_cards (ad_slot_id);

-- A rate card may only price a slot that exists on the event's bottle.
create function public.check_rate_card_slot()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.events e
    join public.ad_slots s on s.packaging_format_id = e.packaging_format_id
    where e.id = new.event_id and s.id = new.ad_slot_id
  ) then
    raise exception 'Ad slot does not belong to this event''s packaging format';
  end if;
  return new;
end;
$$;

create trigger rate_cards_slot_matches_event
  before insert or update on public.rate_cards
  for each row execute function public.check_rate_card_slot();

alter table public.packaging_formats enable row level security;
alter table public.ad_slots enable row level security;
alter table public.events enable row level security;
alter table public.rate_cards enable row level security;

-- Admins manage everything in the catalogue.
create policy "Admins manage formats" on public.packaging_formats
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage ad slots" on public.ad_slots
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage events" on public.events
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage rate cards" on public.rate_cards
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Everyone, signed in or not, can browse what is on sale: published events,
-- their prices, and the active formats and slots behind them.
create policy "Anyone reads active formats" on public.packaging_formats
  for select to anon, authenticated
  using (active);
create policy "Anyone reads slots of active formats" on public.ad_slots
  for select to anon, authenticated
  using (exists (
    select 1 from public.packaging_formats f
    where f.id = packaging_format_id and f.active
  ));
create policy "Anyone reads published events" on public.events
  for select to anon, authenticated
  using (status = 'published');
create policy "Anyone reads rate cards of published events" on public.rate_cards
  for select to anon, authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and e.status = 'published'
  ));
