import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../../hr-suite-integration/metadata";

export const hrWorkforceEssOverviewKpiSurfaceKey =
  "hr.workforce.ess.overview.kpi" as const;
export const hrWorkforceEssProfileSummarySurfaceKey =
  "hr.workforce.ess.profile-summary.list" as const;
export const hrWorkforceEssProfileUpdatesSurfaceKey =
  "hr.workforce.ess.profile-updates.list" as const;
export const hrWorkforceEssLeaveBalancesSurfaceKey =
  "hr.workforce.ess.leave-balances.list" as const;
export const hrWorkforceEssLeaveRequestsSurfaceKey =
  "hr.workforce.ess.leave-requests.list" as const;
export const hrWorkforceEssPayDocumentsSurfaceKey =
  "hr.workforce.ess.pay-documents.list" as const;
export const hrWorkforceEssAttendanceSurfaceKey =
  "hr.workforce.ess.attendance.list" as const;
export const hrWorkforceEssShiftSchedulesSurfaceKey =
  "hr.workforce.ess.shift-schedules.list" as const;
export const hrWorkforceEssExpenseClaimsSurfaceKey =
  "hr.workforce.ess.expense-claims.list" as const;
export const hrWorkforceEssDocumentsSurfaceKey =
  "hr.workforce.ess.documents.list" as const;
export const hrWorkforceEssResourcesSurfaceKey =
  "hr.workforce.ess.resources.list" as const;
export const hrWorkforceEssAcknowledgementsSurfaceKey =
  "hr.workforce.ess.acknowledgements.list" as const;
export const hrWorkforceEssAssignedTasksSurfaceKey =
  "hr.workforce.ess.assigned-tasks.list" as const;
export const hrWorkforceEssRequestTrackerSurfaceKey =
  "hr.workforce.ess.request-tracker.list" as const;
export const hrWorkforceEssNotificationsSurfaceKey =
  "hr.workforce.ess.notifications.list" as const;
export const hrWorkforceEssApprovalInboxSurfaceKey =
  "hr.workforce.ess.approval-inbox.list" as const;
export const hrWorkforceEssBenefitsSurfaceKey =
  "hr.workforce.ess.benefits.list" as const;
export const hrWorkforceEssTrainingSurfaceKey =
  "hr.workforce.ess.training.list" as const;
export const hrWorkforceEssOnboardingTasksSurfaceKey =
  "hr.workforce.ess.onboarding-tasks.list" as const;
export const hrWorkforceEssOffboardingTasksSurfaceKey =
  "hr.workforce.ess.offboarding-tasks.list" as const;
export const hrWorkforceEssConsentRecordsSurfaceKey =
  "hr.workforce.ess.consent-records.list" as const;
export const hrWorkforceEssAccessLogSurfaceKey =
  "hr.workforce.ess.access-log.list" as const;
export const hrWorkforceEssReportsSurfaceKey =
  "hr.workforce.ess.reports.list" as const;
export const hrWorkforceEssAuditTrailSurfaceKey =
  "hr.workforce.ess.audit-trail.list" as const;

