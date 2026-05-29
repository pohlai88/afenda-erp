import "server-only"

import { revalidatePath, revalidateTag, updateTag } from "next/cache"

import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"

import type { TciSyncSourceKind } from "../schemas/tci-workflow-state.shared"
import { hrmTimeClockOrgCacheTag } from "../tci-cache-tags.shared"
import { TCI_API_INGEST_SOURCE_KIND } from "../tci-api-ingest.shared"
import { TCI_SCHEDULED_SYNC_SOURCE_KIND } from "../tci-scheduled-sync.shared"

export function revalidateTimeClockSurfaces(organizationId: string) {
  const tag = hrmTimeClockOrgCacheTag(organizationId)
  revalidateTag(tag, "max")
  revalidatePath(toLocaleOrgAppsRevalidatePattern("/hrm/time-clock"), "layout")
  revalidatePath(toLocaleOrgAppsRevalidatePattern("/hrm/attendance"), "layout")
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern("/hrm/employees/[employeeId]"),
    "page"
  )
}

/** Server Actions: immediate read-your-own-writes for tagged Tier B caches. */
export function updateTimeClockOrgCacheTag(organizationId: string) {
  updateTag(hrmTimeClockOrgCacheTag(organizationId))
}

/** Cron and integration ingest have no signed-in UI waiter. */
export function shouldRevalidateTimeClockUi(input: {
  readonly sourceKind: TciSyncSourceKind
  readonly actorUserId: string
  readonly ingestAuthKind?: "integration_api_key" | "org_session"
}): boolean {
  if (input.sourceKind === TCI_SCHEDULED_SYNC_SOURCE_KIND) {
    return false
  }
  if (input.actorUserId === "system") {
    return false
  }
  if (
    input.ingestAuthKind === "integration_api_key" &&
    input.sourceKind === TCI_API_INGEST_SOURCE_KIND
  ) {
    return false
  }
  return true
}
