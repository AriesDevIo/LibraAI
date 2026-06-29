"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseCircle, GalleryMinimalistic, DangerTriangle } from "@solar-icons/react/ssr";
import { isSafeImageUrl } from "./types";
import { uploadImage } from "@/lib/uploads";

interface ImageUrlDialogProps {
  onClose: () => void;
  onAdd: (url: string, alt: string) => void;
}

/**
 * Small modal to add an image by URL. The URL is validated to http(s) only
 * (isSafeImageUrl) before it can be added — blocking `javascript:` / `data:`
 * injection. Alt text is an optional plain string (improves accessibility and
 * is escaped on render).
 *
 * The parent mounts this only while open, so fresh state is the reset state —
 * no state-resetting effect needed.
 */
export default function ImageUrlDialog({ onClose, onAdd }: ImageUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlFieldId = useId();
  const altFieldId = useId();

  // Focus the URL field on open (DOM sync, not state).
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const valid = isSafeImageUrl(url);
  const showError = touched && url.trim().length > 0 && !valid;

  const submit = () => {
    if (!valid) {
      setTouched(true);
      return;
    }
    onAdd(url.trim(), alt.trim());
    onClose();
  };

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUpErr(null);
    setUploading(true);
    const res = await uploadImage(file);
    setUploading(false);
    if ("url" in res) {
      onAdd(res.url, alt.trim() || file.name.replace(/\.[^.]+$/, ""));
      onClose();
    } else {
      setUpErr(res.error);
    }
  }

  const fieldStyle: React.CSSProperties = {
    background: "var(--color-bg)",
    border: "1px solid var(--color-surface-border)",
    color: "var(--color-fg)",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add image by URL"
      className="libra-fade-in fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--color-fg) 45%, transparent)" }}
      onPointerDown={(e) => {
        // Click on the backdrop (not the panel) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-surface-border)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--color-fg)" }}
          >
            Add an image
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]"
            style={{ color: "var(--color-accent)" }}
          >
            <CloseCircle size={18} color="currentColor" weight="Bold" />
          </button>
        </div>

        <label
          htmlFor={urlFieldId}
          className="mb-1.5 block text-xs font-semibold"
          style={{ color: "var(--color-fg)" }}
        >
          Image URL
        </label>
        <input
          id={urlFieldId}
          ref={inputRef}
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="https://example.com/photo.jpg"
          aria-invalid={showError}
          aria-describedby={showError ? `${urlFieldId}-err` : undefined}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-secondary)]"
          style={fieldStyle}
        />
        {showError ? (
          <p
            id={`${urlFieldId}-err`}
            className="mt-1.5 text-xs"
            style={{ color: "var(--color-secondary-text)" }}
          >
            Enter a valid http(s) image URL.
          </p>
        ) : (
          <p className="mt-1.5 text-xs" style={{ color: "var(--color-accent)" }}>
            Only http and https links are allowed.
          </p>
        )}

        {/* Or upload from device */}
        <div className="mt-3 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "var(--color-surface-border)" }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
            or
          </span>
          <span className="h-px flex-1" style={{ background: "var(--color-surface-border)" }} />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-surface-border)",
            color: "var(--color-fg)",
          }}
        >
          <GalleryMinimalistic size={15} color="currentColor" weight="Bold" />
          {uploading ? "Uploading…" : "Upload from device"}
        </button>
        {upErr && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "var(--color-secondary-text)" }}>
            <DangerTriangle size={13} color="currentColor" weight="Bold" />
            {upErr}
          </p>
        )}

        <label
          htmlFor={altFieldId}
          className="mb-1.5 mt-4 block text-xs font-semibold"
          style={{ color: "var(--color-fg)" }}
        >
          Alt text <span style={{ color: "var(--color-accent)" }}>(optional)</span>
        </label>
        <input
          id={altFieldId}
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Describe the image"
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-secondary)]"
          style={fieldStyle}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-fg)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "var(--color-secondary)", color: "white" }}
          >
            Add image
          </button>
        </div>
      </div>
    </div>
  );
}
