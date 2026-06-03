import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../employee-management/compliance-regulatory-tracking/metadata";

export const hrIndustryRwsOverviewKpiSurfaceKey =
  "hr.industry.rws.overview.kpi" as const;
export const hrIndustryRwsSchedulesSurfaceKey =
  "hr.industry.rws.schedules.list" as const;
export const hrIndustryRwsAssignmentsSurfaceKey =
  "hr.industry.rws.assignments.list" as const;
export const hrIndustryRwsAvailabilitySurfaceKey =
  "hr.industry.rws.availability.list" as const;
export const hrIndustryRwsCoverageSurfaceKey =
  "hr.industry.rws.coverage.list" as const;
export const hrIndustryRwsOpenShiftsSurfaceKey =
  "hr.industry.rws.open-shifts.list" as const;
export const hrIndustryRwsShiftSwapsSurfaceKey =
  "hr.industry.rws.shift-swaps.list" as const;
export const hrIndustryRwsDemandReferencesSurfaceKey =
  "hr.industry.rws.demand-references.list" as const;
export const hrIndustryRwsLaborBudgetsSurfaceKey =
  "hr.industry.rws.labor-budgets.list" as const;
export const hrIndustryRwsComplianceFindingsSurfaceKey =
  "hr.industry.rws.compliance-findings.list" as const;
export const hrIndustryRwsNotificationsSurfaceKey =
  "hr.industry.rws.notifications.list" as const;
export const hrIndustryRwsAttendanceComparisonSurfaceKey =
  "hr.industry.rws.attendance-comparison.list" as const;
export const hrIndustryRwsPayrollReferencesSurfaceKey =
  "hr.industry.rws.payroll-references.list" as const;
export const hrIndustryRwsReportsSurfaceKey =
  "hr.industry.rws.reports.list" as const;
export const hrIndustryRwsIntegrationExposuresSurfaceKey =
  "hr.industry.rws.integration-exposures.list" as const;
export const hrIndustryRwsAuditTrailSurfaceKey =
  "hr.industry.rws.audit-trail.list" as const;

