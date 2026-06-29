-- ───────────────────────────────────────────────────────────────────────────
-- Libra · per-document freeform canvas
--
-- A document is one saved workspace with two views of the SAME row: the block
-- `content` (Block[]) and now a `canvas` (CanvasObject[]). Storing the canvas on
-- the document row is what makes the freeform board "belong to the project" and
-- persist, instead of evaporating in client memory.
--
-- No new RLS needed: the existing owner-only policies on public.documents
-- (auth.uid() = user_id) already gate every column, including this one (A01).
-- Defaults to an empty array so existing rows load cleanly.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.documents
  add column if not exists canvas jsonb not null default '[]'::jsonb;
