-- GACEB Scholar — accounts, coins, Premium, referrals, donations, Gauge limit
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Run this BEFORE gaceb-pdfs.sql.
-- It does not delete coins, profiles, payments or PDFs.
-- It does not change announcements, the calendar, or the announcement-photos bucket.
-- If it stops, copy the error and do not keep clicking Run.

begin;

-- ===== Admin check (same rule the website uses: profiles.role = admin) =====
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

-- ===== Profiles =====
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  school text,
  level text,
  gender text,
  role text not null default 'student',
  coins integer not null default 0,
  referral_code text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists school text;
alter table public.profiles add column if not exists level text;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists coins integer;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists created_at timestamptz;

update public.profiles set coins = 0 where coins is null;
update public.profiles set role = 'student' where role is null or btrim(role) = '';
alter table public.profiles alter column coins set default 0;
alter table public.profiles alter column role set default 'student';

create unique index if not exists profiles_referral_code_unique
  on public.profiles (lower(referral_code))
  where referral_code is not null and btrim(referral_code) <> '';

-- Students cannot edit their own coin balance, role or code.
create or replace function public.protect_profile_sensitive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('gaceb.allow_coin_write', true) = '1' then
    return new;
  end if;
  if auth.uid() is null or public.is_gaceb_admin() then
    return new;
  end if;
  new.coins := old.coins;
  new.role := old.role;
  new.referral_code := old.referral_code;
  new.id := old.id;
  return new;
end;
$$;

drop trigger if exists protect_profile_sensitive on public.profiles;
create trigger protect_profile_sensitive
  before update on public.profiles
  for each row execute function public.protect_profile_sensitive();

-- ===== Ledger =====
create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.coin_transactions add column if not exists user_id uuid;
alter table public.coin_transactions add column if not exists amount integer;
alter table public.coin_transactions add column if not exists reason text;
alter table public.coin_transactions add column if not exists created_at timestamptz;

create index if not exists coin_transactions_user_idx
  on public.coin_transactions (user_id, created_at desc);

