-- ============================================================
-- GACEB Scholar: notices + calendar + avatars
-- Run ONE BLOCK at a time in Supabase > SQL Editor
-- If a block errors, copy the error message and send it.
-- ============================================================

-- ===== BLOCK 1: avatar column on profiles =====
alter table public.profiles
  add column if not exists avatar_url text;


-- ===== BLOCK 2: notices table =====
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  author_name text not null default 'Admin',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.notices enable row level security;


-- ===== BLOCK 3: notices policies =====
drop policy if exists "Anyone reads notices" on public.notices;
create policy "Anyone reads notices"
  on public.notices for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage notices" on public.notices;
create policy "Admins manage notices"
  on public.notices for all
  to authenticated
  using (public.is_gaceb_admin())
  with check (public.is_gaceb_admin());


-- ===== BLOCK 4: calendar_events table =====
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  description text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;


-- ===== BLOCK 5: calendar policies =====
drop policy if exists "Anyone reads events" on public.calendar_events;
create policy "Anyone reads events"
  on public.calendar_events for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage events" on public.calendar_events;
create policy "Admins manage events"
  on public.calendar_events for all
  to authenticated
  using (public.is_gaceb_admin())
  with check (public.is_gaceb_admin());


-- ===== BLOCK 6: seed UNEB date (safe if already there) =====
insert into public.calendar_events (title, event_date, description)
select 'UNEB briefing begins', date '2026-11-06', 'Official UNEB briefing period starts.'
where not exists (
  select 1 from public.calendar_events where event_date = date '2026-11-06'
);


-- ===== BLOCK 7: payment numbers in site_settings =====
-- Only works if site_settings already exists (from the coin/donation SQL).
-- If this fails with "relation site_settings does not exist", run the coin SQL first.
insert into public.site_settings (key, value) values
  ('payment_number', '0783165723'),
  ('payment_number_2', '0743766451'),
  ('payment_name', 'GACEB Scholar'),
  ('payment_network', 'MTN Mobile Money / Airtel Money')
on conflict (key) do update set value = excluded.value;


-- ===== BLOCK 8: avatars storage bucket =====
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;


-- ===== BLOCK 9: storage policies for avatars =====
drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
