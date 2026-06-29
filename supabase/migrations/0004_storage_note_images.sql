-- ───────────────────────────────────────────────────────────────────────────
-- Libra · image uploads (Supabase Storage)
--
-- A public bucket for user-uploaded images used by the editor image blocks and
-- canvas image objects. Files live under a per-user folder ("<uid>/<file>") so
-- WRITES are owner-only via Storage RLS; READS are public so embedded <img> tags
-- load without expiring signed URLs (paths are random, not enumerable).
--
-- SECURITY (A05): the bucket only accepts raster image mime types — NO SVG
-- (which can carry script) — and caps file size. Every resulting URL is still
-- run through isSafeImageUrl (http/https only) before it's ever set as a src.
-- ───────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-images',
  'note-images',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read of this bucket only.
drop policy if exists "note-images public read" on storage.objects;
create policy "note-images public read"
  on storage.objects for select
  using (bucket_id = 'note-images');

-- Authenticated users may write only inside their own "<uid>/…" folder.
drop policy if exists "note-images owner insert" on storage.objects;
create policy "note-images owner insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'note-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "note-images owner update" on storage.objects;
create policy "note-images owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'note-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "note-images owner delete" on storage.objects;
create policy "note-images owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'note-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
