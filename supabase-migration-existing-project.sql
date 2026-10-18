-- GACEB Scholar safe feature migration (existing Supabase project)
-- BACK UP your database first. This migration adds fields/tables; it does not delete user data.
create extension if not exists pgcrypto;

alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists education_level text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists photo_path text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists referral_code text;
-- Normalize older referral codes to the requested G-XXXXXX format where possible, without collisions.
update public.profiles set referral_code='G-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,6)) where referral_code is null or referral_code !~ '^G-[A-Z0-9]{6}$';
create unique index if not exists profiles_referral_code_unique_idx on public.profiles(referral_code);

alter table public.resources add column if not exists access_type text not null default 'coins';
alter table public.resources add column if not exists coin_cost integer not null default 5;
alter table public.resources add column if not exists education_class text not null default '';
alter table public.resources add column if not exists published boolean not null default false;
-- Access types: free, coins, premium. Admin can choose arbitrary non-negative coin price.
do $$ begin
 if not exists(select 1 from pg_constraint where conname='resources_access_type_check') then
  alter table public.resources add constraint resources_access_type_check check(access_type in ('free','coins','premium'));
 end if;
 if not exists(select 1 from pg_constraint where conname='resources_coin_cost_check') then
  alter table public.resources add constraint resources_coin_cost_check check(coin_cost >= 0);
 end if;
end $$;

create table if not exists public.payment_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 purpose text not null check(purpose in ('coins','premium','donation')),
 package_code text not null, amount_ugx integer not null check(amount_ugx>0), coins_to_add integer not null default 0 check(coins_to_add>=0),
 transaction_id text not null, payment_phone text not null default '', status text not null default 'pending' check(status in ('pending','approved','rejected')),
 reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, admin_note text not null default '', created_at timestamptz not null default now(),
 unique(transaction_id)
);
create index if not exists payment_requests_user_created_idx on public.payment_requests(user_id,created_at desc);

-- Preserve existing subscription history. Expand plans to the requested schedule.
alter table public.subscriptions add column if not exists payment_request_id uuid references public.payment_requests(id);
alter table public.subscriptions add column if not exists approved_by uuid references public.profiles(id);
alter table public.subscriptions add column if not exists replaced_at timestamptz;
do $$ begin
 alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
 alter table public.subscriptions add constraint subscriptions_plan_check check(plan in ('daily','weekly','monthly','yearly'));
 alter table public.subscriptions drop constraint if exists subscriptions_amount_ugx_check;
 alter table public.subscriptions add constraint subscriptions_amount_ugx_check check(amount_ugx in (2000,7000,20000,150000,10000,30000));
end $$;

create table if not exists public.resource_unlocks (
 user_id uuid not null references public.profiles(id) on delete cascade,
 resource_id uuid not null references public.resources(id) on delete cascade,
 coins_paid integer not null default 0, unlocked_at timestamptz not null default now(),
 primary key(user_id,resource_id)
);

alter table public.payment_requests enable row level security;
alter table public.resource_unlocks enable row level security;
drop policy if exists "Users submit own payment requests" on public.payment_requests;
create policy "Users submit own payment requests" on public.payment_requests for insert to authenticated with check(user_id=auth.uid() and status='pending' and reviewed_by is null and reviewed_at is null);
drop policy if exists "Users see own payment requests or admin sees all" on public.payment_requests;
create policy "Users see own payment requests or admin sees all" on public.payment_requests for select to authenticated using(user_id=auth.uid() or public.is_gaceb_admin());
drop policy if exists "Users see own unlocks or admin" on public.resource_unlocks;
create policy "Users see own unlocks or admin" on public.resource_unlocks for select to authenticated using(user_id=auth.uid() or public.is_gaceb_admin());

