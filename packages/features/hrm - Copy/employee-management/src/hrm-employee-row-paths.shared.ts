import type { Route } from "next"

import { normalizeOrgSlugParam } from "@afenda/platform/auth/org-slug.shared"

/** UUID v1–v8 shape — keep in sync with forwarded-path / evidence route guards. */
export function isLikelyHrmUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

/** Locale-internal employee detail URL (`/apps/hrm/employees/{id}`). */
export function organizationHrmEmployeePath(
  orgSlug: string,
  employeeId: string
): Route {
  const slug = normalizeOrgSlugParam(orgSlug)
  if (!slug) {
    throw new Error("organizationHrmEmployeePath: invalid org slug")
  }
  return `/o/${slug}/apps/hrm/employees/${employeeId}` as Route
}

/** Locale-internal compliance evidence detail URL (`/apps/hrm/compliance/{evidenceId}`). */
export function organizationHrmComplianceDetailPath(
  orgSlug: string,
  evidenceId: string
): Route {
  const slug = normalizeOrgSlugParam(orgSlug)
  if (!slug) {
    throw new Error("organizationHrmComplianceDetailPath: invalid org slug")
  }
  if (!isLikelyHrmUuid(evidenceId)) {
    throw new Error(
      "organizationHrmComplianceDetailPath: evidenceId is not a valid UUID"
    )
  }
  return `/o/${slug}/apps/hrm/compliance/${evidenceId}` as Route
}
