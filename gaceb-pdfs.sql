-- GACEB Scholar — PDF destinations, price, Premium / coins / free, download on or off
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Run gaceb-accounts.sql FIRST.
-- Only an administrator can add or change a PDF.
-- It does not change coins, profiles, payments, announcements or the calendar.
-- If it stops, copy the error and do not keep clicking Run.

begin;

create or replace function public.is_gaceb_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_gaceb_admin() to anon, authenticated;

-- Subjects the library can point at. The website shows this name in the subject chip.
create table if not exists public.pdf_destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text,
  sort integer not null default 0
);

create unique index if not exists pdf_destinations_name_unique
  on public.pdf_destinations (lower(name));

insert into public.pdf_destinations (name, level, sort) values
  ('Mathematics', null, 10),
  ('English Language', null, 20),
  ('Physics', null, 30),
  ('Chemistry', null, 40),
  ('Biology', null, 50),
  ('History', null, 60),
  ('Geography', null, 70),
  ('Economics', null, 80),
  ('Entrepreneurship', null, 90),
  ('Agriculture', null, 100),
  ('Commerce', null, 110),
  ('Accounts', null, 120),
  ('Christian Religious Education', null, 130),
  ('Islamic Religious Education', null, 140),
  ('Literature in English', null, 150),
  ('Computer Studies', null, 160),
  ('Subsidiary Mathematics', 'A-Level', 170),
  ('Subsidiary ICT', 'A-Level', 180),
  ('General Paper', 'A-Level', 190),
  ('Kiswahili', null, 200),
  ('Fine Art', null, 210)
on conflict (lower(name)) do nothing;

-- The library already reads this table. New columns decide the price and the download.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text,
  level text,
  category text,
  resource_type text,
  file_path text,
  status text not null default 'approved',
  uploaded_by uuid references public.profiles (id) on delete set null,
  access_mode text not null default 'free',
  coin_cost integer not null default 0,
  downloadable boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.resources add column if not exists title text;
alter table public.resources add column if not exists description text;
alter table public.resources add column if not exists subject text;
alter table public.resources add column if not exists level text;
alter table public.resources add column if not exists category text;
alter table public.resources add column if not exists resource_type text;
alter table public.resources add column if not exists file_path text;
alter table public.resources add column if not exists status text;
alter table public.resources add column if not exists uploaded_by uuid;
alter table public.resources add column if not exists access_mode text;
alter table public.resources add column if not exists coin_cost integer;
alter table public.resources add column if not exists downloadable boolean;
alter table public.resources add column if not exists created_at timestamptz;

update public.resources set access_mode = 'free' where access_mode is null or btrim(access_mode) = '';
update public.resources set coin_cost = 0 where coin_cost is null;
update public.resources set downloadable = true where downloadable is null;
update public.resources set status = 'pending' where status is null or btrim(status) = '';

alter table public.resources alter column access_mode set default 'free';
alter table public.resources alter column coin_cost set default 0;
alter table public.resources alter column downloadable set default true;

create index if not exists resources_status_idx on public.resources (status, created_at desc);
create index if not exists resources_subject_idx on public.resources (subject);

create table if not exists public.resource_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  coins_spent integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

-- Private bucket. A student gets a short link only when the rules below allow it.
insert into storage.buckets (id, name, public)
values ('study-pdfs', 'study-pdfs', false)
on conflict (id) do update set public = false;

create or replace function public.gaceb_is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_gaceb_admin()
    or (
      auth.uid() is null
      and current_user in ('postgres', 'supabase_admin')
    );
$$;

revoke all on function public.gaceb_is_editor() from public, anon, authenticated;

create or replace function public.can_download_pdf(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r record;
  uid uuid := auth.uid();
begin
  if object_name is null or object_name = '' then
    return false;
  end if;

  -- You can always open a file in this bucket.
  if public.is_gaceb_admin() then
    return true;
  end if;

  if uid is null then
    return false;
  end if;

  for r in
    select id, status, access_mode, downloadable
    from public.resources
    where file_path = object_name
  loop
    if r.status = 'approved' and r.downloadable then
      if r.access_mode = 'free' then
        return true;
      end if;
      if r.access_mode in ('premium', 'both') and public.has_active_premium(uid) then
        return true;
      end if;
      if r.access_mode in ('coins', 'both') and exists (
        select 1 from public.resource_unlocks u
        where u.resource_id = r.id and u.user_id = uid
      ) then
        return true;
      end if;
    end if;
  end loop;

  return false;
end;
$$;

grant execute on function public.can_download_pdf(text) to authenticated;

-- Remove older study-pdf rules so a public rule cannot bypass the price.
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') ilike '%study-pdfs%'
        or coalesce(with_check, '') ilike '%study-pdfs%'
        or policyname ilike '%study-pdf%'
        or policyname ilike '%study_pdf%'
        or policyname ilike '%studypdf%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "GACEB study pdf read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'study-pdfs'
    and public.can_download_pdf(name)
  );

