-- Step 1: who can sign in, and which company they belong to.
-- Every table gets Row Level Security, so the database itself decides
-- who may read or change each row.

create type public.user_role as enum ('advertiser', 'admin');

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gstin text,
  billing_address text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'advertiser',
  organisation_id uuid references public.organisations (id) on delete set null,
  created_at timestamptz not null default now()
);

create index profiles_organisation_id_idx on public.profiles (organisation_id);

-- Create a profile automatically when someone signs in for the first time.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the signed-in user is an admin. "security definer" lets the
-- policies below call it without the check looping back on itself.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;

-- Profiles: you can read your own; admins can read and change everyone's.
-- Nobody can change their own role, because there is no self-update policy yet.
create policy "Read own profile" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "Admins read all profiles" on public.profiles
  for select to authenticated
  using ((select public.is_admin()));

create policy "Admins update profiles" on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Organisations: members read their own company; admins manage all of them.
create policy "Members read own organisation" on public.organisations
  for select to authenticated
  using (
    id in (select organisation_id from public.profiles where id = (select auth.uid()))
  );

create policy "Admins manage organisations" on public.organisations
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