export const HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrIndustryRwsSchedulesSurfaceKey,
      param: "rwsSchedulesSearch",
      modelField: "schedulesSearch",
      label: "Search retail schedules",
      placeholder:
        "Search store, branch, department, team, role, manager, period, campaign, season, budget status, and publication status",
      columns: [
        { id: "schedule", header: "Schedule", priority: "primary" },
        { id: "scope", header: "Scope" },
        { id: "manager", header: "Manager" },
        { id: "period", header: "Period" },
        { id: "hours", header: "Hours" },
        { id: "laborCost", header: "Labor cost" },
        { id: "flags", header: "Flags" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryRwsAssignmentsSurfaceKey,
      param: "rwsAssignmentsSearch",
      modelField: "assignmentsSearch",
      label: "Search shift assignments",
      placeholder:
        "Search employees, worker type, store, department, role, shift type, date, availability, skills, compliance, and payroll status",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "storeDepartment", header: "Store / department" },
        { id: "roleShift", header: "Role / shift" },
        { id: "shiftWindow", header: "Shift window" },
        { id: "workerType", header: "Worker type" },
        { id: "availability", header: "Availability" },
        { id: "skillStatus", header: "Skill" },
        { id: "compliance", header: "Compliance" },
      ],
    },
    {
      surfaceKey: hrIndustryRwsAvailabilitySurfaceKey,
      param: "rwsAvailabilitySearch",
      modelField: "availabilitySearch",
      label: "Search availability",
      placeholder:
        "Search employee availability, unavailable dates, blocked dates, preferred shifts, time windows, and maximum hours",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "availability", header: "Availability" },
        { id: "blockedDate", header: "Blocked date" },
        { id: "reason", header: "Reason" },
        { id: "maxHours", header: "Max hours" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsCoverageSurfaceKey,
      param: "rwsCoverageSearch",
      modelField: "coverageSearch",
      label: "Search coverage",
      placeholder:
        "Search coverage by store, department, role, date, hour window, required count, scheduled count, understaffed, and overstaffed flags",
      columns: [
        { id: "coverage", header: "Coverage", priority: "primary" },
        { id: "storeDepartment", header: "Store / department" },
        { id: "role", header: "Role" },
        { id: "window", header: "Window" },
        { id: "required", header: "Required" },
        { id: "scheduled", header: "Scheduled" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsOpenShiftsSurfaceKey,
      param: "rwsOpenShiftsSearch",
      modelField: "openShiftsSearch",
      label: "Search open shifts",
      placeholder:
        "Search posted shifts, employee pickups, approval requirements, eligible employees, stores, departments, roles, and status",
      columns: [
        { id: "openShift", header: "Open shift", priority: "primary" },
        { id: "storeDepartment", header: "Store / department" },
        { id: "role", header: "Role" },
        { id: "shiftWindow", header: "Shift window" },
        { id: "approval", header: "Approval" },
        { id: "claimant", header: "Claimant" },
        { id: "eligibleCount", header: "Eligible" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryRwsShiftSwapsSurfaceKey,
      param: "rwsShiftSwapsSearch",
      modelField: "shiftSwapsSearch",
      label: "Search shift swaps",
      placeholder:
        "Search swap requests, employees, replacement employees, validation flags, workflow references, decisions, reasons, and status",
      columns: [
        { id: "swap", header: "Swap", priority: "primary" },
        { id: "requester", header: "Requester" },
        { id: "replacement", header: "Replacement" },
        { id: "shiftRefs", header: "Shift refs" },
        { id: "validation", header: "Validation" },
        { id: "workflow", header: "Workflow" },
        { id: "reason", header: "Reason" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryRwsDemandReferencesSurfaceKey,
      param: "rwsDemandSearch",
      modelField: "demandReferencesSearch",
      label: "Search demand references",
      placeholder:
        "Search sales volume, footfall, promotions, holidays, store forecasts, required hours, and forecast references",
      columns: [
        { id: "demand", header: "Demand", priority: "primary" },
        { id: "store", header: "Store" },
        { id: "period", header: "Period" },
        { id: "source", header: "Source" },
        { id: "demandValue", header: "Demand" },
        { id: "requiredHours", header: "Required hours" },
        { id: "reference", header: "Reference" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsLaborBudgetsSurfaceKey,
      param: "rwsLaborBudgetsSearch",
      modelField: "laborBudgetsSearch",
      label: "Search labor budgets",
      placeholder:
        "Search scheduled hours, labor cost, approved labor budget, variance, over-budget warnings, and review status",
      columns: [
        { id: "budget", header: "Budget", priority: "primary" },
        { id: "storeDepartment", header: "Store / department" },
        { id: "scheduledHours", header: "Hours" },
        { id: "scheduledLaborCost", header: "Labor cost" },
        { id: "budgetAmount", header: "Budget" },
        { id: "variance", header: "Variance" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsComplianceFindingsSurfaceKey,
      param: "rwsComplianceSearch",
      modelField: "complianceFindingsSearch",
      label: "Search scheduling compliance",
      placeholder:
        "Search overtime, max hours, rest periods, breaks, minor or student restrictions, holiday, weekend, late-night, and peak-season rules",
      columns: [
        { id: "finding", header: "Finding", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "rule", header: "Rule" },
        { id: "severity", header: "Severity" },
        { id: "override", header: "Override" },
        { id: "reason", header: "Reason" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsNotificationsSurfaceKey,
      param: "rwsNotificationsSearch",
      modelField: "notificationsSearch",
      label: "Search notifications",
      placeholder:
        "Search published schedules, changes, open shifts, swap requests, approvals, rejections, cancellations, recipients, and status",
      columns: [
        { id: "notification", header: "Notification", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "target", header: "Target" },
        { id: "recipients", header: "Recipients" },
        { id: "generatedAt", header: "Generated" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsAttendanceComparisonSurfaceKey,
      param: "rwsAttendanceSearch",
      modelField: "attendanceComparisonSearch",
      label: "Search attendance comparisons",
      placeholder:
        "Search scheduled hours, actual hours, variance, attendance outcome references, employees, and status",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "scheduledHours", header: "Scheduled" },
        { id: "actualHours", header: "Actual" },
        { id: "variance", header: "Variance" },
        { id: "attendanceOutcomeRef", header: "Attendance outcome" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsPayrollReferencesSurfaceKey,
      param: "rwsPayrollSearch",
      modelField: "payrollReferencesSearch",
      label: "Search payroll references",
      placeholder:
        "Search scheduled hours, actual attendance references, shift premium references, holiday work references, and payroll handoff status",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "scheduledHours", header: "Scheduled" },
        { id: "actualHoursRef", header: "Actual ref" },
        { id: "shiftPremiumRef", header: "Premium ref" },
        { id: "holidayWorkRef", header: "Holiday ref" },
        { id: "attendanceOutcomeRef", header: "Attendance outcome" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsReportsSurfaceKey,
      param: "rwsReportsSearch",
      modelField: "reportsSearch",
      label: "Search workforce reports",
      placeholder:
        "Search reports by store, department, employee, manager, role, shift, labor cost, budget variance, coverage gap, and period",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "scheduleCount", header: "Schedules" },
        { id: "assignmentCount", header: "Assignments" },
        { id: "scheduledHours", header: "Hours" },
        { id: "scheduledLaborCost", header: "Labor cost" },
        { id: "budgetVariance", header: "Variance" },
        { id: "coverageGapCount", header: "Gaps" },
        { id: "riskFindings", header: "Risks" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsIntegrationExposuresSurfaceKey,
      param: "rwsIntegrationsSearch",
      modelField: "integrationExposuresSearch",
      label: "Search integration exposures",
      placeholder:
        "Search attendance outcomes, payroll processing, time clock, overtime, document, retail operations, and workforce planning references",
      columns: [
        { id: "integrationTarget", header: "Target", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "sourceRef", header: "Source" },
        { id: "summary", header: "Summary" },
        { id: "exposedAt", header: "Exposed" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryRwsAuditTrailSurfaceKey,
      param: "rwsAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search audit trail",
      placeholder:
        "Search schedule creation, assignment, publication, changes, open shifts, pickup, swaps, approvals, rejections, overrides, budget warnings, and payroll references",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "targetType", header: "Target" },
        { id: "employeeId", header: "Employee" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const HR_INDUSTRY_RWS_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY);

export type HrIndustryRwsListSurfaceKey =
  (typeof HR_INDUSTRY_RWS_LIST_SURFACE_KEYS)[number];

export const HR_INDUSTRY_RWS_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_RWS_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_RWS_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_RWS_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_RWS_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrIndustryRwsSchedulesSurfaceKey]: "erp-operational-table",
  [hrIndustryRwsAssignmentsSurfaceKey]: "erp-exception-table",
  [hrIndustryRwsAvailabilitySurfaceKey]: "erp-operational-table",
  [hrIndustryRwsCoverageSurfaceKey]: "erp-exception-table",
  [hrIndustryRwsOpenShiftsSurfaceKey]: "erp-operational-table",
  [hrIndustryRwsShiftSwapsSurfaceKey]: "erp-exception-table",
  [hrIndustryRwsDemandReferencesSurfaceKey]: "erp-analytical-table",
  [hrIndustryRwsLaborBudgetsSurfaceKey]: "erp-analytical-table",
  [hrIndustryRwsComplianceFindingsSurfaceKey]: "erp-exception-table",
  [hrIndustryRwsNotificationsSurfaceKey]: "erp-operational-table",
  [hrIndustryRwsAttendanceComparisonSurfaceKey]: "erp-analytical-table",
  [hrIndustryRwsPayrollReferencesSurfaceKey]: "erp-analytical-table",
  [hrIndustryRwsReportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryRwsIntegrationExposuresSurfaceKey]: "erp-analytical-table",
  [hrIndustryRwsAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrIndustryRwsListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrIndustryRwsListSurfaceKeys(): readonly HrIndustryRwsListSurfaceKey[] {
  return HR_INDUSTRY_RWS_LIST_SURFACE_KEYS;
}

export const hrIndustryRwsWorkbenchSurfaceKey =
  hrIndustryRwsAssignmentsSurfaceKey;
