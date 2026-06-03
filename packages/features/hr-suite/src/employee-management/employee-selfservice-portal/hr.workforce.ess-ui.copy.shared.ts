import {
  HR_WORKFORCE_ESS_LIST_SURFACE_KEYS,
  type HrWorkforceEssListSurfaceKey,
} from "./hr.workforce.ess-surface-metadata.shared";

const listCopy = {
  "hr.workforce.ess.profile-summary.list": {
    title: "Employee Profile",
    description:
      "Employee-owned HR profile information synchronized from employee records with sensitive contact fields masked by role.",
    emptyTitle: "No visible employee profile",
    emptyDescription:
      "Self-service only shows the signed-in employee profile unless manager or HR access expands the scope.",
  },
  "hr.workforce.ess.profile-updates.list": {
    title: "Profile Update Requests",
    description:
      "Permitted personal information updates, including sensitive changes routed for HR approval before master data changes.",
    emptyTitle: "No profile update requests",
    emptyDescription:
      "Submitted address, contact, dependent, and emergency contact requests appear here.",
  },
  "hr.workforce.ess.leave-balances.list": {
    title: "Leave Balances",
    description:
      "Current leave entitlement, usage, pending applications, and available balances by leave type.",
    emptyTitle: "No leave balances",
    emptyDescription:
      "Leave balance rows appear when leave management publishes entitlement data.",
  },
  "hr.workforce.ess.leave-requests.list": {
    title: "Leave Requests",
    description:
      "Leave applications, amendments, cancellations, decision status, and correction guidance.",
    emptyTitle: "No leave requests",
    emptyDescription: "Submitted leave requests and history appear here.",
  },
  "hr.workforce.ess.pay-documents.list": {
    title: "Pay Documents",
    description:
      "Authorized payslips, salary statements, tax forms, and payroll summaries with payroll-sensitive fields masked as required.",
    emptyTitle: "No authorized pay documents",
    emptyDescription:
      "Pay documents appear only when payroll access is authorized for the employee.",
  },
  "hr.workforce.ess.attendance.list": {
    title: "Attendance Records",
    description:
      "Clock records, lateness, overtime, absence, and leave-coded attendance where enabled.",
    emptyTitle: "No attendance records",
    emptyDescription:
      "Attendance rows appear when time and attendance data is enabled for the employee.",
  },
  "hr.workforce.ess.shift-schedules.list": {
    title: "Shift Schedule",
    description:
      "Upcoming work schedules and calendars by date, shift, time, and work location.",
    emptyTitle: "No shift schedules",
    emptyDescription:
      "Scheduled shifts appear when workforce scheduling publishes calendar data.",
  },
  "hr.workforce.ess.expense-claims.list": {
    title: "Expense Claims",
    description:
      "Employee-submitted claims, supporting receipt counts, reimbursement status, and correction guidance.",
    emptyTitle: "No expense claims",
    emptyDescription:
      "Claims submitted through self-service appear here with their latest status.",
  },
  "hr.workforce.ess.documents.list": {
    title: "HR Documents",
    description:
      "Authorized HR letters, contracts, policies, certificates, forms, and controlled document downloads.",
    emptyTitle: "No authorized HR documents",
    emptyDescription:
      "Only document types authorized for the employee are listed for access or download.",
  },
  "hr.workforce.ess.resources.list": {
    title: "Resource Center",
    description:
      "Localized handbooks, policies, FAQs, benefit guides, forms, and HR notices.",
    emptyTitle: "No HR resources",
    emptyDescription:
      "Resource center content appears when an item is published for the employee audience and locale.",
  },
  "hr.workforce.ess.acknowledgements.list": {
    title: "Acknowledgements",
    description:
      "Required policy, notice, consent, and compliance acknowledgements with due and completion status.",
    emptyTitle: "No acknowledgement tasks",
    emptyDescription:
      "Required acknowledgements appear when HR publishes notices for the employee.",
  },
  "hr.workforce.ess.assigned-tasks.list": {
    title: "Assigned HR Tasks",
    description:
      "Onboarding, offboarding, compliance, document submission, acknowledgement, and approval tasks.",
    emptyTitle: "No assigned tasks",
    emptyDescription:
      "Employee and manager tasks appear here when they are assigned by HR workflows.",
  },
  "hr.workforce.ess.request-tracker.list": {
    title: "Request Tracker",
    description:
      "Unified request status for leave, claims, profile updates, document requests, and task completions.",
    emptyTitle: "No tracked requests",
    emptyDescription:
      "Submitted self-service requests appear here with their latest decision status.",
  },
  "hr.workforce.ess.notifications.list": {
    title: "Notification Center",
    description:
      "Submitted, approved, rejected, returned, expiring document, and pending task notifications.",
    emptyTitle: "No notifications",
    emptyDescription:
      "Portal, email, and SMS notifications appear here after self-service activity.",
  },
  "hr.workforce.ess.approval-inbox.list": {
    title: "Manager Approval Inbox",
    description:
      "Manager and HR approval decisions for employee requests where the signed-in user is authorized.",
    emptyTitle: "No approvals assigned",
    emptyDescription:
      "Approvals appear when employee requests are routed to the current manager or HR approver.",
  },
  "hr.workforce.ess.benefits.list": {
    title: "Benefits",
    description:
      "Assigned benefits, insurance coverage, dependent counts, entitlement state, and effective dates.",
    emptyTitle: "No benefit enrollments",
    emptyDescription:
      "Benefits appear when enrollment information is available for the employee.",
  },
  "hr.workforce.ess.training.list": {
    title: "Training",
    description:
      "Assigned courses, required learning, certificate references, due dates, and completion history.",
    emptyTitle: "No training records",
    emptyDescription:
      "Training assignments and certificates appear when learning data is available.",
  },
  "hr.workforce.ess.onboarding-tasks.list": {
    title: "Onboarding Tasks",
    description:
      "New-hire forms, acknowledgements, document submissions, and onboarding task status.",
    emptyTitle: "No onboarding tasks",
    emptyDescription:
      "Onboarding tasks appear when employee lifecycle workflows assign them.",
  },
  "hr.workforce.ess.offboarding-tasks.list": {
    title: "Offboarding Tasks",
    description:
      "Exit forms, clearances, handover confirmations, and offboarding task status.",
    emptyTitle: "No offboarding tasks",
    emptyDescription:
      "Offboarding tasks appear when exit workflows assign them.",
  },
  "hr.workforce.ess.consent-records.list": {
    title: "Consent Records",
    description:
      "Localized privacy, policy, and payroll access consents captured through the portal.",
    emptyTitle: "No consent records",
    emptyDescription:
      "Consent records appear when an employee acknowledges or declines a controlled notice.",
  },
  "hr.workforce.ess.access-log.list": {
    title: "Sensitive Access Log",
    description:
      "Audit-grade access records for payroll, identity, personal, document, and request data.",
    emptyTitle: "No sensitive access events",
    emptyDescription:
      "Access events appear when restricted self-service data is viewed or downloaded.",
  },
  "hr.workforce.ess.reports.list": {
    title: "ESS Reports",
    description:
      "Self-service request posture grouped by employee, status, request type, department, period, or privacy tier.",
    emptyTitle: "No report rows",
    emptyDescription:
      "Report rows appear when self-service requests or tasks exist for the current scope.",
  },
  "hr.workforce.ess.audit-trail.list": {
    title: "Audit Trail",
    description:
      "Submission, approval, rejection, return, document access, notification, and acknowledgement events.",
    emptyTitle: "No audit events",
    emptyDescription:
      "Audit events appear after controlled self-service actions are completed.",
  },
} as const satisfies Record<
  HrWorkforceEssListSurfaceKey,
  {
    readonly title: string;
    readonly description: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
  }
>;

for (const key of HR_WORKFORCE_ESS_LIST_SURFACE_KEYS) {
  if (!(key in listCopy)) {
    throw new Error(`Missing Employee Self-Service Portal copy for ${key}`);
  }
}

export const hrWorkforceEssUiCopy = {
  title: "Employee Self-Service Portal",
  description:
    "Secure self-service for employee-owned HR information, requests, documents, tasks, and manager approvals.",
  page: {
    title: "Employee Self-Service Portal",
    description:
      "Employee self-service workspace with governed server-window lists, self and manager scoping, masked sensitive data, request tracking, and audit-ready actions.",
  },
  overview: {
    sectionTitle: "Self-Service Control",
    employees: "Employees in scope",
    openRequests: "Open requests",
    pendingTasks: "Pending tasks",
    sensitiveEvents: "Sensitive events",
  },
  listSections: listCopy,
  workbench: {
    title: "Employee Self-Service Portal",
    description:
      "Metadata-driven portal surface for employee requests, documents, tasks, and approvals.",
  },
  accessDenied: {
    title: "Employee self-service access required",
    description:
      "You do not have permission to view this employee self-service workspace.",
  },
} as const;
