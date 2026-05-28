/**
 * Organization-scoped application route path builders for HRM and other
 * ERP modules.
 *
 * All helpers are isomorphic (safe in client and server).
 */
import type { Route } from "next"

const BASE = "/apps" as const

/** Segment identifier for the HRM apps area. */
export const ORG_APPS_HRM = "hrm" as const

/** Sub-segment constants used by talent training routes. */
export const ORG_APPS_HRM_TRAINING = `${ORG_APPS_HRM}/training` as const

/** Sub-segment constant for recruitment routes. */
export const ORG_APPS_HRM_RECRUITMENT = `${ORG_APPS_HRM}/recruitment` as const

/** Sub-segment constant for performance appraisal routes. */
export const ORG_APPS_HRM_PERFORMANCE = `${ORG_APPS_HRM}/performance` as const

/** Sub-segment constant for LMS routes. */
export const ORG_APPS_HRM_LMS = `${ORG_APPS_HRM}/lms` as const

/**
 * Builds the base path for an org-scoped module application area.
 *
 * @example
 *   organizationAppsPath("my-org", "hrm")
 *   // → "/my-org/apps/hrm"
 */
export function organizationAppsPath(
  orgSlug: string,
  moduleSegment: string,
  ...subSegments: string[]
): Route {
  const parts = [orgSlug, BASE.slice(1), moduleSegment, ...subSegments].filter(
    Boolean,
  )
  return `/${parts.join("/")}` as Route
}
