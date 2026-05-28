/**
 * Employee Self-Service portal path utilities — isomorphic.
 */

/**
 * Builds the Next.js `revalidatePath` pattern for a locale-prefixed portal page.
 *
 * @example
 *   toLocalePortalRevalidatePattern("en", "my-org")
 *   // → "/en/my-org/portal"
 *
 * Pass `subPath` for deeper invalidation e.g. "/en/my-org/portal/leave".
 */
export function toLocalePortalRevalidatePattern(
  locale: string,
  orgSlug: string,
  subPath?: string,
): string {
  const base = `/${locale}/${orgSlug}/portal`
  return subPath ? `${base}/${subPath.replace(/^\/+/, "")}` : base
}
