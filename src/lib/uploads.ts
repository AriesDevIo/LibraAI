import { createClient } from "@/lib/supabase/client";
import { isSafeImageUrl } from "@/components/canvas/types";

/**
 * Client-side image upload to the `note-images` Supabase Storage bucket.
 *
 * SECURITY (A05): raster image types only — SVG is rejected (it can carry
 * script) — and a hard size cap, mirrored by the bucket's own
 * allowed_mime_types + file_size_limit and owner-only Storage RLS (files live
 * under `<uid>/…`). The returned public URL is still run through isSafeImageUrl
 * before any caller sets it as an <img> src.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGE_LABEL = "5 MB";

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type UploadResult = { url: string } | { error: string };

export const BUCKET = "note-images";

/** Upload one image file; resolves to a public URL or a friendly error. */
export async function uploadImage(file: File): Promise<UploadResult> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { error: "Only PNG, JPEG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `Image is too large (max ${MAX_IMAGE_LABEL}).` };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to upload images." };

  const ext = EXT[file.type] ?? "bin";
  // Per-user folder so Storage RLS can scope writes to the owner.
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = data.publicUrl;
  if (!isSafeImageUrl(url)) return { error: "Upload produced an unexpected URL." };
  return { url };
}
