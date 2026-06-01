import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../../hr-suite-integration/metadata";

export const hrIndustryFrmOverviewKpiSurfaceKey =
  "hr.industry.frm.overview.kpi" as const;
export const hrIndustryFrmWorksitesSurfaceKey =
  "hr.industry.frm.worksites.list" as const;
export const hrIndustryFrmAssignmentsSurfaceKey =
  "hr.industry.frm.assignments.list" as const;
export const hrIndustryFrmMobileAttendanceSurfaceKey =
  "hr.industry.frm.mobile-attendance.list" as const;
export const hrIndustryFrmAttendanceExceptionsSurfaceKey =
  "hr.industry.frm.attendance-exceptions.list" as const;
export const hrIndustryFrmOfflineSyncSurfaceKey =
  "hr.industry.frm.offline-sync.list" as const;
export const hrIndustryFrmSchedulesSurfaceKey =
  "hr.industry.frm.schedules.list" as const;
export const hrIndustryFrmTravelStatusesSurfaceKey =
  "hr.industry.frm.travel-statuses.list" as const;
export const hrIndustryFrmPerDiemRatesSurfaceKey =
  "hr.industry.frm.per-diem-rates.list" as const;
export const hrIndustryFrmPerDiemReferencesSurfaceKey =
  "hr.industry.frm.per-diem-references.list" as const;
export const hrIndustryFrmTravelComplianceSurfaceKey =
  "hr.industry.frm.travel-compliance.list" as const;
export const hrIndustryFrmSafetyConfirmationsSurfaceKey =
  "hr.industry.frm.safety-confirmations.list" as const;
export const hrIndustryFrmTeamAvailabilitySurfaceKey =
  "hr.industry.frm.team-availability.list" as const;
export const hrIndustryFrmNotificationsSurfaceKey =
  "hr.industry.frm.notifications.list" as const;
export const hrIndustryFrmAttendanceExportsSurfaceKey =
  "hr.industry.frm.attendance-exports.list" as const;
export const hrIndustryFrmOvertimeExportsSurfaceKey =
  "hr.industry.frm.overtime-exports.list" as const;
export const hrIndustryFrmPayrollExportsSurfaceKey =
  "hr.industry.frm.payroll-exports.list" as const;
export const hrIndustryFrmReportsSurfaceKey =
  "hr.industry.frm.reports.list" as const;
export const hrIndustryFrmAuditTrailSurfaceKey =
  "hr.industry.frm.audit-trail.list" as const;