-- Crucial: only admin/owner can upload files or create resource records.
drop policy if exists "Authenticated students submit resources" on public.resources;
drop policy if exists "Students upload PDFs to own folder" on storage.objects;
drop policy if exists "Students can update own PDF files" on storage.objects;
drop policy if exists "Admin uploads study PDFs" on storage.objects;
create policy "Admin uploads study PDFs" on storage.objects for insert to authenticated with check(bucket_id='study-pdfs' and public.is_gaceb_admin());
drop policy if exists "Admin updates study PDFs" on storage.objects;
create policy "Admin updates study PDFs" on storage.objects for update to authenticated using(bucket_id='study-pdfs' and public.is_gaceb_admin()) with check(bucket_id='study-pdfs' and public.is_gaceb_admin());
drop policy if exists "Owners or admins can create signed PDF access" on storage.objects;
drop policy if exists "Admin reads study PDFs" on storage.objects;
create policy "Admin reads study PDFs" on storage.objects for select to authenticated using(bucket_id='study-pdfs' and public.is_gaceb_admin());
-- User reads require signed URL creation only after an application/database authorization check.

create or replace function public.submit_payment_request(purpose text, package_code text, amount_ugx integer, coins_to_add integer, transaction_id text, payment_phone text default '') returns uuid
language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
 if auth.uid() is null then raise exception 'Please sign in first'; end if;
 if purpose not in ('coins','premium','donation') then raise exception 'Invalid payment purpose'; end if;
 if amount_ugx <= 0 or coins_to_add < 0 or length(trim(transaction_id)) < 4 then raise exception 'Invalid payment details'; end if;
 insert into public.payment_requests(user_id,purpose,package_code,amount_ugx,coins_to_add,transaction_id,payment_phone)
 values(auth.uid(),purpose,trim(package_code),amount_ugx,coins_to_add,trim(transaction_id),trim(payment_phone)) returning id into rid;
 return rid;
end $$;
revoke all on function public.submit_payment_request(text,text,integer,integer,text,text) from public;
grant execute on function public.submit_payment_request(text,text,integer,integer,text,text) to authenticated;

create or replace function public.admin_review_payment(p_request_id uuid, p_approve boolean, p_note text default '') returns void
language plpgsql security definer set search_path=public as $$
declare r public.payment_requests%rowtype; v_days integer; v_plan text;
begin
 if not public.is_gaceb_admin() then raise exception 'Admin access required'; end if;
 select * into r from public.payment_requests where id=p_request_id for update;
 if not found then raise exception 'Payment request not found'; end if;
 if r.status <> 'pending' then raise exception 'This payment request has already been reviewed'; end if;
 if not p_approve then
  update public.payment_requests set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),admin_note=coalesce(p_note,'') where id=r.id; return;
 end if;
 update public.payment_requests set status='approved',reviewed_by=auth.uid(),reviewed_at=now(),admin_note=coalesce(p_note,'') where id=r.id;
 if r.purpose='coins' and r.coins_to_add>0 then
  update public.profiles set coins=coins+r.coins_to_add where id=r.user_id;
  insert into public.coin_transactions(user_id,amount,reason,note) values(r.user_id,r.coins_to_add,'admin_adjustment','Approved payment request '||r.id::text);
 elsif r.purpose='premium' then
  v_plan:=lower(r.package_code);
  v_days:=case v_plan when 'daily' then 1 when 'weekly' then 7 when 'monthly' then 30 when 'yearly' then 365 else null end;
  if v_days is null then raise exception 'Unknown Premium plan'; end if;
  update public.subscriptions set status='expired',replaced_at=now() where user_id=r.user_id and status='active';
  insert into public.subscriptions(user_id,plan,amount_ugx,provider,provider_reference,status,starts_at,ends_at,payment_request_id,approved_by)
  values(r.user_id,v_plan,r.amount_ugx,'manual',r.transaction_id,'active',now(),now()+make_interval(days=>v_days),r.id,auth.uid());
 end if;
end $$;
revoke all on function public.admin_review_payment(uuid,boolean,text) from public;
grant execute on function public.admin_review_payment(uuid,boolean,text) to authenticated;

-- Enforce admin-only resource inserts at the database layer.
drop policy if exists "Admin inserts resources" on public.resources;
create policy "Admin inserts resources" on public.resources for insert to authenticated with check(public.is_gaceb_admin() and uploaded_by=auth.uid());
-- New resources should use status='approved' and published=true only when the admin publishes them.
