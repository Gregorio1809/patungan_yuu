-- Patungan Yuu — skema Supabase
-- Jalankan seluruh file ini di Supabase SQL Editor. Aman dijalankan ulang
-- untuk menambahkan kolom baru pada project yang sudah ada.

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  bill_discount_type text not null default 'percent' check (bill_discount_type in ('percent', 'amount')),
  bill_discount_value numeric(12, 2) not null default 0 check (bill_discount_value >= 0),
  discount_allocation text not null default 'proportional' check (discount_allocation in ('proportional', 'equal')),
  service_percent numeric(5, 2) not null default 0 check (service_percent >= 0),
  tax_percent numeric(5, 2) not null default 0 check (tax_percent >= 0),
  tax_base text not null default 'after_discount' check (tax_base in ('before_discount', 'after_discount')),
  tip_amount numeric(12, 2) not null default 0 check (tip_amount >= 0),
  rounding integer not null default 0 check (rounding in (0, 500, 1000)),
  receipt_total numeric(12, 2) not null default 0 check (receipt_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  is_payer boolean not null default false,
  paid_at timestamptz,
  paid_amount numeric(12, 2),
  created_at timestamptz not null default now(),
  unique (id, session_id)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  price numeric(12, 2) not null check (price >= 0),
  quantity integer not null default 1 check (quantity >= 1),
  discount_type text not null default 'percent' check (discount_type in ('percent', 'amount')),
  discount_value numeric(12, 2) not null default 0 check (discount_value >= 0),
  created_at timestamptz not null default now(),
  unique (id, session_id)
);

-- quantity = bobot porsi, bukan jumlah unit fisik.
create table if not exists public.item_assignments (
  item_id uuid not null,
  participant_id uuid not null,
  session_id uuid not null,
  quantity integer not null default 1 check (quantity >= 1),
  primary key (item_id, participant_id),
  foreign key (item_id, session_id) references public.items (id, session_id) on delete cascade,
  foreign key (participant_id, session_id) references public.participants (id, session_id) on delete cascade
);

-- Upgrade idempotent untuk project yang sudah dibuat sebelum fitur ini.
alter table public.sessions
  add column if not exists discount_allocation text not null default 'proportional',
  add column if not exists service_percent numeric(5, 2) not null default 0,
  add column if not exists tax_base text not null default 'after_discount',
  add column if not exists tip_amount numeric(12, 2) not null default 0,
  add column if not exists rounding integer not null default 0,
  add column if not exists receipt_total numeric(12, 2) not null default 0;

alter table public.participants
  add column if not exists is_payer boolean not null default false,
  add column if not exists paid_at timestamptz,
  add column if not exists paid_amount numeric(12, 2);

create unique index if not exists one_payer_per_session_idx
  on public.participants (session_id)
  where is_payer;

create index if not exists items_session_idx on public.items (session_id);
create index if not exists participants_session_idx on public.participants (session_id);
create index if not exists item_assignments_session_idx on public.item_assignments (session_id);

alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.items enable row level security;
alter table public.item_assignments enable row level security;

drop policy if exists "public_all_sessions" on public.sessions;
create policy "public_all_sessions" on public.sessions
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "public_all_participants" on public.participants;
create policy "public_all_participants" on public.participants
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "public_all_items" on public.items;
create policy "public_all_items" on public.items
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "public_all_assignments" on public.item_assignments;
create policy "public_all_assignments" on public.item_assignments
  for all to anon, authenticated using (true) with check (true);

do $$ begin
  alter publication supabase_realtime add table public.sessions;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.participants;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.item_assignments;
exception when duplicate_object then null;
end $$;