export const HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrIndustryFrmWorksitesSurfaceKey,
      param: "frmWorksitesSearch",
      modelField: "worksitesSearch",
      label: "Search worksites",
      placeholder: "Search project sites, client sites, branches, zones, and remote locations",
      columns: [
        { id: "name", header: "Location", priority: "primary" },
        { id: "locationType", header: "Type" },
        { id: "legalEntity", header: "Legal entity" },
        { id: "region", header: "Region" },
        { id: "geofenceRef", header: "Geofence ref" },
        { id: "approvedRemote", header: "Remote" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmAssignmentsSurfaceKey,
      param: "frmAssignmentsSearch",
      modelField: "assignmentsSearch",
      label: "Search assignments",
      placeholder: "Search field worker assignments",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "worksiteName", header: "Worksite" },
        { id: "assignmentType", header: "Type" },
        { id: "managerDisplayName", header: "Manager" },
        { id: "departmentName", header: "Department" },
        { id: "dateRange", header: "Dates" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmMobileAttendanceSurfaceKey,
      param: "frmMobileAttendanceSearch",
      modelField: "mobileAttendanceSearch",
      label: "Search mobile attendance",
      placeholder: "Search mobile clock events",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "eventType", header: "Event" },
        { id: "capturedAt", header: "Captured" },
        { id: "gpsValidationRef", header: "GPS ref" },
        { id: "gpsValidationResult", header: "GPS result" },
        { id: "offline", header: "Offline" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmAttendanceExceptionsSurfaceKey,
      param: "frmAttendanceExceptionsSearch",
      modelField: "attendanceExceptionsSearch",
      label: "Search attendance exceptions",
      placeholder: "Search outside-site, missing, late, and incomplete attendance",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "exceptionType", header: "Exception" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
        { id: "detectedAt", header: "Detected" },
        { id: "correctionRef", header: "Correction" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmOfflineSyncSurfaceKey,
      param: "frmOfflineSyncSearch",
      modelField: "offlineSyncSearch",
      label: "Search offline sync",
      placeholder: "Search offline mobile reconciliation",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "attendanceEventId", header: "Attendance event" },
        { id: "capturedAt", header: "Captured" },
        { id: "syncedAt", header: "Synced" },
        { id: "status", header: "Status" },
        { id: "reconciliationNote", header: "Note" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmSchedulesSurfaceKey,
      param: "frmSchedulesSearch",
      modelField: "schedulesSearch",
      label: "Search schedules",
      placeholder: "Search schedules by employee, site, project, route, client, or date",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "worksiteName", header: "Site" },
        { id: "date", header: "Date" },
        { id: "projectCode", header: "Project" },
        { id: "routeCode", header: "Route" },
        { id: "clientName", header: "Client" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmTravelStatusesSurfaceKey,
      param: "frmTravelStatusesSearch",
      modelField: "travelStatusesSearch",
      label: "Search travel status",
      placeholder: "Search field travel status",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "travelType", header: "Travel type" },
        { id: "status", header: "Status" },
        { id: "destination", header: "Destination" },
        { id: "durationHours", header: "Duration" },
        { id: "approvalRef", header: "Approval" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmPerDiemRatesSurfaceKey,
      param: "frmPerDiemRatesSearch",
      modelField: "perDiemRatesSearch",
      label: "Search per diem rates",
      placeholder: "Search rate references",
      columns: [
        { id: "location", header: "Location", priority: "primary" },
        { id: "travelType", header: "Travel type" },
        { id: "allowanceType", header: "Allowance" },
        { id: "projectCode", header: "Project" },
        { id: "grade", header: "Grade" },
        { id: "amount", header: "Amount" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmPerDiemReferencesSurfaceKey,
      param: "frmPerDiemRefsSearch",
      modelField: "perDiemReferencesSearch",
      label: "Search per diem refs",
      placeholder: "Search allowance and per diem references",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "allowanceType", header: "Allowance" },
        { id: "eligible", header: "Eligible" },
        { id: "eligibleDays", header: "Days" },
        { id: "amount", header: "Amount" },
        { id: "approvalStatus", header: "Approval" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmTravelComplianceSurfaceKey,
      param: "frmTravelComplianceSearch",
      modelField: "travelComplianceSearch",
      label: "Search travel compliance",
      placeholder: "Search approval, restrictions, documents, insurance, and duty-of-care",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "complianceStatus", header: "Compliance" },
        { id: "approvalRef", header: "Approval" },
        { id: "requiredDocumentRef", header: "Documents" },
        { id: "insuranceRef", header: "Insurance" },
        { id: "dutyOfCareStatus", header: "Duty of care" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmSafetyConfirmationsSurfaceKey,
      param: "frmSafetySearch",
      modelField: "safetyConfirmationsSearch",
      label: "Search safety confirmations",
      placeholder: "Search arrival and departure confirmations",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "confirmationType", header: "Confirmation" },
        { id: "confirmedAt", header: "Confirmed" },
        { id: "emergencyContactRef", header: "Emergency contact" },
        { id: "gpsValidationRef", header: "GPS ref" },
      ],
    },
    {
      surfaceKey: hrIndustryFrmTeamAvailabilitySurfaceKey,
      param: "frmAvailabilitySearch",
      modelField: "teamAvailabilitySearch",
      label: "Search team availability",
      placeholder: "Search team availability",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "worksiteName", header: "Site" },
        { id: "assignmentStatus", header: "Assignment" },
        { id: "travelStatus", header: "Travel" },
        { id: "openExceptionCount", header: "Open exceptions" },
        { id: "availability", header: "Availability" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFrmNotificationsSurfaceKey,
      param: "frmNotificationsSearch",
      modelField: "notificationsSearch",
      label: "Search notifications",
      placeholder: "Search field workforce notifications",
      columns: [
        { id: "audience", header: "Audience", priority: "primary" },
        { id: "subject", header: "Subject" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
        { id: "targetRef", header: "Target" },
        { id: "sentAt", header: "Sent" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFrmAttendanceExportsSurfaceKey,
      param: "frmAttendanceExportsSearch",
      modelField: "attendanceExportsSearch",
      label: "Search attendance exports",
      placeholder: "Search Leave & Attendance refs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "workDate", header: "Work date" },
        { id: "outcome", header: "Outcome" },
        { id: "gpsValidationRef", header: "GPS ref" },
        { id: "leaveAttendanceRef", header: "LAM ref" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFrmOvertimeExportsSurfaceKey,
      param: "frmOvertimeExportsSearch",
      modelField: "overtimeExportsSearch",
      label: "Search overtime exports",
      placeholder: "Search Overtime Management refs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "workDate", header: "Work date" },
        { id: "actualHours", header: "Actual hours" },
        { id: "overtimeEligible", header: "OT eligible" },
        { id: "assignmentId", header: "Assignment" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFrmPayrollExportsSurfaceKey,
      param: "frmPayrollExportsSearch",
      modelField: "payrollExportsSearch",
      label: "Search payroll exports",
      placeholder: "Search payroll-relevant refs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "referenceType", header: "Type" },
        { id: "sourceRef", header: "Source" },
        { id: "amount", header: "Amount" },
        { id: "payrollPeriod", header: "Period" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFrmReportsSurfaceKey,
      param: "frmReportsSearch",
      modelField: "reportsSearch",
      label: "Search reports",
      placeholder: "Search field workforce report rows",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "assignmentCount", header: "Assignments" },
        { id: "activeWorkerCount", header: "Active" },
        { id: "exceptionCount", header: "Exceptions" },
        { id: "travelCount", header: "Travel" },
        { id: "perDiemAmount", header: "Per diem" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFrmAuditTrailSurfaceKey,
      param: "frmAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search audit trail",
      placeholder: "Search FRM audit events",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "targetType", header: "Target" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const HR_INDUSTRY_FRM_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY);

export type HrIndustryFrmListSurfaceKey =
  (typeof HR_INDUSTRY_FRM_LIST_SURFACE_KEYS)[number];

export const HR_INDUSTRY_FRM_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FRM_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FRM_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FRM_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FRM_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrIndustryFrmWorksitesSurfaceKey]: "erp-operational-table",
  [hrIndustryFrmAssignmentsSurfaceKey]: "erp-operational-table",
  [hrIndustryFrmMobileAttendanceSurfaceKey]: "erp-operational-table",
  [hrIndustryFrmAttendanceExceptionsSurfaceKey]: "erp-exception-table",
  [hrIndustryFrmOfflineSyncSurfaceKey]: "erp-exception-table",
  [hrIndustryFrmSchedulesSurfaceKey]: "erp-operational-table",
  [hrIndustryFrmTravelStatusesSurfaceKey]: "erp-operational-table",
  [hrIndustryFrmPerDiemRatesSurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmPerDiemReferencesSurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmTravelComplianceSurfaceKey]: "erp-exception-table",
  [hrIndustryFrmSafetyConfirmationsSurfaceKey]: "erp-operational-table",
  [hrIndustryFrmTeamAvailabilitySurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmNotificationsSurfaceKey]: "erp-exception-table",
  [hrIndustryFrmAttendanceExportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmOvertimeExportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmPayrollExportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmReportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryFrmAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrIndustryFrmListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrIndustryFrmListSurfaceKeys(): readonly HrIndustryFrmListSurfaceKey[] {
  return HR_INDUSTRY_FRM_LIST_SURFACE_KEYS;
}

export const hrIndustryFrmWorkbenchSurfaceKey = hrIndustryFrmAssignmentsSurfaceKey;
