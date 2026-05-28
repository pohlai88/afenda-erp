/**
 * Org-scoped cache tags for time-clock Tier B reads (`unstable_cache` in `tci.queries.server.ts`).
 * Invalidate via `revalidateTag(tag, "max")` from ingest, cron, and Server Actions.
 */

export function hrmTimeClockOrgCacheTag(organizationId: string): string {
  return `erp:org:${organizationId}:hrm-time-clock`
}