create or replace function public.gaceb_add_coins(p_user uuid, p_amount integer, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  balance integer;
begin
  if p_user is null or p_amount = 0 then
    return;
  end if;
  select coins into balance from public.profiles where id = p_user for update;
  if not found then
    raise exception 'Account profile was not found.';
  end if;
  if coalesce(balance, 0) + p_amount < 0 then
    raise exception 'Not enough coins.';
  end if;
  perform set_config('gaceb.allow_coin_write', '1', true);
  update public.profiles
    set coins = coalesce(balance, 0) + p_amount
    where id = p_user;
  insert into public.coin_transactions (user_id, amount, reason)
  values (p_user, p_amount, p_reason);
end;
$$;

revoke all on function public.gaceb_add_coins(uuid, integer, text) from public, anon, authenticated;

-- ===== Coin bouquets =====
create table if not exists public.coin_packs (
  id uuid primary key default gen_random_uuid(),
  coins integer not null,
  amount_ugx integer not null,
  label text,
  sort integer not null default 0
);

alter table public.coin_packs add column if not exists coins integer;
alter table public.coin_packs add column if not exists amount_ugx integer;
alter table public.coin_packs add column if not exists label text;
alter table public.coin_packs add column if not exists sort integer;

create unique index if not exists coin_packs_coins_unique on public.coin_packs (coins);

insert into public.coin_packs (coins, amount_ugx, label, sort) values
  (150, 10000, 'Starter', 1),
  (500, 25000, 'Popular', 2),
  (1000, 40000, 'Best value', 3)
on conflict (coins) do update
  set amount_ugx = excluded.amount_ugx,
      label = excluded.label,
      sort = excluded.sort;

-- ===== Premium bouquets =====
create table if not exists public.premium_plans (
  code text primary key,
  name text not null,
  hours integer not null,
  amount_ugx integer not null,
  active boolean not null default true,
  sort integer not null default 0
);

alter table public.premium_plans add column if not exists name text;
alter table public.premium_plans add column if not exists hours integer;
alter table public.premium_plans add column if not exists amount_ugx integer;
alter table public.premium_plans add column if not exists active boolean;
alter table public.premium_plans add column if not exists sort integer;

insert into public.premium_plans (code, name, hours, amount_ugx, active, sort) values
  ('daily', 'Daily', 24, 2000, true, 1),
  ('weekly', 'Weekly', 168, 7000, true, 2),
  ('monthly', 'Monthly', 720, 20000, true, 3),
  ('yearly', 'Yearly', 8760, 150000, true, 4)
on conflict (code) do update
  set name = excluded.name,
      hours = excluded.hours,
      amount_ugx = excluded.amount_ugx,
      active = excluded.active,
      sort = excluded.sort;

create table if not exists public.premium_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  plan text not null,
  plan_code text,
  hours integer,
  amount_ugx integer not null,
  provider_ref text,
  payer_phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.premium_requests add column if not exists user_id uuid;
alter table public.premium_requests add column if not exists plan text;
alter table public.premium_requests add column if not exists plan_code text;
alter table public.premium_requests add column if not exists hours integer;
alter table public.premium_requests add column if not exists amount_ugx integer;
alter table public.premium_requests add column if not exists provider_ref text;
alter table public.premium_requests add column if not exists payer_phone text;
alter table public.premium_requests add column if not exists status text;
alter table public.premium_requests add column if not exists created_at timestamptz;

create table if not exists public.premium_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists premium_subscriptions_user_idx
  on public.premium_subscriptions (user_id, ends_at desc);

create or replace function public.has_active_premium(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.premium_subscriptions
    where user_id = p_user
      and ends_at > now()
  );
$$;

grant execute on function public.has_active_premium(uuid) to anon, authenticated;

-- ===== Coin purchases =====
create table if not exists public.coin_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  coins integer not null,
  amount_ugx integer not null,
  pack_label text,
  provider_ref text,
  payer_phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.coin_purchases add column if not exists user_id uuid;
alter table public.coin_purchases add column if not exists coins integer;
alter table public.coin_purchases add column if not exists amount_ugx integer;
alter table public.coin_purchases add column if not exists pack_label text;
alter table public.coin_purchases add column if not exists provider_ref text;
alter table public.coin_purchases add column if not exists payer_phone text;
alter table public.coin_purchases add column if not exists status text;
alter table public.coin_purchases add column if not exists created_at timestamptz;

-- ===== Donations (the Confirm button on the dashboard) =====
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  donor_name text,
  amount_ugx integer not null,
  provider_ref text,
  payer_phone text,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.donations add column if not exists user_id uuid;
alter table public.donations add column if not exists donor_name text;
alter table public.donations add column if not exists amount_ugx integer;
alter table public.donations add column if not exists provider_ref text;
alter table public.donations add column if not exists payer_phone text;
alter table public.donations add column if not exists message text;
alter table public.donations add column if not exists status text;
alter table public.donations add column if not exists created_at timestamptz;

-- One Mobile Money ID cannot be reused on a live payment.
create unique index if not exists coin_purchases_live_ref
  on public.coin_purchases (lower(provider_ref))
  where status in ('pending', 'approved')
    and provider_ref is not null
    and btrim(provider_ref) <> '';

create unique index if not exists premium_requests_live_ref
  on public.premium_requests (lower(provider_ref))
  where status in ('pending', 'approved')
    and provider_ref is not null
    and btrim(provider_ref) <> '';

create unique index if not exists donations_live_ref
  on public.donations (lower(provider_ref))
  where status in ('pending', 'confirmed')
    and provider_ref is not null
    and btrim(provider_ref) <> '';

create or replace function public.gaceb_ref_is_new(p_ref text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ref text := lower(btrim(coalesce(p_ref, '')));
begin
  if ref = '' then
    raise exception 'Enter the Mobile Money transaction ID.';
  end if;
  if exists (
    select 1 from public.coin_purchases
    where lower(provider_ref) = ref and status in ('pending', 'approved')
  ) or exists (
    select 1 from public.premium_requests
    where lower(provider_ref) = ref and status in ('pending', 'approved')
  ) or exists (
    select 1 from public.donations
    where lower(provider_ref) = ref and status in ('pending', 'confirmed')
  ) then
    raise exception 'That transaction ID has already been sent.';
  end if;
end;
$$;

revoke all on function public.gaceb_ref_is_new(text) from public, anon, authenticated;

-- ===== Referrals =====
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text,
  referrer_id uuid references public.profiles (id) on delete set null,
  referred_id uuid references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.referrals add column if not exists referral_code text;
alter table public.referrals add column if not exists referrer_id uuid;
alter table public.referrals add column if not exists referred_id uuid;
alter table public.referrals add column if not exists status text;
alter table public.referrals add column if not exists created_at timestamptz;

create unique index if not exists referrals_one_new_student
  on public.referrals (referred_id)
  where referred_id is not null;

-- Codes look like G-hf4kx
create or replace function public.make_gaceb_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  code text;
  n integer := 0;
begin
  loop
    code := 'G-' || substr(md5(gen_random_uuid()::text), 1, 5);
    exit when not exists (
      select 1 from public.profiles where lower(referral_code) = lower(code)
    );
    n := n + 1;
    if n > 25 then
      raise exception 'Could not generate a referral code.';
    end if;
  end loop;
  return code;
end;
$$;

revoke all on function public.make_gaceb_code() from public, anon, authenticated;

-- ===== New student: own code, 5 coins, 5 coins to the inviter =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  invited text;
  inviter uuid;
begin
  new_code := public.make_gaceb_code();

  insert into public.profiles (id, email, full_name, school, level, role, coins, referral_code, created_at)
  values (
    new.id,
    new.email,
    nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(btrim(coalesce(new.raw_user_meta_data->>'school', '')), ''),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data->>'level', '')), ''), 'O-Level'),
    'student',
    0,
    new_code,
    now()
  )
  on conflict (id) do nothing;

  if not found then
    return new;
  end if;

  perform public.gaceb_add_coins(new.id, 5, 'Signup bonus');

  invited := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'referral_code', ''), '\s+', '', 'g'));
  if invited <> '' then
    select id into inviter
    from public.profiles
    where lower(referral_code) = invited
      and id <> new.id
    limit 1;

    if inviter is not null then
      insert into public.referrals (referral_code, referrer_id, referred_id, status)
      values (invited, inviter, new.id, 'verified')
      on conflict (referred_id) do nothing;

      if found then
        perform public.gaceb_add_coins(inviter, 5, 'verified_referral');
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- Replace older signup triggers so coins are not awarded twice.
do $$
declare
  r record;
