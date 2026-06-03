import {
  hrTimeSftAttendanceReconcileSurfaceKey,
  hrTimeSftAuditTrailSurfaceKey,
  hrTimeSftAvailabilitySurfaceKey,
  hrTimeSftCoverageSurfaceKey,
  hrTimeSftMyScheduleChangesSurfaceKey,
  hrTimeSftMySwapsSurfaceKey,
  hrTimeSftNotificationsSurfaceKey,
  hrTimeSftPayrollRefsSurfaceKey,
  hrTimeSftPublicationsSurfaceKey,
  hrTimeSftRecurrenceRulesSurfaceKey,
  hrTimeSftReportDefinitionsSurfaceKey,
  hrTimeSftRosterSurfaceKey,
  hrTimeSftScheduleChangePendingSurfaceKey,
  hrTimeSftSwapPendingSurfaceKey,
  hrTimeSftTemplatesSurfaceKey,
} from "./hr.time.sft.contract";

export {
  hrTimeSftTemplatesSurfaceKey,
  hrTimeSftRosterSurfaceKey,
  hrTimeSftRecurrenceRulesSurfaceKey,
  hrTimeSftCoverageSurfaceKey,
  hrTimeSftAvailabilitySurfaceKey,
  hrTimeSftMyScheduleChangesSurfaceKey,
  hrTimeSftSwapPendingSurfaceKey,
  hrTimeSftMySwapsSurfaceKey,
  hrTimeSftScheduleChangePendingSurfaceKey,
  hrTimeSftPublicationsSurfaceKey,
  hrTimeSftAttendanceReconcileSurfaceKey,
};

export const hrSftTemplatesSearchParam = "sftTemplatesSearch";
export const hrSftRosterSearchParam = "sftRosterSearch";
export const hrSftRecurrenceRulesSearchParam = "sftRecurrenceRulesSearch";
export const hrSftCoverageSearchParam = "sftCoverageSearch";
export const hrSftAvailabilitySearchParam = "sftAvailabilitySearch";
export const hrSftMyScheduleChangesSearchParam = "sftMyScheduleChangesSearch";
export const hrSftSwapPendingSearchParam = "sftSwapPendingSearch";
export const hrSftMySwapsSearchParam = "sftMySwapsSearch";
export const hrSftScheduleChangePendingSearchParam =
  "sftScheduleChangePendingSearch";

export const hrSftPublicationsSurfaceKey = hrTimeSftPublicationsSurfaceKey;
export const hrSftNotificationsSurfaceKey = hrTimeSftNotificationsSurfaceKey;
export const hrSftAttendanceReconcileSurfaceKey =
  hrTimeSftAttendanceReconcileSurfaceKey;
export const hrSftPayrollRefsSurfaceKey = hrTimeSftPayrollRefsSurfaceKey;
export const hrSftReportDefinitionsSurfaceKey =
  hrTimeSftReportDefinitionsSurfaceKey;
export const hrSftAuditTrailSurfaceKey = hrTimeSftAuditTrailSurfaceKey;

export const hrSftPublicationsSearchParam = "sftPublicationsSearch";
export const hrSftNotificationsSearchParam = "sftNotificationsSearch";
export const hrSftAttendanceReconcileSearchParam = "sftAttendanceReconcileSearch";
export const hrSftPayrollRefsSearchParam = "sftPayrollRefsSearch";
export const hrSftReportDefinitionsSearchParam = "sftReportDefinitionsSearch";
export const hrSftAuditTrailSearchParam = "sftAuditTrailSearch";

export const hrSftTemplatesColumnsId = "hr.time.sft.templates.columns";
export const hrSftRosterColumnsId = "hr.time.sft.roster.columns";
export const hrSftRecurrenceRulesColumnsId = "hr.time.sft.recurrence-rules.columns";
export const hrSftCoverageColumnsId = "hr.time.sft.coverage.columns";
export const hrSftAvailabilityColumnsId = "hr.time.sft.availability.columns";
export const hrSftMyScheduleChangesColumnsId =
  "hr.time.sft.my-schedule-changes.columns";
export const hrSftSwapPendingColumnsId = "hr.time.sft.swap-pending.columns";
export const hrSftMySwapsColumnsId = "hr.time.sft.my-swaps.columns";
export const hrSftScheduleChangePendingColumnsId =
  "hr.time.sft.schedule-change-pending.columns";
export const hrSftPublicationsColumnsId = "hr.time.sft.publications.columns";
export const hrSftNotificationsColumnsId = "hr.time.sft.notifications.columns";
export const hrSftAttendanceReconcileColumnsId =
  "hr.time.sft.attendance-reconcile.columns";
export const hrSftPayrollRefsColumnsId = "hr.time.sft.payroll-refs.columns";
export const hrSftReportDefinitionsColumnsId =
  "hr.time.sft.report-definitions.columns";
export const hrSftAuditTrailColumnsId = "hr.time.sft.audit-trail.columns";

