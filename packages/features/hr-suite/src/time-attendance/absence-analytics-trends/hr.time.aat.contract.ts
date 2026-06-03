import type {
  HrAatAnalyticsQuery,
  HrAatAnalyticsSnapshot,
} from "./hr.time.aat-analytics.schema";

/** ERP permission objects for AAT governed surfaces (HRM-AAT-025 deferred to policies agent). */
export const hrTimeAatReadPermission = {
  module: "hr",
  object: "absence_analytics",
  function: "read",
} as const;

export const hrTimeAatExportPermission = {
  module: "hr",
  object: "absence_analytics",
  function: "export",
} as const;

/** Route segment for absence analytics workbench. */
export const HR_TIME_AAT_ROUTE_SEGMENT = "absence-analytics-trends" as const;

/** Audit module key for AAT analytics generation (HRM-AAT-029 deferred to events agent). */
export const HR_TIME_AAT_AUDIT_MODULE_KEY = "hr.aat" as const;

/** Analytics query contract — organizationId is injected server-side after auth. */
export type HrTimeAatAnalyticsQueryContract = HrAatAnalyticsQuery;

/** Analytics response contract — serializable for governed surfaces and exports. */
export type HrTimeAatAnalyticsSnapshotContract = HrAatAnalyticsSnapshot;

/** API route contract identifiers. */
export const hrTimeAatApiRoutes = {
  analyticsQuery: "/api/hrm/absence-analytics/query",
  analyticsExport: "/api/hrm/absence-analytics/export",
} as const;

/** Requirement codes shipped in this slice (AAT-001 … AAT-005). */
export const HR_TIME_AAT_SHIPPED_REQUIREMENT_CODES = [
  "HRM-AAT-001",
  "HRM-AAT-002",
  "HRM-AAT-003",
  "HRM-AAT-004",
  "HRM-AAT-005",
] as const;

export type HrTimeAatShippedRequirementCode =
  (typeof HR_TIME_AAT_SHIPPED_REQUIREMENT_CODES)[number];