begin
  for r in
    select tgname
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and not tgisinternal
  loop
    execute format('drop trigger if exists %I on auth.users', r.tgname);
  end loop;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Give a G- code to current students who do not have one.
-- This does not give them another signup bonus.
do $$
declare
  r record;
begin
  for r in
    select id
    from public.profiles
    where referral_code is null or btrim(referral_code) = ''
  loop
    perform set_config('gaceb.allow_coin_write', '1', true);
    update public.profiles
      set referral_code = public.make_gaceb_code()
      where id = r.id;
  end loop;
end $$;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or btrim(p.email) = '');

-- ===== Purchases the dashboard can approve =====
create or replace function public.request_coin_purchase(p_coins integer, p_ref text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  pack record;
  ref text := btrim(coalesce(p_ref, ''));
begin
  if uid is null then
    raise exception 'Log in to buy coins.';
  end if;
  perform public.gaceb_ref_is_new(ref);

  select coins, amount_ugx, label into pack
  from public.coin_packs
  where coins = p_coins
  order by sort
  limit 1;

  if not found then
    raise exception 'That coin bouquet is not available.';
  end if;

  insert into public.coin_purchases (user_id, coins, amount_ugx, pack_label, provider_ref, payer_phone, status)
  values (uid, pack.coins, pack.amount_ugx, pack.label, ref, nullif(btrim(coalesce(p_phone, '')), ''), 'pending');

  return jsonb_build_object('ok', true, 'bouquet', pack.label, 'coins', pack.coins, 'amount_ugx', pack.amount_ugx);
end;
$$;

create or replace function public.approve_coin_purchase(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.coin_purchases%rowtype;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can approve this.';
  end if;

  select * into row from public.coin_purchases where id = p_id for update;
  if not found then
    raise exception 'Purchase not found.';
  end if;
  if row.status = 'approved' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  if row.status <> 'pending' then
    raise exception 'This purchase is not waiting for approval.';
  end if;

  update public.coin_purchases set status = 'approved' where id = p_id;
  perform public.gaceb_add_coins(row.user_id, row.coins, 'coin_purchase');
  return jsonb_build_object('ok', true, 'bouquet', row.pack_label, 'coins', row.coins);
end;
$$;

create or replace function public.reject_coin_purchase(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.coin_purchases%rowtype;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can reject this.';
  end if;
  select * into row from public.coin_purchases where id = p_id for update;
  if not found then
    raise exception 'Purchase not found.';
  end if;
  if row.status <> 'pending' then
    raise exception 'This purchase is not waiting for approval.';
  end if;
  update public.coin_purchases set status = 'rejected' where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.request_premium(p_plan text, p_ref text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  plan record;
  ref text := btrim(coalesce(p_ref, ''));
begin
  if uid is null then
    raise exception 'Log in to subscribe.';
  end if;
  perform public.gaceb_ref_is_new(ref);

  select code, name, hours, amount_ugx into plan
  from public.premium_plans
  where active = true
    and (code = p_plan or lower(name) = lower(p_plan))
  limit 1;

  if not found then
    raise exception 'That Premium bouquet is not available.';
  end if;

  insert into public.premium_requests (user_id, plan, plan_code, hours, amount_ugx, provider_ref, payer_phone, status)
  values (uid, plan.name, plan.code, plan.hours, plan.amount_ugx, ref, nullif(btrim(coalesce(p_phone, '')), ''), 'pending');

  return jsonb_build_object('ok', true, 'bouquet', plan.name, 'amount_ugx', plan.amount_ugx);
end;
$$;

create or replace function public.approve_premium(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.premium_requests%rowtype;
  hrs integer;
  plan_name text;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can approve this.';
  end if;

  select * into row from public.premium_requests where id = p_id for update;
  if not found then
    raise exception 'Premium request not found.';
  end if;
  if row.status = 'approved' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  if row.status <> 'pending' then
    raise exception 'This subscription is not waiting for approval.';
  end if;

  hrs := row.hours;
  plan_name := row.plan;
  if hrs is null then
    select hours, name into hrs, plan_name
    from public.premium_plans
    where code = coalesce(row.plan_code, row.plan)
       or name = row.plan
    limit 1;
  end if;
  if hrs is null then
    raise exception 'This bouquet has no length set.';
  end if;

  -- A new Premium purchase replaces the current one and starts a fresh timer.
  update public.premium_subscriptions
    set ends_at = now()
    where user_id = row.user_id
      and ends_at > now();

  insert into public.premium_subscriptions (user_id, plan, ends_at)
  values (row.user_id, coalesce(plan_name, 'Premium'), now() + make_interval(hours => hrs));

  update public.premium_requests set status = 'approved' where id = p_id;
  return jsonb_build_object('ok', true, 'bouquet', plan_name);
end;
$$;

create or replace function public.reject_premium(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.premium_requests%rowtype;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can reject this.';
  end if;
  select * into row from public.premium_requests where id = p_id for update;
  if not found then
    raise exception 'Premium request not found.';
  end if;
  if row.status <> 'pending' then
    raise exception 'This subscription is not waiting for approval.';
  end if;
  update public.premium_requests set status = 'rejected' where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.my_premium()
returns table (plan text, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.plan, s.ends_at
  from public.premium_subscriptions s
  where s.user_id = auth.uid()
    and s.ends_at > now()
  order by s.ends_at desc
  limit 1;
$$;

create or replace function public.submit_donation(
  p_name text,
  p_amount integer,
  p_ref text,
  p_phone text,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ref text := btrim(coalesce(p_ref, ''));
begin
  if p_amount is null or p_amount < 500 then
    raise exception 'The smallest gift is UGX 500.';
  end if;
  perform public.gaceb_ref_is_new(ref);
  insert into public.donations (user_id, donor_name, amount_ugx, provider_ref, payer_phone, message, status)
  values (
    auth.uid(),
    coalesce(nullif(btrim(coalesce(p_name, '')), ''), 'Anonymous'),
    p_amount,
    ref,
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_message, '')), ''),
    'pending'
  );
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.confirm_donation(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.donations%rowtype;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can confirm this.';
  end if;
  select * into row from public.donations where id = p_id for update;
  if not found then
    raise exception 'Donation not found.';
  end if;
  if row.status = 'confirmed' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  if row.status <> 'pending' then
    raise exception 'This donation is not waiting.';
  end if;
  update public.donations set status = 'confirmed' where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.reject_donation(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.donations%rowtype;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can reject this.';
  end if;
  select * into row from public.donations where id = p_id for update;
  if not found then
    raise exception 'Donation not found.';
  end if;
  if row.status <> 'pending' then
    raise exception 'This donation is not waiting.';
  end if;
  update public.donations set status = 'rejected' where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Kept so the dashboard Verify button still works for older pending invites.
create or replace function public.verify_referral(referral_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.referrals%rowtype;
begin
  if not public.is_gaceb_admin() then
    raise exception 'Only an administrator can verify this.';
  end if;
  select * into row from public.referrals where id = referral_id for update;
  if not found then
    raise exception 'Referral not found.';
  end if;
  if row.status = 'verified' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  update public.referrals set status = 'verified' where id = referral_id;
  if row.referrer_id is not null then
    perform public.gaceb_add_coins(row.referrer_id, 5, 'verified_referral');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- The website still has an Approve PDF button. Approving does not mint coins.
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

-- ===== Gauge: 20 study / about / greeting questions a day =====
create table if not exists public.gauge_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question text not null,
  allowed boolean not null default true,
  asked_at timestamptz not null default now()
);

create index if not exists gauge_usage_day_idx
  on public.gauge_usage (user_id, asked_at desc);

create or replace function public.gauge_reply(p_text text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  q text := btrim(coalesce(p_text, ''));
  s text;
  used integer;
  day_start timestamptz;
  greeting boolean;
  about_us boolean;
  study boolean;
begin
  if uid is null then
    return 'Log in so Gauge can count today’s questions. Then ask a study question, a greeting, or something about GACEB.';
  end if;
  if q = '' then
    return 'Type a study question, say hello, or ask about GACEB.';
  end if;

  s := lower(q);
  greeting := s ~ '(hello|hi|hey|good morning|good afternoon|good evening|how are you|thank you|thanks|asante|webale)';
  about_us := s ~ '(about|gaceb|who are you|what is this|contact|whatsapp|sister gauge|sr\.? gauge)';
  study := s ~ '(math|algebra|geometry|equation|calculat|physics|chemist|biolog|science|econom|geograph|histor|english|essay|composition|grammar|exam|uneb|revise|revision|study|topic|formula|past paper|notes|o-level|a-level|s\.?6|s\.?4|agricultur|entrepreneur|literature|cre|ire|divinity|computer|ict|account|commerce|kiswahili|french|fine art|timetable|schedule|remember|memor|forget|summary|diagram|unit|definition)';

  if not (greeting or about_us or study) then
    return 'Gauge only answers study questions, greetings, and questions about GACEB. Tell me your class, subject and topic.';
  end if;

  day_start := (date_trunc('day', now() at time zone 'Africa/Kampala') at time zone 'Africa/Kampala');
  select count(*) into used
  from public.gauge_usage
  where user_id = uid
    and allowed = true
    and asked_at >= day_start;

  if used >= 20 then
    return 'You have used today’s 20 Gauge questions. Rest, revise what you already asked, and come back tomorrow.';
  end if;

  insert into public.gauge_usage (user_id, question, allowed)
  values (uid, left(q, 500), true);

  if greeting and not study and not about_us then
    return 'Hello. I am Gauge, your GACEB study companion. Tell me your class, subject and the exact topic.';
  end if;

  if about_us and not study then
    return 'GACEB Scholar shares Uganda curriculum notes for O-Level and A-Level. UNEB briefing begins 6 November 2026. For a person, use WhatsApp on the Contact page. I can help with study questions, not payments or private accounts.';
  end if;

  if s ~ '(stress|anxious|nervous|tired|overwhelm)' then
    return 'Pressure before exams is normal. Drink water, rest, and study one small topic for 25 minutes. If the worry stays heavy, talk to a teacher or a trusted adult.';
  end if;
  if s ~ '(essay|composition|writing|english|literature)' then
    return 'Plan before you write: 3 to 5 points, a clear opening, one idea per paragraph with evidence, then a short ending. Leave five minutes to check grammar.';
  end if;
  if s ~ '(math|algebra|equation|calculat|geometry)' then
    return 'Write what is given and what you must find. Choose the rule, show every step, keep the units, and check that the answer is reasonable.';
  end if;
  if s ~ '(physics|chemist|biolog|science|agricultur)' then
    return 'Learn the key terms, label a diagram, memorise each formula with its units, then do a short structured question. Send the exact topic and your class.';
  end if;
  if s ~ '(econom|entrepreneur|commerce|account|histor|geograph)' then
    return 'Define the term, give one Uganda example, then explain the effect. For essays, use point, explanation and example. Which topic are you on?';
  end if;
  if s ~ '(past paper|exam|uneb|answer)' then
    return 'Read the command word first, underline the key terms, and match your points to the marks. UNEB briefing begins 6 November 2026. Keep your documents together.';
  end if;
  if s ~ '(timetable|revision plan|schedule)' then
    return 'List your subjects and dates. Study 25 to 45 minutes, switch subjects, take a break, and keep one sitting a week for a past paper.';
  end if;
  if s ~ '(remember|memor|forget|read|notes)' then
    return 'Close the book and explain the idea aloud. Review it after one day, three days and a week. Short questions beat rereading.';
  end if;

  return 'Break it into small ideas: read one section, write a summary from memory, then answer two questions. Send your class, subject and exact topic.';
end;
$$;

-- ===== Who can see what =====
alter table public.profiles enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.coin_packs enable row level security;
alter table public.coin_purchases enable row level security;
alter table public.premium_plans enable row level security;
alter table public.premium_requests enable row level security;
alter table public.premium_subscriptions enable row level security;
alter table public.donations enable row level security;
alter table public.referrals enable row level security;
alter table public.gauge_usage enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_gaceb_admin());

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_gaceb_admin())
  with check (id = auth.uid() or public.is_gaceb_admin());

drop policy if exists "Read own coin ledger" on public.coin_transactions;
create policy "Read own coin ledger"
  on public.coin_transactions for select
  to authenticated
  using (user_id = auth.uid() or public.is_gaceb_admin());

drop policy if exists "Anyone reads coin packs" on public.coin_packs;
create policy "Anyone reads coin packs"
  on public.coin_packs for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone reads premium plans" on public.premium_plans;
create policy "Anyone reads premium plans"
  on public.premium_plans for select
  to anon, authenticated
  using (true);

drop policy if exists "Read own coin purchases" on public.coin_purchases;
create policy "Read own coin purchases"
  on public.coin_purchases for select
  to authenticated
  using (user_id = auth.uid() or public.is_gaceb_admin());

drop policy if exists "Read own premium requests" on public.premium_requests;
create policy "Read own premium requests"
  on public.premium_requests for select
  to authenticated
  using (user_id = auth.uid() or public.is_gaceb_admin());

drop policy if exists "Read own premium" on public.premium_subscriptions;
create policy "Read own premium"
  on public.premium_subscriptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_gaceb_admin());

drop policy if exists "Admins read donations" on public.donations;
create policy "Admins read donations"
  on public.donations for select
  to authenticated
  using (public.is_gaceb_admin());

drop policy if exists "Admins read referrals" on public.referrals;
create policy "Admins read referrals"
  on public.referrals for select
  to authenticated
  using (public.is_gaceb_admin() or referrer_id = auth.uid());

drop policy if exists "Read own gauge usage" on public.gauge_usage;
create policy "Read own gauge usage"
  on public.gauge_usage for select
  to authenticated
  using (user_id = auth.uid() or public.is_gaceb_admin());

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant select on public.coin_transactions to authenticated;
grant select on public.coin_packs to anon, authenticated;
grant select on public.premium_plans to anon, authenticated;
grant select on public.coin_purchases to authenticated;
grant select on public.premium_requests to authenticated;
grant select on public.premium_subscriptions to authenticated;
grant select on public.donations to authenticated;
grant select on public.referrals to authenticated;
grant select on public.gauge_usage to authenticated;

grant execute on function public.request_coin_purchase(integer, text, text) to authenticated;
grant execute on function public.approve_coin_purchase(uuid) to authenticated;
grant execute on function public.reject_coin_purchase(uuid) to authenticated;
grant execute on function public.request_premium(text, text, text) to authenticated;
grant execute on function public.approve_premium(uuid) to authenticated;
grant execute on function public.reject_premium(uuid) to authenticated;
grant execute on function public.my_premium() to authenticated;
grant execute on function public.submit_donation(text, integer, text, text, text) to anon, authenticated;
grant execute on function public.confirm_donation(uuid) to authenticated;
grant execute on function public.reject_donation(uuid) to authenticated;
grant execute on function public.verify_referral(uuid) to authenticated;
grant execute on function public.approve_resource(uuid) to authenticated;
grant execute on function public.gauge_reply(text) to authenticated;

notify pgrst, 'reload schema';

commit;

-- After this succeeds, make your own account the admin. Change the email, then run it alone:
-- update public.profiles set role = 'admin' where email = 'gacebscholar@gmail.com';