/** Architecture registry — 11 governed workbench surface keys. */
export const HR_SFT_ARCHITECTURE_SURFACE_KEYS = [
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

export type HrSftArchitectureSurfaceKey =
  (typeof HR_SFT_ARCHITECTURE_SURFACE_KEYS)[number];

/** All list surfaces rendered on the org workbench (architecture + integration). */
export const HR_SFT_LIST_SURFACE_KEYS = [
  ...HR_SFT_ARCHITECTURE_SURFACE_KEYS,
  hrSftNotificationsSurfaceKey,
  hrSftPayrollRefsSurfaceKey,
  hrSftReportDefinitionsSurfaceKey,
  hrSftAuditTrailSurfaceKey,
] as const;

export type HrSftListSurfaceKey = (typeof HR_SFT_LIST_SURFACE_KEYS)[number];

export const HR_SFT_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrSftAuditTrailSurfaceKey,
  hrSftPayrollRefsSurfaceKey,
] as const;

export const HR_SFT_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrTimeSftTemplatesSurfaceKey]: hrSftTemplatesSearchParam,
  [hrTimeSftRosterSurfaceKey]: hrSftRosterSearchParam,
  [hrTimeSftRecurrenceRulesSurfaceKey]: hrSftRecurrenceRulesSearchParam,
  [hrTimeSftCoverageSurfaceKey]: hrSftCoverageSearchParam,
  [hrTimeSftAvailabilitySurfaceKey]: hrSftAvailabilitySearchParam,
  [hrTimeSftMyScheduleChangesSurfaceKey]: hrSftMyScheduleChangesSearchParam,
  [hrTimeSftSwapPendingSurfaceKey]: hrSftSwapPendingSearchParam,
  [hrTimeSftMySwapsSurfaceKey]: hrSftMySwapsSearchParam,
  [hrTimeSftScheduleChangePendingSurfaceKey]:
    hrSftScheduleChangePendingSearchParam,
  [hrSftPublicationsSurfaceKey]: hrSftPublicationsSearchParam,
  [hrSftNotificationsSurfaceKey]: hrSftNotificationsSearchParam,
  [hrSftAttendanceReconcileSurfaceKey]: hrSftAttendanceReconcileSearchParam,
  [hrSftPayrollRefsSurfaceKey]: hrSftPayrollRefsSearchParam,
  [hrSftReportDefinitionsSurfaceKey]: hrSftReportDefinitionsSearchParam,
  [hrSftAuditTrailSurfaceKey]: hrSftAuditTrailSearchParam,
} as const;

export const HR_SFT_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrSftTemplatesSearchParam]: "templatesSearch",
  [hrSftRosterSearchParam]: "rosterSearch",
  [hrSftRecurrenceRulesSearchParam]: "recurrenceRulesSearch",
  [hrSftCoverageSearchParam]: "coverageSearch",
  [hrSftAvailabilitySearchParam]: "availabilitySearch",
  [hrSftMyScheduleChangesSearchParam]: "myScheduleChangesSearch",
  [hrSftSwapPendingSearchParam]: "swapPendingSearch",
  [hrSftMySwapsSearchParam]: "mySwapsSearch",
  [hrSftScheduleChangePendingSearchParam]: "scheduleChangePendingSearch",
  [hrSftPublicationsSearchParam]: "publicationsSearch",
  [hrSftNotificationsSearchParam]: "notificationsSearch",
  [hrSftAttendanceReconcileSearchParam]: "attendanceReconcileSearch",
  [hrSftPayrollRefsSearchParam]: "payrollRefsSearch",
  [hrSftReportDefinitionsSearchParam]: "reportDefinitionsSearch",
  [hrSftAuditTrailSearchParam]: "auditTrailSearch",
} as const;

export const HR_SFT_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrTimeSftTemplatesSurfaceKey]: hrSftTemplatesColumnsId,
  [hrTimeSftRosterSurfaceKey]: hrSftRosterColumnsId,
  [hrTimeSftRecurrenceRulesSurfaceKey]: hrSftRecurrenceRulesColumnsId,
  [hrTimeSftCoverageSurfaceKey]: hrSftCoverageColumnsId,
  [hrTimeSftAvailabilitySurfaceKey]: hrSftAvailabilityColumnsId,
  [hrTimeSftMyScheduleChangesSurfaceKey]: hrSftMyScheduleChangesColumnsId,
  [hrTimeSftSwapPendingSurfaceKey]: hrSftSwapPendingColumnsId,
  [hrTimeSftMySwapsSurfaceKey]: hrSftMySwapsColumnsId,
  [hrTimeSftScheduleChangePendingSurfaceKey]:
    hrSftScheduleChangePendingColumnsId,
  [hrSftPublicationsSurfaceKey]: hrSftPublicationsColumnsId,
  [hrSftNotificationsSurfaceKey]: hrSftNotificationsColumnsId,
  [hrSftAttendanceReconcileSurfaceKey]: hrSftAttendanceReconcileColumnsId,
  [hrSftPayrollRefsSurfaceKey]: hrSftPayrollRefsColumnsId,
  [hrSftReportDefinitionsSurfaceKey]: hrSftReportDefinitionsColumnsId,
  [hrSftAuditTrailSurfaceKey]: hrSftAuditTrailColumnsId,
} as const;

export function getHrSftListSurfaceKeys(): readonly HrSftListSurfaceKey[] {
  return HR_SFT_LIST_SURFACE_KEYS;
}

export function getHrSftArchitectureSurfaceKeys(): readonly HrSftArchitectureSurfaceKey[] {
  return HR_SFT_ARCHITECTURE_SURFACE_KEYS;
}
