-- ============================================================
--  SETUP TABEL SUPABASE untuk KIOS JURUS TANDUR
--  Jalankan query ini sekali di: Supabase > SQL Editor > New query
-- ============================================================

-- Tabel penyimpanan data aplikasi (satu baris JSON)
create table if not exists public.kjt_app (
  id text primary key,
  payload jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Izinkan baca/tulis untuk anon (public) - karena pakai anon key
alter table public.kjt_app enable row level security;

create policy "Allow public read" on public.kjt_app
  for select using (true);

create policy "Allow public insert" on public.kjt_app
  for insert with check (true);

create policy "Allow public update" on public.kjt_app
  for update using (true) with check (true);