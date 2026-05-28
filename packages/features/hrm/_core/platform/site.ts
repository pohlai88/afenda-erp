/**
 * Site-level URL helpers — isomorphic.
 */

/** Base URL for the Afenda ERP application. Falls back to localhost in dev. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

/**
 * Constructs an absolute URL for the given path relative to the site root.
 */
export function siteUrl(path: string): string {
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`
}
