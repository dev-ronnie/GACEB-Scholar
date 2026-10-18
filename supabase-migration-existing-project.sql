-- GACEB Scholar safe feature migration (existing Supabase project)
-- BACK UP your database first. This migration adds fields/tables; it does not delete user data.
create extension if not exists pgcrypto;

alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists education_level text;
alter table public.profiles add column if not exists phone text;
-- Profile photos are intentionally not used by teacher/student profiles.
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists referral_code text;
-- Normalize older referral codes to the requested G-XXXXXX format where possible, without collisions.
update public.profiles set referral_code='G-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,6)) where referral_code is null or referral_code !~ '^G-[A-Z0-9]{6}$';
create unique index if not exists profiles_referral_code_unique_idx on public.profiles(referral_code);

-- New signups may choose student or teacher. Never accept admin from signup metadata.
alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists level text not null default 'O-Level';
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare code text; selected_role text;
begin
 selected_role := case when new.raw_user_meta_data->>'account_role'='teacher' then 'teacher' else 'student' end;
 code := 'G-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,6));
 insert into public.profiles(id,full_name,email,school,level,role,referral_code,gender,phone,education_level)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name','Student'),new.email,
 coalesce(new.raw_user_meta_data->>'school',''),
 case when new.raw_user_meta_data->>'level' in ('O-Level','A-Level') then new.raw_user_meta_data->>'level' else 'O-Level' end,
 selected_role,code,nullif(new.raw_user_meta_data->>'gender',''),coalesce(new.raw_user_meta_data->>'phone',''),coalesce(new.raw_user_meta_data->>'education_level',''))
 on conflict(id) do nothing;
 if nullif(trim(coalesce(new.raw_user_meta_data->>'referral_code','')),'') is not null then
  insert into public.referrals(inviter_id,invitee_id,referral_code)
  select p.id,new.id,p.referral_code from public.profiles p where upper(p.referral_code)=upper(trim(new.raw_user_meta_data->>'referral_code')) and p.id<>new.id
  on conflict(invitee_id) do nothing;
 end if;
 return new;
end; $$;



create or replace function public.protect_profile_fields() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is not null and auth.uid()=old.id and coalesce(current_setting('gaceb.allow_trusted_profile_change',true),'off') <> 'on' then
  if new.role is distinct from old.role or new.coins is distinct from old.coins or new.referral_code is distinct from old.referral_code then
   raise exception 'Role, coins and referral code can only be changed by trusted database functions.';
  end if;
 end if;
 return new;
