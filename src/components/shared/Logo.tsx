"use client";

import { useState, useEffect, useRef } from "react";

interface LogoProps {
  /** Size of the brand mark in px. */
  size?: number;
  /** Tailwind size class for the wordmark text. */
  textClassName?: string;
  /** Show the "Libra" wordmark next to the mark. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Libra brand mark + wordmark.
 *
 * The mark renders `/LibraNoBg.png` from the public folder — drop the real
 * crown asset in there with that exact name and it appears everywhere. Until
 * then, a polished violet crown glyph stands in (via onError), so the brand
 * never shows a broken image. The wordmark accents the second syllable in the
 * brand violet: Li·bra.
 */
export default function Logo({
  size = 34,
  textClassName = "text-xl",
  showWordmark = true,
  className = "",
}: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The image may finish (and fail) loading before React hydrates and attaches
  // onError — so re-check on mount: a "complete" image with zero natural width
  // means the asset is missing, and we fall back to the crown glyph.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setImgFailed(true);
  }, []);

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {imgFailed ? (
        <span
          className="inline-flex items-center justify-center rounded-xl"
          style={{
            width: size,
            height: size,
            background:
              "linear-gradient(135deg, var(--color-secondary), var(--color-glow))",
            boxShadow:
              "0 6px 18px color-mix(in srgb, var(--color-secondary) 35%, transparent)",
          }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width={size * 0.62}
            height={size * 0.62}
            fill="#ffffff"
          >
            <path d="M3 8.4c0-.78.92-1.2 1.5-.67L8 10.9l3.2-5.6c.36-.62 1.25-.62 1.6 0l3.2 5.6 3.5-3.17c.58-.53 1.5-.11 1.5.67 0 .06 0 .12-.02.18L19.7 18.2c-.13.6-.66 1.05-1.28 1.05H5.58c-.62 0-1.15-.45-1.28-1.05L3.02 8.58A.9.9 0 0 1 3 8.4Z" />
            <circle cx="12" cy="9.4" r="1.15" fill="var(--color-secondary)" />
          </svg>
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src="/LibraNoBg.png"
          alt="Libra"
          width={size}
          height={size}
          className="rounded-sm"
          onError={() => setImgFailed(true)}
          suppressHydrationWarning
        />
      )}

      {showWordmark && (
        <span
          className={`font-extrabold tracking-tighter leading-none ${textClassName}`}
        >
          <span style={{ color: "var(--color-fg)" }}>Li</span>
          <span style={{ color: "var(--color-secondary)" }}>bra</span>
        </span>
      )}
    </span>
  );
}
