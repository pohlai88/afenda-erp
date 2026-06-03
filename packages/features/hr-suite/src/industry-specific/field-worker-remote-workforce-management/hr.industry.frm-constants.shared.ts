import type { AppCapability } from "@afenda/auth";

export const HR_FRM_READ_CAPABILITY = "hr.frm.read" satisfies AppCapability;
export const HR_FRM_WRITE_CAPABILITY = "hr.frm.write" satisfies AppCapability;
export const HR_FRM_APPROVE_CAPABILITY =
  "hr.frm.approve" satisfies AppCapability;
export const HR_FRM_AUDIT_READ_CAPABILITY =
  "hr.frm.audit.read" satisfies AppCapability;
export const HR_FRM_RESTRICTED_READ_CAPABILITY =
  "hr.frm.restricted.read" satisfies AppCapability;
export const HR_FRM_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.frm.integration.expose" satisfies AppCapability;

export const HR_FRM_LOCATION_TYPES = [
  "project_site",
  "client_site",
  "branch",
  "field_zone",
  "service_area",
  "approved_remote_location",
] as const;

export const HR_FRM_ASSIGNMENT_TYPES = [
  "temporary",
  "recurring",
  "project_based",
  "client_based",
  "travel_based",
] as const;

export const HR_FRM_ATTENDANCE_EVENT_TYPES = [
  "clock_in",
  "clock_out",
  "break_start",
  "break_end",
  "offline_clock_in",
  "offline_clock_out",
] as const;

export const HR_FRM_GPS_VALIDATION_RESULTS = [
  "inside_assigned_site",
  "inside_approved_remote_location",
  "outside_site",
  "low_accuracy",
  "not_available",
] as const;

export const HR_FRM_ATTENDANCE_EXCEPTION_TYPES = [
  "outside_site_check_in",
  "missing_check_in",
  "missing_checkout",
  "late_check_in",
  "incomplete_attendance",
] as const;

export const HR_FRM_OFFLINE_SYNC_STATUSES = [
  "captured",
  "queued",
  "synced",
  "reconciled",
  "rejected",
] as const;

export const HR_FRM_TRAVEL_TYPES = [
  "local_field_visit",
  "outstation_travel",
  "overnight_travel",
  "cross_border_travel",
  "temporary_relocation",
] as const;

export const HR_FRM_TRAVEL_STATUSES = [
  "not_required",
  "planned",
  "approved",
  "in_transit",
  "on_site",
  "completed",
  "non_compliant",
] as const;

export const HR_FRM_ALLOWANCE_TYPES = [
  "partial_day",
  "full_day",
  "overnight",
  "meal",
  "lodging",
  "travel",
] as const;

export const HR_FRM_COMPLIANCE_STATUSES = [
  "compliant",
  "approval_missing",
  "destination_restricted",
  "documents_missing",
  "insurance_missing",
  "duty_of_care_open",
  "non_compliant",
] as const;

export const HR_FRM_SAFETY_CONFIRMATION_TYPES = [
  "arrival_confirmation",
  "site_departure_confirmation",
] as const;

export const HR_FRM_NOTIFICATION_AUDIENCES = [
  "employee",
  "manager",
  "hr",
  "payroll",
  "compliance",
] as const;

export const HR_FRM_REPORT_GROUP_BY = [
  "employee",
  "manager",
  "department",
  "legal_entity",
  "site",
  "project",
  "client",
  "travel_type",
  "exception",
  "period",
] as const;

export type HrFrmLocationType = (typeof HR_FRM_LOCATION_TYPES)[number];
export type HrFrmAssignmentType = (typeof HR_FRM_ASSIGNMENT_TYPES)[number];
export type HrFrmAttendanceEventType =
  (typeof HR_FRM_ATTENDANCE_EVENT_TYPES)[number];
export type HrFrmGpsValidationResult =
  (typeof HR_FRM_GPS_VALIDATION_RESULTS)[number];
export type HrFrmAttendanceExceptionType =
  (typeof HR_FRM_ATTENDANCE_EXCEPTION_TYPES)[number];
export type HrFrmOfflineSyncStatus =
  (typeof HR_FRM_OFFLINE_SYNC_STATUSES)[number];
export type HrFrmTravelType = (typeof HR_FRM_TRAVEL_TYPES)[number];
export type HrFrmTravelStatus = (typeof HR_FRM_TRAVEL_STATUSES)[number];
export type HrFrmAllowanceType = (typeof HR_FRM_ALLOWANCE_TYPES)[number];
export type HrFrmComplianceStatus =
  (typeof HR_FRM_COMPLIANCE_STATUSES)[number];
export type HrFrmSafetyConfirmationType =
  (typeof HR_FRM_SAFETY_CONFIRMATION_TYPES)[number];
export type HrFrmNotificationAudience =
  (typeof HR_FRM_NOTIFICATION_AUDIENCES)[number];
export type HrFrmReportGroupBy = (typeof HR_FRM_REPORT_GROUP_BY)[number];

export const HR_INDUSTRY_FRM_READ_CAPABILITY = HR_FRM_READ_CAPABILITY;
export const HR_INDUSTRY_FRM_WRITE_CAPABILITY = HR_FRM_WRITE_CAPABILITY;
export const HR_INDUSTRY_FRM_APPROVE_CAPABILITY = HR_FRM_APPROVE_CAPABILITY;
export const HR_INDUSTRY_FRM_AUDIT_READ_CAPABILITY =
  HR_FRM_AUDIT_READ_CAPABILITY;
export const HR_INDUSTRY_FRM_RESTRICTED_READ_CAPABILITY =
  HR_FRM_RESTRICTED_READ_CAPABILITY;
export const HR_INDUSTRY_FRM_INTEGRATION_EXPOSE_CAPABILITY =
  HR_FRM_INTEGRATION_EXPOSE_CAPABILITY;