end; $$;
drop trigger if exists protect_profile_fields_gaceb on public.profiles;
create trigger protect_profile_fields_gaceb before update on public.profiles for each row execute procedure public.protect_profile_fields();

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
create or replace function public.unlock_resource(p_resource_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare r public.resources%rowtype; balance integer;
begin
 if auth.uid() is null then raise exception 'Please sign in first'; end if;
 perform set_config('gaceb.allow_trusted_profile_change','on',true);
 select * into r from public.resources where id=p_resource_id and status='approved' for update;
 if not found then raise exception 'Document is not available'; end if;
 if public.is_gaceb_admin() or r.access_type='free' then return true; end if;
 if r.access_type='premium' then
  if exists(select 1 from public.subscriptions where user_id=auth.uid() and status='active' and ends_at>now()) then return true; end if;
  raise exception 'An active Premium subscription is required for this document';
 end if;
 if exists(select 1 from public.resource_unlocks where user_id=auth.uid() and resource_id=r.id) then return true; end if;
 select coins into balance from public.profiles where id=auth.uid() for update;
 if coalesce(balance,0)<r.coin_cost then raise exception 'Not enough coins. Buy a coin package first'; end if;
 update public.profiles set coins=coins-r.coin_cost where id=auth.uid();
 insert into public.resource_unlocks(user_id,resource_id,coins_paid) values(auth.uid(),r.id,r.coin_cost) on conflict do nothing;
 return true;
end; $$;
revoke all on function public.unlock_resource(uuid) from public;
grant execute on function public.unlock_resource(uuid) to authenticated;


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
drop policy if exists "Authorized users read study PDFs" on storage.objects;
create policy "Authorized users read study PDFs" on storage.objects for select to authenticated using(bucket_id='study-pdfs' and (public.is_gaceb_admin() or exists(select 1 from public.resources r where r.file_path=name and r.status='approved' and (r.access_type='free' or exists(select 1 from public.resource_unlocks u where u.resource_id=r.id and u.user_id=auth.uid()) or (r.access_type='premium' and exists(select 1 from public.subscriptions s where s.user_id=auth.uid() and s.status='active' and s.ends_at>now()))))));

create or replace function public.submit_payment_request(purpose text, package_code text, amount_ugx integer, coins_to_add integer, transaction_id text, payment_phone text default '') returns uuid
language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
 if auth.uid() is null then raise exception 'Please sign in first'; end if;
 if purpose not in ('coins','premium','donation') then raise exception 'Invalid payment purpose'; end if;
 if amount_ugx <= 0 or coins_to_add < 0 or length(trim(transaction_id)) < 4 then raise exception 'Invalid payment details'; end if;
 if purpose='coins' and not ((package_code='coins_150' and amount_ugx=10000 and coins_to_add=150) or (package_code='coins_500' and amount_ugx=25000 and coins_to_add=500) or (package_code='coins_1000' and amount_ugx=40000 and coins_to_add=1000)) then raise exception 'Coin package price does not match the approved price list'; end if;
 if purpose='premium' and not ((package_code='daily' and amount_ugx=2000) or (package_code='weekly' and amount_ugx=7000) or (package_code='monthly' and amount_ugx=20000) or (package_code='yearly' and amount_ugx=150000)) then raise exception 'Premium plan price does not match the approved price list'; end if;
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
 perform set_config('gaceb.allow_trusted_profile_change','on',true);
 select * into r from public.payment_requests where id=p_request_id for update;
 if not found then raise exception 'Payment request not found'; end if;
 if r.status <> 'pending' then raise exception 'This payment request has already been reviewed'; end if;
 if r.purpose='coins' and not ((r.package_code='coins_150' and r.amount_ugx=10000 and r.coins_to_add=150) or (r.package_code='coins_500' and r.amount_ugx=25000 and r.coins_to_add=500) or (r.package_code='coins_1000' and r.amount_ugx=40000 and r.coins_to_add=1000)) then raise exception 'Coin package price does not match the approved price list'; end if;
 if r.purpose='premium' and not ((r.package_code='daily' and r.amount_ugx=2000) or (r.package_code='weekly' and r.amount_ugx=7000) or (r.package_code='monthly' and r.amount_ugx=20000) or (r.package_code='yearly' and r.amount_ugx=150000)) then raise exception 'Premium plan price does not match the approved price list'; end if;
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


-- Corrected: document approval does not automatically grant an unapproved coin reward.
create or replace function public.approve_resource(resource_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare r public.resources%rowtype;
begin
 if not public.is_gaceb_admin() then raise exception 'Admin access required'; end if;
 select * into r from public.resources where id=resource_id for update;
 if not found then raise exception 'Resource not found'; end if;
 if r.status <> 'approved' then update public.resources set status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=resource_id; end if;
end; $$;
revoke all on function public.approve_resource(uuid) from public;
grant execute on function public.approve_resource(uuid) to authenticated;
-- Referral verification records verification only; no unapproved referral bonus is awarded.
create or replace function public.verify_referral(referral_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare r public.referrals%rowtype;
begin
 if not public.is_gaceb_admin() then raise exception 'Admin access required'; end if;
 select * into r from public.referrals where id=referral_id for update;
 if not found then raise exception 'Referral not found'; end if;
 if r.status='pending' then update public.referrals set status='verified',verified_by=auth.uid(),verified_at=now() where id=referral_id; end if;
end; $$;
revoke all on function public.verify_referral(uuid) from public;
grant execute on function public.verify_referral(uuid) to authenticated;

-- Enforce admin-only resource inserts at the database layer.
drop policy if exists "Admin inserts resources" on public.resources;
create policy "Admin inserts resources" on public.resources for insert to authenticated with check(public.is_gaceb_admin() and uploaded_by=auth.uid());
-- New resources should use status='approved' and published=true only when the admin publishes them.
