-- ─────────────────────────────────────────────────────────────────────────
-- Libra · profiles + Row Level Security (OWASP A01: Broken Access Control)
--
-- One profile row per auth user. RLS is the core of A01 here: a user may only
-- ever read/write their OWN row. We deliberately DO NOT add a permissive
-- `using (true)` SELECT policy — Postgres has no column-level RLS and SELECT
-- policies are OR'd, so a single `true` policy would expose every row to the
-- public anon key. Username availability is checked via a SECURITY DEFINER
-- function that returns only a boolean, leaking no row data.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Own-row access only. No public SELECT policy by design.
create policy "Profiles: owner can read own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: owner can insert own row"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles: owner can update own row"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile when a new auth user signs up. SECURITY DEFINER so the
-- insert runs as the table owner (the new user has no session yet at this
-- point); search_path is pinned to '' to prevent search-path hijacking (A02).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Username availability without exposing rows: returns a boolean only.
create or replace function public.username_available(u text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (
    select 1 from public.profiles where username = lower(trim(u))
  );
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