create policy "GACEB study pdf admin insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'study-pdfs'
    and public.is_gaceb_admin()
  );

create policy "GACEB study pdf admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'study-pdfs' and public.is_gaceb_admin())
  with check (bucket_id = 'study-pdfs' and public.is_gaceb_admin());

create policy "GACEB study pdf admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'study-pdfs' and public.is_gaceb_admin());

create or replace function public.admin_publish_pdf(
  p_title text,
  p_description text,
  p_subject text,
  p_level text,
  p_category text,
  p_type text,
  p_file_path text,
  p_access text,
  p_coin_cost integer,
  p_downloadable boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
  mode text := lower(btrim(coalesce(p_access, 'free')));
  cost integer := coalesce(p_coin_cost, 0);
  path text := btrim(coalesce(p_file_path, ''));
  subject text := btrim(coalesce(p_subject, ''));
  new_id uuid;
begin
  if not public.gaceb_is_editor() then
    raise exception 'Only the GACEB admin can publish a PDF.';
  end if;
  if btrim(coalesce(p_title, '')) = '' then
    raise exception 'Give the PDF a title.';
  end if;
  if subject = '' then
    raise exception 'Choose a destination, for example Economics or Mathematics.';
  end if;
  if p_level not in ('O-Level', 'A-Level') then
    raise exception 'Level must be O-Level or A-Level.';
  end if;
  if p_category not in ('Sciences', 'Humanities', 'Arts') then
    raise exception 'Category must be Sciences, Humanities or Arts.';
  end if;
  if coalesce(p_type, '') not in ('Notes', 'Past Paper', 'Revision Guide', 'Other') then
    raise exception 'Type must be Notes, Past Paper, Revision Guide or Other.';
  end if;
  if path = '' or path like '/%' or path like '%..%' then
    raise exception 'File path must look like economics/s6-notes.pdf';
  end if;
  if mode not in ('free', 'premium', 'coins', 'both') then
    raise exception 'Access must be free, premium, coins or both.';
  end if;
  if mode in ('free', 'premium') then
    cost := 0;
  elsif cost < 1 then
    raise exception 'Set how many coins this PDF costs.';
  end if;

  select id into owner
  from public.profiles
  where role = 'admin'
  order by created_at
  limit 1;

  insert into public.pdf_destinations (name, level)
  values (subject, p_level)
  on conflict (lower(name)) do nothing;

  insert into public.resources (
    title, description, subject, level, category, resource_type,
    file_path, status, uploaded_by, access_mode, coin_cost, downloadable
  ) values (
    btrim(p_title),
    nullif(btrim(coalesce(p_description, '')), ''),
    subject,
    p_level,
    p_category,
    p_type,
    path,
    'approved',
    coalesce(auth.uid(), owner),
    mode,
    cost,
    coalesce(p_downloadable, true)
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.admin_set_pdf_access(
  p_id uuid,
  p_access text,
  p_coin_cost integer,
  p_downloadable boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mode text := lower(btrim(coalesce(p_access, '')));
  cost integer := coalesce(p_coin_cost, 0);
begin
  if not public.gaceb_is_editor() then
    raise exception 'Only the GACEB admin can change a PDF.';
  end if;
  if mode not in ('free', 'premium', 'coins', 'both') then
    raise exception 'Access must be free, premium, coins or both.';
  end if;
  if mode in ('free', 'premium') then
    cost := 0;
  elsif cost < 1 then
    raise exception 'Set how many coins this PDF costs.';
  end if;

  update public.resources
    set access_mode = mode,
        coin_cost = cost,
        downloadable = coalesce(p_downloadable, downloadable)
    where id = p_id;

  if not found then
    raise exception 'PDF not found.';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- Spend coins once, then the download opens.
create or replace function public.unlock_pdf(p_resource_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r record;
begin
  if uid is null then
    raise exception 'Log in to unlock this PDF.';
  end if;

  select id, title, status, access_mode, coin_cost, downloadable
    into r
  from public.resources
  where id = p_resource_id
  for update;

  if not found or r.status <> 'approved' or not r.downloadable then
    raise exception 'This PDF cannot be unlocked.';
  end if;
  if r.access_mode not in ('coins', 'both') then
    raise exception 'This PDF does not use coins.';
  end if;
  if r.access_mode = 'both' and public.has_active_premium(uid) then
    return jsonb_build_object('ok', true, 'premium', true);
  end if;
  if exists (
    select 1 from public.resource_unlocks
    where user_id = uid and resource_id = r.id
  ) then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  perform public.gaceb_add_coins(uid, -r.coin_cost, 'PDF unlock');
  insert into public.resource_unlocks (user_id, resource_id, coins_spent)
  values (uid, r.id, r.coin_cost);

  return jsonb_build_object('ok', true, 'spent', r.coin_cost);
end;
$$;

alter table public.resources enable row level security;
alter table public.pdf_destinations enable row level security;
alter table public.resource_unlocks enable row level security;

drop policy if exists "Anyone reads approved pdfs" on public.resources;
create policy "Anyone reads approved pdfs"
  on public.resources for select
  to anon, authenticated
  using (
    status = 'approved'
    or uploaded_by = auth.uid()
    or public.is_gaceb_admin()
  );

drop policy if exists "Admins insert pdfs" on public.resources;
create policy "Admins insert pdfs"
  on public.resources for insert
  to authenticated
  with check (public.is_gaceb_admin());

drop policy if exists "Admins update pdfs" on public.resources;
create policy "Admins update pdfs"
  on public.resources for update
  to authenticated
  using (public.is_gaceb_admin())
  with check (public.is_gaceb_admin());

drop policy if exists "Admins delete pdfs" on public.resources;
create policy "Admins delete pdfs"
  on public.resources for delete
  to authenticated
  using (public.is_gaceb_admin());

drop policy if exists "Anyone reads destinations" on public.pdf_destinations;
create policy "Anyone reads destinations"
  on public.pdf_destinations for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage destinations" on public.pdf_destinations;
create policy "Admins manage destinations"
  on public.pdf_destinations for all
  to authenticated
  using (public.is_gaceb_admin())
  with check (public.is_gaceb_admin());

drop policy if exists "Read own unlocks" on public.resource_unlocks;
create policy "Read own unlocks"
  on public.resource_unlocks for select
  to authenticated
  using (user_id = auth.uid() or public.is_gaceb_admin());

grant select on public.resources to anon, authenticated;
grant insert, update, delete on public.resources to authenticated;
grant select on public.pdf_destinations to anon, authenticated;
grant insert, update, delete on public.pdf_destinations to authenticated;
grant select on public.resource_unlocks to authenticated;

grant execute on function public.admin_publish_pdf(text, text, text, text, text, text, text, text, integer, boolean) to authenticated;
grant execute on function public.admin_set_pdf_access(uuid, text, integer, boolean) to authenticated;
grant execute on function public.unlock_pdf(uuid) to authenticated;

-- Approve button, if the accounts script was not run yet.
create or replace function public.approve_resource(resource_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can approve a PDF.';
  end if;
  update public.resources
    set status = 'approved'
    where id = resource_id;
  if not found then
    raise exception 'PDF not found.';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.approve_resource(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;

-- How to post one PDF
-- 1. Supabase → Storage → study-pdfs → upload the file.
-- 2. Copy its path, for example economics/s6-market.pdf
-- 3. Run ONE of these. Change the words. Do not run the comments above.

-- Free, and students can download it:
-- select public.admin_publish_pdf(
--   'S.4 Mathematics — Algebra',
--   'Worked examples for algebra.',
--   'Mathematics', 'O-Level', 'Sciences', 'Notes',
--   'mathematics/s4-algebra.pdf',
--   'free', 0, true
-- );

-- Premium only:
-- select public.admin_publish_pdf(
--   'S.6 Economics — Market structures',
--   'Demand, supply and markets.',
--   'Economics', 'A-Level', 'Humanities', 'Notes',
--   'economics/s6-markets.pdf',
--   'premium', 0, true
-- );

-- Coins only (10 coins):
-- select public.admin_publish_pdf(
--   'S.6 Economics paper',
--   'Past paper. Download after spending coins.',
--   'Economics', 'A-Level', 'Humanities', 'Past Paper',
--   'economics/s6-paper.pdf',
--   'coins', 10, true
-- );

-- Premium members, or other students who spend 10 coins:
-- select public.admin_publish_pdf(
--   'S.6 Economics revision',
--   'Either Premium or 10 coins.',
--   'Economics', 'A-Level', 'Humanities', 'Revision Guide',
--   'economics/s6-revision.pdf',
--   'both', 10, true
-- );

-- Listed, but nobody can download the file:
-- select public.admin_publish_pdf(
--   'S.6 Economics preview',
--   'Title only. The file stays closed.',
--   'Economics', 'A-Level', 'Humanities', 'Notes',
--   'economics/s6-closed.pdf',
--   'free', 0, false
-- );

-- Change a PDF you already posted. Use its id.
-- select public.admin_set_pdf_access('00000000-0000-0000-0000-000000000000', 'both', 10, true);
