/** ERP permission objects for SFT governed surfaces (HRM-SFT-029). */
export const hrTimeSftReadPermission = {
  module: "hr",
  object: "shift_schedule",
  function: "read",
} as const;

export const hrTimeSftWritePermission = {
  module: "hr",
  object: "shift_schedule",
  function: "write",
} as const;

export const hrTimeSftApprovePermission = {
  module: "hr",
  object: "shift_schedule",
  function: "approve",
} as const;

/** Governed surface keys (architecture registry). */
export const hrTimeSftTemplatesSurfaceKey =
  "hrm:shift-scheduling:templates" as const;
export const hrTimeSftRosterSurfaceKey = "hrm:shift-scheduling:roster" as const;
export const hrTimeSftRecurrenceRulesSurfaceKey =
  "hrm:shift-scheduling:recurrence-rules" as const;
export const hrTimeSftCoverageSurfaceKey =
  "hrm:shift-scheduling:coverage" as const;
export const hrTimeSftAvailabilitySurfaceKey =
  "hrm:shift-scheduling:availability" as const;
export const hrTimeSftMyScheduleChangesSurfaceKey =
  "hrm:shift-scheduling:my-schedule-changes" as const;
export const hrTimeSftSwapPendingSurfaceKey =
  "hrm:shift-scheduling:swap-pending" as const;
export const hrTimeSftMySwapsSurfaceKey =
  "hrm:shift-scheduling:my-swaps" as const;
export const hrTimeSftScheduleChangePendingSurfaceKey =
  "hrm:shift-scheduling:schedule-change-pending" as const;
export const hrTimeSftPublicationsSurfaceKey =
  "hrm:shift-scheduling:publications" as const;
export const hrTimeSftAttendanceReconcileSurfaceKey =
  "hrm:shift-scheduling:attendance-reconcile" as const;
export const hrTimeSftNotificationsSurfaceKey =
  "hr.time.sft.notifications.list" as const;
export const hrTimeSftPayrollRefsSurfaceKey =
  "hr.time.sft.payroll-refs.list" as const;
export const hrTimeSftReportDefinitionsSurfaceKey =
  "hr.time.sft.report-definitions.list" as const;
export const hrTimeSftAuditTrailSurfaceKey =
  "hr.time.sft.audit-trail.list" as const;

/** Route segment for shift scheduling workbench. */
export const HR_TIME_SFT_ROUTE_SEGMENT = "shift-scheduling" as const;

/** Audit module key for shift scheduling (HRM-SFT-030). */
export const HR_TIME_SFT_AUDIT_MODULE_KEY = "hr.sft" as const;

/** Integration slice requirement codes (SFT-025 … SFT-030). */
export const HR_TIME_SFT_INTEGRATION_REQUIREMENT_CODES = [
  "HRM-SFT-025",
  "HRM-SFT-026",
  "HRM-SFT-027",
  "HRM-SFT-028",
  "HRM-SFT-029",
  "HRM-SFT-030",
] as const;

export type HrTimeSftIntegrationRequirementCode =
  (typeof HR_TIME_SFT_INTEGRATION_REQUIREMENT_CODES)[number];

/** Architecture registry — all 11 governed workbench surface keys. */
export const HR_TIME_SFT_ARCHITECTURE_SURFACE_KEYS = [
  hrTimeSftTemplatesSurfaceKey,
  hrTimeSftRosterSurfaceKey,
  hrTimeSftRecurrenceRulesSurfaceKey,
  hrTimeSftCoverageSurfaceKey,
  hrTimeSftPublicationsSurfaceKey,
  hrTimeSftAttendanceReconcileSurfaceKey,
  hrTimeSftSwapPendingSurfaceKey,
  hrTimeSftMySwapsSurfaceKey,
  hrTimeSftMyScheduleChangesSurfaceKey,
  hrTimeSftAvailabilitySurfaceKey,
  hrTimeSftScheduleChangePendingSurfaceKey,
] as const;

export type HrTimeSftArchitectureSurfaceKey =
  (typeof HR_TIME_SFT_ARCHITECTURE_SURFACE_KEYS)[number];
