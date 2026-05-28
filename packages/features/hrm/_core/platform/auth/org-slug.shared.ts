/**
 * Organization slug helpers — isomorphic (safe in client and server).
 */

/**
 * Normalizes an org slug segment from route params: trims, lowercases, and
 * strips leading slashes from Next.js catch-all segments.
 */
export function normalizeOrgSlugParam(
  raw: string | string[] | undefined,
): string {
  if (Array.isArray(raw)) return normalizeOrgSlugParam(raw[0])
  return (raw ?? "").trim().toLowerCase().replace(/^\/+/, "")
}
