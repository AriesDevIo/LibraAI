-- ─────────────────────────────────────────────────────────────────────────
-- Libra · documents + Row Level Security (OWASP A01: Broken Access Control)
--
-- One row per note/document. The block editor stores its blocks as a JSON
-- array in `content` (see src/components/editor/types.ts: Block[]).
--
-- A01 is enforced entirely by RLS: every policy is scoped to
-- `auth.uid() = user_id`, so an authenticated user can ONLY ever read/write
-- their OWN documents — even if they guess another row's UUID via the API
-- (this is exactly what pentest T01 attacks). There is deliberately NO
-- permissive `using (true)` policy: SELECT policies are OR'd, so a single
-- `true` would expose every row to the anon key.
--
-- Idempotent: safe to re-run (guards + drop-if-exists on policies/triggers).
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default 'Untitled',
  -- Array of editor blocks. Plain data only — never rendered as raw HTML
  -- (A05/XSS is handled in the editor; this column stores escaped strings).
  content    jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_updated_at_idx on public.documents(updated_at desc);

alter table public.documents enable row level security;

-- Owner-only access. One policy per command (no broad `using (true)`).
drop policy if exists "Documents: owner can read" on public.documents;
create policy "Documents: owner can read"
  on public.documents for select
  using (auth.uid() = user_id);

drop policy if exists "Documents: owner can insert" on public.documents;
create policy "Documents: owner can insert"
  on public.documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Documents: owner can update" on public.documents;
create policy "Documents: owner can update"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Documents: owner can delete" on public.documents;
create policy "Documents: owner can delete"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Auto-bump updated_at on every update. search_path pinned to '' to prevent
-- search-path hijacking (A02), matching public.handle_new_user in 0001.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();
