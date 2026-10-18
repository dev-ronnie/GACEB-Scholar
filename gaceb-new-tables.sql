-- GACEB Scholar — NEW tables only
-- Run this in Supabase → SQL Editor AFTER you have a backup.
-- It does not change coins, profiles, payments, resources,
-- existing policies, or the study-pdfs bucket.
-- It expects public.is_gaceb_admin() to already exist.
-- If a block errors, stop and send the message before continuing.

-- ===== 1. Announcements (text + photo URL) =====
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  pinned boolean not null default false,
  author_name text not null default 'GACEB',
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Anyone reads announcements" on public.announcements;
create policy "Anyone reads announcements"
  on public.announcements for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage announcements" on public.announcements;
create policy "Admins manage announcements"
  on public.announcements for all
  to authenticated
  using (public.is_gaceb_admin())
  with check (public.is_gaceb_admin());

-- ===== 2. Photo bucket for announcements only =====
insert into storage.buckets (id, name, public)
values ('announcement-photos', 'announcement-photos', true)
on conflict (id) do nothing;

drop policy if exists "Announcement photos public read" on storage.objects;
create policy "Announcement photos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'announcement-photos');

drop policy if exists "Admins upload announcement photos" on storage.objects;
create policy "Admins upload announcement photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'announcement-photos'
    and public.is_gaceb_admin()
  );

drop policy if exists "Admins update announcement photos" on storage.objects;
create policy "Admins update announcement photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'announcement-photos'
    and public.is_gaceb_admin()
  );

drop policy if exists "Admins delete announcement photos" on storage.objects;
create policy "Admins delete announcement photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'announcement-photos'
    and public.is_gaceb_admin()
  );

-- ===== 3. Calendar (safe if you already created calendar_events) =====
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  description text not null default '',
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

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

insert into public.calendar_events (title, event_date, description)
select 'UNEB briefing begins', date '2026-11-06', 'Official UNEB briefing period starts.'
where not exists (
  select 1 from public.calendar_events
  where event_date = date '2026-11-06' and title = 'UNEB briefing begins'
);
