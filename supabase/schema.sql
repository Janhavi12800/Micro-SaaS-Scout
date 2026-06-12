create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  report jsonb not null,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  email text,
  status text not null default 'free',
  source text,
  payment_id text,
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_created_at_idx
  on public.projects(user_id, created_at desc);

create index if not exists licenses_device_id_idx
  on public.licenses(device_id);

alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.licenses enable row level security;

create policy "Users can read their projects"
  on public.projects for select
  using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can insert their projects"
  on public.projects for insert
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users can update their projects"
  on public.projects for update
  using (auth.jwt() ->> 'sub' = user_id)
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users can read their subscription"
  on public.subscriptions for select
  using (auth.jwt() ->> 'sub' = user_id);

-- Licenses are managed by the backend service role because Chrome extension
-- installs are device-based before a full user account exists.
