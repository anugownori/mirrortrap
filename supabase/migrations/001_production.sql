-- MirrorTrap: independently verified assets and evidence-only event storage.
-- Install through Supabase SQL editor before deploying Edge Functions.
create extension if not exists pgcrypto;

create table if not exists public.mt_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null check (length(domain) between 4 and 253),
  challenge text not null check (challenge ~ '^[a-f0-9]{32}$'),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, domain)
);
create table if not exists public.mt_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.mt_assets(id) on delete cascade,
  domain text not null,
  exposure_index int not null check (exposure_index between 0 and 100),
  findings jsonb not null default '[]'::jsonb,
  sources jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists mt_scans_owner_created on public.mt_scans(user_id, created_at desc);
create table if not exists public.mt_tripwires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (length(label) between 1 and 80),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.mt_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tripwire_id uuid not null references public.mt_tripwires(id) on delete cascade,
  method text not null,
  reported_ip text,
  user_agent text,
  request_path text,
  observed_at timestamptz not null default now()
);
create index if not exists mt_events_owner_created on public.mt_events(user_id, observed_at desc);

alter table public.mt_assets enable row level security;
alter table public.mt_scans enable row level security;
alter table public.mt_tripwires enable row level security;
alter table public.mt_events enable row level security;

-- The authenticated client can create challenges, but only server roles may mark them verified.
create policy "mt_assets_read" on public.mt_assets for select to authenticated using (auth.uid() = user_id);
create policy "mt_assets_create" on public.mt_assets for insert to authenticated with check (auth.uid() = user_id and verified_at is null);
create policy "mt_scans_read" on public.mt_scans for select to authenticated using (auth.uid() = user_id);
create policy "mt_tripwires_read" on public.mt_tripwires for select to authenticated using (auth.uid() = user_id);
create policy "mt_tripwires_create" on public.mt_tripwires for insert to authenticated with check (auth.uid() = user_id);
create policy "mt_tripwires_disable" on public.mt_tripwires for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mt_events_read" on public.mt_events for select to authenticated using (auth.uid() = user_id);

-- Explicitly revoke updates to sensitive fields. Users may update only tripwire active status.
revoke update on public.mt_tripwires from authenticated, anon;
grant update(active) on public.mt_tripwires to authenticated;
-- No direct client INSERT on scans/events and no UPDATE to mt_assets. Edge Functions
-- use the service role after verifying the user and asset authorization.
