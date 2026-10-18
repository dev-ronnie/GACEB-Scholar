-- GACEB Scholar database setup for Supabase SQL Editor.
-- Run this whole file once in a NEW Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default 'Student',
 email text,
 school text not null default '',
 gender text,
 phone text not null default '',
 education_level text not null default '',
 level text not null default 'O-Level' check (level in ('O-Level','A-Level','Teacher')),
 role text not null default 'student' check (role in ('student','teacher','admin')),
 coins integer not null default 0 check (coins >= 0),
 referral_code text unique,
 created_at timestamptz not null default now()
);

create table if not exists public.resources (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 description text not null default '',
 subject text not null,
 level text not null check (level in ('O-Level','A-Level')),
 category text not null check (category in ('Sciences','Humanities','Arts')),
 resource_type text not null default 'Notes' check (resource_type in ('Notes','Past Paper','Revision Guide','Other')),
 access_type text not null default 'coins' check (access_type in ('free','coins','premium')),
 coin_cost integer not null default 5 check (coin_cost >= 0),
 education_class text not null default '',
 published boolean not null default false,
 file_path text not null,
 uploaded_by uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 reviewed_by uuid references public.profiles(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists resources_status_created_idx on public.resources(status, created_at desc);
create index if not exists resources_uploaded_by_idx on public.resources(uploaded_by);

create table if not exists public.coin_transactions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 amount integer not null,
 reason text not null check (reason in ('approved_upload','verified_referral','admin_adjustment','premium_reward')),
 reference_id uuid,
 note text not null default '',
 created_at timestamptz not null default now(),
 unique(user_id, reason, reference_id)
);
create table if not exists public.referrals (
 id uuid primary key default gen_random_uuid(),
 inviter_id uuid not null references public.profiles(id) on delete cascade,
 invitee_id uuid unique references public.profiles(id) on delete cascade,
 referral_code text not null,
 status text not null default 'pending' check (status in ('pending','verified','rejected')),
 verified_by uuid references public.profiles(id),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 check (inviter_id <> invitee_id)
);
create table if not exists public.subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 plan text not null check (plan in ('daily','weekly','monthly','yearly')),
 amount_ugx integer not null check (amount_ugx in (2000,7000,20000,150000)),
 provider text not null default 'manual',
 provider_reference text unique,
 status text not null default 'pending' check (status in ('pending','active','expired','failed','cancelled')),
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.resource_unlocks (user_id uuid not null references public.profiles(id) on delete cascade, resource_id uuid not null references public.resources(id) on delete cascade, coins_paid integer not null default 0, unlocked_at timestamptz not null default now(), primary key(user_id,resource_id));
create table if not exists public.contact_messages (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 email text not null,
 message text not null,
 created_at timestamptz not null default now()
);

-- Create a profile when an auth user signs up. Signup can choose student or teacher, never admin.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare code text; selected_role text;
begin
 code := 'G-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,6));
 selected_role := case when new.raw_user_meta_data->>'account_role'='teacher' then 'teacher' else 'student' end;
 insert into public.profiles(id, full_name, email, school, level, role, referral_code, gender, phone, education_level)
 values(new.id, coalesce(new.raw_user_meta_data->>'full_name','Student'), new.email,
        coalesce(new.raw_user_meta_data->>'school',''),
        case when new.raw_user_meta_data->>'level' in ('O-Level','A-Level') then new.raw_user_meta_data->>'level' else 'O-Level' end,
        selected_role, code, nullif(new.raw_user_meta_data->>'gender',''), coalesce(new.raw_user_meta_data->>'phone',''), coalesce(new.raw_user_meta_data->>'education_level',''))
 on conflict (id) do nothing;
 -- Record an invite when the new learner supplied a valid existing referral code.
 if nullif(trim(coalesce(new.raw_user_meta_data->>'referral_code','')),'') is not null then
   insert into public.referrals(inviter_id, invitee_id, referral_code)
   select p.id, new.id, p.referral_code from public.profiles p
   where upper(p.referral_code)=upper(trim(new.raw_user_meta_data->>'referral_code')) and p.id<>new.id
   on conflict (invitee_id) do nothing;
 end if;
 return new;
end; $$;
drop trigger if exists on_auth_user_created_gaceb on auth.users;
create trigger on_auth_user_created_gaceb after insert on auth.users for each row execute procedure public.handle_new_user();

-- Keep role and coin balance from being edited by a normal profile update.
create or replace function public.protect_profile_fields() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is not null and auth.uid() = old.id and coalesce(current_setting('gaceb.allow_trusted_profile_change', true),'off') <> 'on' then
   if new.role is distinct from old.role or new.coins is distinct from old.coins or new.referral_code is distinct from old.referral_code then
     raise exception 'Role, coins and referral code can only be changed by trusted database functions.';
   end if;
 end if;
 return new;
end; $$;
drop trigger if exists protect_profile_fields_gaceb on public.profiles;
create trigger protect_profile_fields_gaceb before update on public.profiles for each row execute procedure public.protect_profile_fields();

create or replace function public.is_gaceb_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

-- Only admins can approve a PDF. Approval does not award unapproved coin rewards.
create or replace function public.approve_resource(resource_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare r public.resources%rowtype;
begin
 if not public.is_gaceb_admin() then raise exception 'Admin access required'; end if;
 select * into r from public.resources where id=resource_id for update;
 if not found then raise exception 'Resource not found'; end if;
 if r.status <> 'approved' then
   update public.resources set status='approved', reviewed_by=auth.uid(), reviewed_at=now() where id=resource_id;
 end if;
end; $$;

-- Admin verifies a referral after checking it is a genuine new account.
create or replace function public.verify_referral(referral_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare r public.referrals%rowtype;
begin
 if not public.is_gaceb_admin() then raise exception 'Admin access required'; end if;
 select * into r from public.referrals where id=referral_id for update;
 if not found then raise exception 'Referral not found'; end if;
 if r.status='pending' then
   update public.referrals set status='verified',verified_by=auth.uid(),verified_at=now() where id=referral_id;
 end if;
end; $$;

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.resource_unlocks enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Profiles visible to owner or admin" on public.profiles;
create policy "Profiles visible to owner or admin" on public.profiles for select to authenticated using (id=auth.uid() or public.is_gaceb_admin());
drop policy if exists "Users update own basic profile" on public.profiles;
create policy "Users update own basic profile" on public.profiles for update to authenticated using (id=auth.uid() or public.is_gaceb_admin()) with check (id=auth.uid() or public.is_gaceb_admin());
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_gaceb_admin()) with check (public.is_gaceb_admin());

drop policy if exists "Approved resources are public" on public.resources;
create policy "Approved resources are public" on public.resources for select to anon, authenticated using (status='approved' or uploaded_by=auth.uid() or public.is_gaceb_admin());
drop policy if exists "Authenticated students submit resources" on public.resources;
drop policy if exists "Admin inserts resources" on public.resources;
create policy "Admin inserts resources" on public.resources for insert to authenticated with check (public.is_gaceb_admin() and uploaded_by=auth.uid());
drop policy if exists "Admins update resources" on public.resources;
create policy "Admins update resources" on public.resources for update to authenticated using (public.is_gaceb_admin()) with check (public.is_gaceb_admin());
drop policy if exists "Users view own coin history" on public.coin_transactions;
create policy "Users view own coin history" on public.coin_transactions for select to authenticated using (user_id=auth.uid() or public.is_gaceb_admin());
drop policy if exists "Users view relevant referrals" on public.referrals;
create policy "Users view relevant referrals" on public.referrals for select to authenticated using (inviter_id=auth.uid() or invitee_id=auth.uid() or public.is_gaceb_admin());
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

drop policy if exists "Users view own subscriptions" on public.subscriptions;
create policy "Users view own subscriptions" on public.subscriptions for select to authenticated using (user_id=auth.uid() or public.is_gaceb_admin());
drop policy if exists "Users submit contact messages" on public.contact_messages;
create policy "Users submit contact messages" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "Admins view contact messages" on public.contact_messages;
create policy "Admins view contact messages" on public.contact_messages for select to authenticated using (public.is_gaceb_admin());

-- Private PDF bucket. Downloads are served through short-lived signed URLs by the app.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('study-pdfs','study-pdfs',false,15728640,array['application/pdf'])
on conflict (id) do update set public=false,file_size_limit=15728640,allowed_mime_types=array['application/pdf'];
drop policy if exists "Students upload PDFs to own folder" on storage.objects;
drop policy if exists "Admin uploads study PDFs" on storage.objects;
create policy "Admin uploads study PDFs" on storage.objects for insert to authenticated with check (bucket_id='study-pdfs' and public.is_gaceb_admin());
drop policy if exists "Students can update own PDF files" on storage.objects;
drop policy if exists "Admin updates study PDFs" on storage.objects;
create policy "Admin updates study PDFs" on storage.objects for update to authenticated using (bucket_id='study-pdfs' and public.is_gaceb_admin()) with check (bucket_id='study-pdfs' and public.is_gaceb_admin());
drop policy if exists "Owners or admins can delete PDFs" on storage.objects;
drop policy if exists "Admin deletes study PDFs" on storage.objects;
create policy "Admin deletes study PDFs" on storage.objects for delete to authenticated using (bucket_id='study-pdfs' and public.is_gaceb_admin());
drop policy if exists "Owners or admins can create signed PDF access" on storage.objects;
drop policy if exists "Authorized users read study PDFs" on storage.objects;
create policy "Authorized users read study PDFs" on storage.objects for select to authenticated using (bucket_id='study-pdfs' and (public.is_gaceb_admin() or exists(select 1 from public.resources r where r.file_path=name and r.status='approved' and (r.access_type='free' or exists(select 1 from public.resource_unlocks u where u.resource_id=r.id and u.user_id=auth.uid()) or (r.access_type='premium' and exists(select 1 from public.subscriptions s where s.user_id=auth.uid() and s.status='active' and s.ends_at>now()))))));

-- SETUP: after your first signup, promote your own account to admin from Supabase SQL Editor:
-- update public.profiles set role='admin' where email='YOUR-LOGIN-EMAIL';
-- Do not expose a service_role key in config.js or in the browser.
