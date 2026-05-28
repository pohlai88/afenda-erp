/**
 * Org-scoped apps route segment helpers — isomorphic.
 */

/**
 * Returns the expected locale-prefixed pathname prefix for org app routes:
 * /{locale}/{orgSlug}/apps/{moduleId}
 */
export function getOrgAppsRoutePrefix(
  locale: string,
  orgSlug: string,
  moduleId: string,
): string {
  return `/${locale}/${orgSlug}/apps/${moduleId}`
}

/**
 * Extracts the org slug from a pathname that follows the
 * /{locale}/{orgSlug}/... convention.
 *
 * Returns null when the path doesn't match the expected shape.
 */
export function extractOrgSlugFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean)
  return parts[1] ?? null // [locale, orgSlug, ...]
}