export const HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrWorkforceEssProfileSummarySurfaceKey,
      param: "hrWorkforceEssProfileSearch",
      modelField: "profileSearch",
      label: "Search employee profile",
      placeholder:
        "Search employee number, name, department, manager, location, status, locale, or privacy tier",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "employeeNumber", header: "Employee no." },
        { id: "jobTitle", header: "Job title" },
        { id: "department", header: "Department" },
        { id: "manager", header: "Manager" },
        { id: "location", header: "Location" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssProfileUpdatesSurfaceKey,
      param: "hrWorkforceEssProfileUpdatesSearch",
      modelField: "profileUpdatesSearch",
      label: "Search profile update requests",
      placeholder:
        "Search request reference, employee, field group, sensitivity, status, approver, rejection reason, or guidance",
      columns: [
        { id: "request", header: "Request", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "fieldGroup", header: "Field group" },
        { id: "sensitive", header: "Sensitive" },
        { id: "status", header: "Status" },
        { id: "submittedAt", header: "Submitted" },
        { id: "guidance", header: "Guidance" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssLeaveBalancesSurfaceKey,
      param: "hrWorkforceEssLeaveBalancesSearch",
      modelField: "leaveBalancesSearch",
      label: "Search leave balances",
      placeholder:
        "Search employee, leave type, period, entitlement, used, pending, or available balance",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "leaveType", header: "Leave type" },
        { id: "period", header: "Period" },
        { id: "entitlement", header: "Entitlement" },
        { id: "used", header: "Used" },
        { id: "pending", header: "Pending" },
        { id: "available", header: "Available" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssLeaveRequestsSurfaceKey,
      param: "hrWorkforceEssLeaveRequestsSearch",
      modelField: "leaveRequestsSearch",
      label: "Search leave requests",
      placeholder:
        "Search request reference, employee, leave type, date range, status, approver, rejection reason, or guidance",
      columns: [
        { id: "request", header: "Request", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "leaveType", header: "Leave type" },
        { id: "dateRange", header: "Dates" },
        { id: "days", header: "Days" },
        { id: "status", header: "Status" },
        { id: "guidance", header: "Guidance" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssPayDocumentsSurfaceKey,
      param: "hrWorkforceEssPayDocumentsSearch",
      modelField: "payDocumentsSearch",
      label: "Search pay documents",
      placeholder:
        "Search document reference, employee, type, period, pay amounts, authorization, privacy tier, or availability",
      columns: [
        { id: "document", header: "Document", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "type", header: "Type" },
        { id: "period", header: "Period" },
        { id: "grossPay", header: "Gross" },
        { id: "netPay", header: "Net" },
        { id: "authorized", header: "Authorized" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssAttendanceSurfaceKey,
      param: "hrWorkforceEssAttendanceSearch",
      modelField: "attendanceSearch",
      label: "Search attendance records",
      placeholder:
        "Search employee, work date, clock times, status, lateness, or overtime",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "workDate", header: "Date" },
        { id: "clockIn", header: "Clock in" },
        { id: "clockOut", header: "Clock out" },
        { id: "status", header: "Status" },
        { id: "lateness", header: "Late" },
        { id: "overtime", header: "Overtime" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssShiftSchedulesSurfaceKey,
      param: "hrWorkforceEssShiftSchedulesSearch",
      modelField: "shiftSchedulesSearch",
      label: "Search shift schedules",
      placeholder:
        "Search employee, schedule date, shift name, start, end, or location",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "scheduleDate", header: "Date" },
        { id: "shift", header: "Shift" },
        { id: "startsAt", header: "Starts" },
        { id: "endsAt", header: "Ends" },
        { id: "location", header: "Location" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssExpenseClaimsSurfaceKey,
      param: "hrWorkforceEssClaimsSearch",
      modelField: "claimsSearch",
      label: "Search expense claims",
      placeholder:
        "Search claim reference, employee, claim type, amount, status, receipts, reimbursement, or correction guidance",
      columns: [
        { id: "claim", header: "Claim", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "type", header: "Type" },
        { id: "amount", header: "Amount" },
        { id: "status", header: "Status" },
        { id: "receipts", header: "Receipts" },
        { id: "guidance", header: "Guidance" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssDocumentsSurfaceKey,
      param: "hrWorkforceEssDocumentsSearch",
      modelField: "documentsSearch",
      label: "Search HR documents",
      placeholder:
        "Search document reference, employee, document type, title, authorization, privacy tier, expiry, or download date",
      columns: [
        { id: "document", header: "Document", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "type", header: "Type" },
        { id: "authorized", header: "Authorized" },
        { id: "privacy", header: "Privacy" },
        { id: "expiresAt", header: "Expires" },
        { id: "downloadedAt", header: "Downloaded" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssResourcesSurfaceKey,
      param: "hrWorkforceEssResourcesSearch",
      modelField: "resourcesSearch",
      label: "Search HR resources",
      placeholder:
        "Search handbook, policy, FAQ, benefits, forms, notices, locale, audience, or effective date",
      columns: [
        { id: "resource", header: "Resource", priority: "primary" },
        { id: "type", header: "Type" },
        { id: "locale", header: "Locale" },
        { id: "audience", header: "Audience" },
        { id: "effectiveAt", header: "Effective" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssAcknowledgementsSurfaceKey,
      param: "hrWorkforceEssAcknowledgementsSearch",
      modelField: "acknowledgementsSearch",
      label: "Search acknowledgements",
      placeholder:
        "Search employee, notice reference, title, status, due date, or acknowledgement date",
      columns: [
        { id: "notice", header: "Notice", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "status", header: "Status" },
        { id: "dueAt", header: "Due" },
        { id: "acknowledgedAt", header: "Acknowledged" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssAssignedTasksSurfaceKey,
      param: "hrWorkforceEssTasksSearch",
      modelField: "tasksSearch",
      label: "Search assigned HR tasks",
      placeholder:
        "Search employee, task type, title, status, due date, or completion date",
      columns: [
        { id: "task", header: "Task", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "type", header: "Type" },
        { id: "status", header: "Status" },
        { id: "dueAt", header: "Due" },
        { id: "completedAt", header: "Completed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssRequestTrackerSurfaceKey,
      param: "hrWorkforceEssRequestTrackerSearch",
      modelField: "requestTrackerSearch",
      label: "Search request tracker",
      placeholder:
        "Search request reference, employee, request type, status, timestamps, rejection reason, or correction guidance",
      columns: [
        { id: "request", header: "Request", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "type", header: "Type" },
        { id: "status", header: "Status" },
        { id: "submittedAt", header: "Submitted" },
        { id: "updatedAt", header: "Updated" },
        { id: "guidance", header: "Guidance" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssNotificationsSurfaceKey,
      param: "hrWorkforceEssNotificationsSearch",
      modelField: "notificationsSearch",
      label: "Search notifications",
      placeholder:
        "Search employee, event, status, channel, message, sent date, or read date",
      columns: [
        { id: "event", header: "Event", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "status", header: "Status" },
        { id: "channel", header: "Channel" },
        { id: "message", header: "Message" },
        { id: "sentAt", header: "Sent" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssApprovalInboxSurfaceKey,
      param: "hrWorkforceEssApprovalsSearch",
      modelField: "approvalsSearch",
      label: "Search manager approvals",
      placeholder:
        "Search approval type, target, employee, approver, status, submission date, decision, or reason",
      columns: [
        { id: "approval", header: "Approval", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "approver", header: "Approver" },
        { id: "status", header: "Status" },
        { id: "submittedAt", header: "Submitted" },
        { id: "reason", header: "Reason" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssBenefitsSurfaceKey,
      param: "hrWorkforceEssBenefitsSearch",
      modelField: "benefitsSearch",
      label: "Search benefits",
      placeholder:
        "Search employee, benefit name, coverage, dependents, status, or effective date",
      columns: [
        { id: "benefit", header: "Benefit", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "coverage", header: "Coverage" },
        { id: "dependents", header: "Dependents" },
        { id: "status", header: "Status" },
        { id: "effectiveAt", header: "Effective" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssTrainingSurfaceKey,
      param: "hrWorkforceEssTrainingSearch",
      modelField: "trainingSearch",
      label: "Search training",
      placeholder:
        "Search employee, course, status, requirement, certificate, due date, or completion date",
      columns: [
        { id: "course", header: "Course", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "required", header: "Required" },
        { id: "status", header: "Status" },
        { id: "certificate", header: "Certificate" },
        { id: "dueAt", header: "Due" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssOnboardingTasksSurfaceKey,
      param: "hrWorkforceEssOnboardingSearch",
      modelField: "onboardingSearch",
      label: "Search onboarding tasks",
      placeholder:
        "Search employee, onboarding title, status, due date, or completion date",
      columns: [
        { id: "task", header: "Onboarding task", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "status", header: "Status" },
        { id: "dueAt", header: "Due" },
        { id: "completedAt", header: "Completed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssOffboardingTasksSurfaceKey,
      param: "hrWorkforceEssOffboardingSearch",
      modelField: "offboardingSearch",
      label: "Search offboarding tasks",
      placeholder:
        "Search employee, offboarding title, clearance owner, status, due date, or completion date",
      columns: [
        { id: "task", header: "Offboarding task", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "clearanceOwner", header: "Clearance owner" },
        { id: "status", header: "Status" },
        { id: "dueAt", header: "Due" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssConsentRecordsSurfaceKey,
      param: "hrWorkforceEssConsentSearch",
      modelField: "consentSearch",
      label: "Search consent records",
      placeholder:
        "Search employee, consent type, status, locale, or capture timestamp",
      columns: [
        { id: "consent", header: "Consent", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "status", header: "Status" },
        { id: "locale", header: "Locale" },
        { id: "capturedAt", header: "Captured" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssAccessLogSurfaceKey,
      param: "hrWorkforceEssAccessLogSearch",
      modelField: "accessLogSearch",
      label: "Search sensitive access log",
      placeholder:
        "Search actor, role, employee, target, privacy tier, access reason, or timestamp",
      columns: [
        { id: "target", header: "Target", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "actor", header: "Actor" },
        { id: "role", header: "Role" },
        { id: "privacy", header: "Privacy" },
        { id: "reason", header: "Reason" },
        { id: "accessedAt", header: "Accessed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssReportsSurfaceKey,
      param: "hrWorkforceEssReportsSearch",
      modelField: "reportsSearch",
      label: "Search ESS reports",
      placeholder:
        "Search group, grouping dimension, request counts, pending tasks, restricted records, or last activity",
      columns: [
        { id: "group", header: "Group", priority: "primary" },
        { id: "groupBy", header: "Grouped by" },
        { id: "requestCount", header: "Requests" },
        { id: "pendingTasks", header: "Pending tasks" },
        { id: "restrictedRecords", header: "Restricted" },
        { id: "lastActivityAt", header: "Last activity" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrWorkforceEssAuditTrailSurfaceKey,
      param: "hrWorkforceEssAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search ESS audit trail",
      placeholder:
        "Search audit action, actor, target, employee, summary, or occurrence timestamp",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "target", header: "Target" },
        { id: "employee", header: "Employee" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const HR_WORKFORCE_ESS_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY);

export type HrWorkforceEssListSurfaceKey =
  (typeof HR_WORKFORCE_ESS_LIST_SURFACE_KEYS)[number];

export const HR_WORKFORCE_ESS_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(
    HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY,
  );

export const HR_WORKFORCE_ESS_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(
    HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY,
  );

export const HR_WORKFORCE_ESS_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY);

export const HR_WORKFORCE_ESS_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(
    HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY,
  );

export const HR_WORKFORCE_ESS_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrWorkforceEssProfileSummarySurfaceKey]: "erp-operational-table",
  [hrWorkforceEssProfileUpdatesSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssLeaveBalancesSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssLeaveRequestsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssPayDocumentsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssAttendanceSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssShiftSchedulesSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssExpenseClaimsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssDocumentsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssResourcesSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssAcknowledgementsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssAssignedTasksSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssRequestTrackerSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssNotificationsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssApprovalInboxSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssBenefitsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssTrainingSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssOnboardingTasksSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssOffboardingTasksSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssConsentRecordsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssAccessLogSurfaceKey]: "erp-audit-ledger",
  [hrWorkforceEssReportsSurfaceKey]: "erp-operational-table",
  [hrWorkforceEssAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrWorkforceEssListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrWorkforceEssListSurfaceKeys(): readonly HrWorkforceEssListSurfaceKey[] {
  return HR_WORKFORCE_ESS_LIST_SURFACE_KEYS;
}
