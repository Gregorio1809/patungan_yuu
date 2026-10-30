-- Patungan Yuu — skema Supabase
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  bill_discount_type text not null default 'percent' check (bill_discount_type in ('percent', 'amount')),
  bill_discount_value numeric(12, 2) not null default 0 check (bill_discount_value >= 0),
  tax_percent numeric(5, 2) not null default 0 check (tax_percent >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
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
