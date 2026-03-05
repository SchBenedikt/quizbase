"use client";

/**
 * Resolves a dynamic route parameter, falling back to URL extraction when the
 * value is '_' (the Cloudflare Workers static-shell placeholder).
 *
 * In the Cloudflare Workers static deployment, dynamic HTML shells are
 * pre-rendered with '_' as the param value (via generateStaticParams).
 * On the client side, Next.js hydrates with the pre-baked '_' value instead
 * of the real URL segment because the router context is initialised from the
 * embedded RSC payload (which records the '_' path). Reading
 * window.location.pathname directly bypasses the router context and always
 * reflects the real browser URL.
 *
 * @param paramValue   - The param value resolved from `use(params)`
 * @param segmentIndex - Zero-based index of the non-empty URL segment holding
 *                       this param after splitting on '/' and filtering blanks.
 *                       e.g. /presenter/edit/<id> → segmentIndex 2
 *                       e.g. /presenter/<id>      → segmentIndex 1
 * @returns The resolved param value, or an empty string if the URL path does
 *          not contain a segment at the given index (malformed URL).
 */
export function useResolvedParam(paramValue: string, segmentIndex: number): string {
  if (paramValue !== "_") return paramValue;
  if (typeof window === "undefined") return paramValue;
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[segmentIndex] ?? "";
}
