import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../../hr-suite-integration/metadata";

export const hrIndustryUcbOverviewKpiSurfaceKey =
  "hr.industry.ucb.overview.kpi" as const;
export const hrIndustryUcbUnionsSurfaceKey =
  "hr.industry.ucb.unions.list" as const;
export const hrIndustryUcbAgreementsSurfaceKey =
  "hr.industry.ucb.collective-bargaining-agreements.list" as const;
export const hrIndustryUcbAssignmentsSurfaceKey =
  "hr.industry.ucb.bargaining-unit-assignments.list" as const;
export const hrIndustryUcbMembershipsSurfaceKey =
  "hr.industry.ucb.memberships.list" as const;
export const hrIndustryUcbRuleReferencesSurfaceKey =
  "hr.industry.ucb.cba-rule-references.list" as const;
export const hrIndustryUcbSenioritySurfaceKey =
  "hr.industry.ucb.seniority-rankings.list" as const;
export const hrIndustryUcbRuleConflictsSurfaceKey =
  "hr.industry.ucb.rule-conflicts.list" as const;
export const hrIndustryUcbDuesReferencesSurfaceKey =
  "hr.industry.ucb.dues-references.list" as const;
export const hrIndustryUcbGrievancesSurfaceKey =
  "hr.industry.ucb.grievances.list" as const;
export const hrIndustryUcbDisputesSurfaceKey =
  "hr.industry.ucb.disputes.list" as const;
export const hrIndustryUcbRepresentativesSurfaceKey =
  "hr.industry.ucb.representatives.list" as const;
export const hrIndustryUcbLaborMeetingsSurfaceKey =
  "hr.industry.ucb.labor-relations-meetings.list" as const;
export const hrIndustryUcbAlertsSurfaceKey =
  "hr.industry.ucb.alerts.list" as const;
export const hrIndustryUcbReportsSurfaceKey =
  "hr.industry.ucb.reports.list" as const;
export const hrIndustryUcbIntegrationExposuresSurfaceKey =
  "hr.industry.ucb.integration-exposures.list" as const;
export const hrIndustryUcbAuditTrailSurfaceKey =
  "hr.industry.ucb.audit-trail.list" as const;

export const HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrIndustryUcbUnionsSurfaceKey,
      param: "ucbUnionsSearch",
      modelField: "unionsSearch",
      label: "Search union records",
      placeholder:
        "Search union code, name, representative, status, and active member count",
      columns: [
        { id: "union", header: "Union", priority: "primary" },
        { id: "code", header: "Code" },
        { id: "representative", header: "Representative" },
        { id: "members", header: "Members" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbAgreementsSurfaceKey,
      param: "ucbAgreementsSearch",
      modelField: "agreementsSearch",
      label: "Search collective agreements",
      placeholder:
        "Search agreement title, version, workforce, effective date, expiry date, renewal date, and negotiation status",
      columns: [
        { id: "agreement", header: "Agreement", priority: "primary" },
        { id: "workforce", header: "Workforce" },
        { id: "period", header: "Period" },
        { id: "renewal", header: "Renewal" },
        { id: "negotiation", header: "Negotiation" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbAssignmentsSurfaceKey,
      param: "ucbAssignmentsSearch",
      modelField: "assignmentsSearch",
      label: "Search bargaining unit assignments",
      placeholder:
        "Search employee, bargaining unit, union, department, location, role, covered workforce, and assignment status",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "bargainingUnit", header: "Bargaining unit" },
        { id: "departmentLocation", header: "Department / location" },
        { id: "role", header: "Role" },
        { id: "coveredWorkforce", header: "Covered workforce" },
        { id: "assigned", header: "Assigned" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbMembershipsSurfaceKey,
      param: "ucbMembershipsSearch",
      modelField: "membershipsSearch",
      label: "Search union memberships",
      placeholder:
        "Search employee, union reference, bargaining unit, membership dates, dues eligibility, and restricted status",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "unionRef", header: "Union" },
        { id: "bargainingUnit", header: "Bargaining unit" },
        { id: "membershipDates", header: "Membership dates" },
        { id: "duesEligible", header: "Dues" },
        { id: "restrictedReason", header: "Restricted reason" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbRuleReferencesSurfaceKey,
      param: "ucbRuleReferencesSearch",
      modelField: "ruleReferencesSearch",
      label: "Search CBA rule references",
      placeholder:
        "Search pay, overtime, leave, work hours, rest days, holidays, allowances, benefits, scheduling, downstream targets, and approval status",
      columns: [
        { id: "rule", header: "Rule", priority: "primary" },
        { id: "agreement", header: "Agreement" },
        { id: "source", header: "Source" },
        { id: "targets", header: "Targets" },
        { id: "approval", header: "Approval" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbSenioritySurfaceKey,
      param: "ucbSenioritySearch",
      modelField: "senioritySearch",
      label: "Search seniority rankings",
      placeholder:
        "Search employee, seniority date, rank, bargaining unit, role, department, location, agreement, and decision type",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "rank", header: "Rank" },
        { id: "seniorityDate", header: "Seniority date" },
        { id: "scope", header: "Scope" },
        { id: "decisionTypes", header: "Decision types" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbRuleConflictsSurfaceKey,
      param: "ucbRuleConflictsSearch",
      modelField: "ruleConflictsSearch",
      label: "Search CBA and seniority conflicts",
      placeholder:
        "Search blocked actions, CBA rule conflicts, seniority conflicts, due dates, employee, severity, and resolution status",
      columns: [
        { id: "conflict", header: "Conflict", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "rule", header: "Rule" },
        { id: "deadline", header: "Deadline" },
        { id: "blocking", header: "Blocking" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbDuesReferencesSurfaceKey,
      param: "ucbDuesReferencesSearch",
      modelField: "duesReferencesSearch",
      label: "Search union dues references",
      placeholder:
        "Search employee, union, bargaining unit, deduction reference, amount reference, approval status, and payroll exposure status",
      columns: [
        { id: "employee", header: "Employee", priority: "primary" },
        { id: "unionRef", header: "Union" },
        { id: "deductionRef", header: "Deduction ref" },
        { id: "amountRef", header: "Amount ref" },
        { id: "approval", header: "Approval" },
        { id: "payroll", header: "Payroll" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbGrievancesSurfaceKey,
      param: "ucbGrievancesSearch",
      modelField: "grievancesSearch",
      label: "Search grievance cases",
      placeholder:
        "Search grievance code, employee, department, location, bargaining unit, clause, category, severity, step, deadline, hearing, escalation, and status",
      columns: [
        { id: "case", header: "Case", priority: "primary" },
        { id: "employee", header: "Employee" },
        { id: "clause", header: "Clause" },
        { id: "classification", header: "Classification" },
        { id: "process", header: "Process" },
        { id: "deadline", header: "Deadline" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbDisputesSurfaceKey,
      param: "ucbDisputesSearch",
      modelField: "disputesSearch",
      label: "Search dispute references",
      placeholder:
        "Search mediation, arbitration, legal, unresolved issue, reference, owner, grievance, employee, and dispute status",
      columns: [
        { id: "dispute", header: "Dispute", priority: "primary" },
        { id: "reference", header: "Reference" },
        { id: "owner", header: "Owner" },
        { id: "employee", header: "Employee" },
        { id: "summary", header: "Summary" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbRepresentativesSurfaceKey,
      param: "ucbRepresentativesSearch",
      modelField: "representativesSearch",
      label: "Search union representatives",
      placeholder:
        "Search steward, union representative, role, assigned department, assigned site, union, and active status",
      columns: [
        { id: "representative", header: "Representative", priority: "primary" },
        { id: "role", header: "Role" },
        { id: "unionRef", header: "Union" },
        { id: "assignment", header: "Assignment" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbLaborMeetingsSurfaceKey,
      param: "ucbLaborMeetingsSearch",
      modelField: "laborMeetingsSearch",
      label: "Search labor-relations meetings",
      placeholder:
        "Search meeting schedule, participants, minutes references, action items, overdue actions, union, agreement, and meeting status",
      columns: [
        { id: "meeting", header: "Meeting", priority: "primary" },
        { id: "scheduled", header: "Scheduled" },
        { id: "participants", header: "Participants" },
        { id: "minutes", header: "Minutes" },
        { id: "actionItems", header: "Action items" },
        { id: "overdue", header: "Overdue" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryUcbAlertsSurfaceKey,
      param: "ucbAlertsSearch",
      modelField: "alertsSearch",
      label: "Search labor-relations alerts",
      placeholder:
        "Search expiring agreements, grievance deadlines, unresolved disputes, overdue labor actions, severity, due date, and alert status",
      columns: [
        { id: "alert", header: "Alert", priority: "primary" },
        { id: "target", header: "Target" },
        { id: "dueDate", header: "Due date" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbReportsSurfaceKey,
      param: "ucbReportsSearch",
      modelField: "reportsSearch",
      label: "Search union reports",
      placeholder:
        "Search reports by union, bargaining unit, agreement, department, location, grievance status, renewal status, dues status, disputes, and renewals",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "unionCount", header: "Unions" },
        { id: "agreementCount", header: "Agreements" },
        { id: "membershipCount", header: "Memberships" },
        { id: "grievanceCount", header: "Grievances" },
        { id: "disputeCount", header: "Disputes" },
        { id: "duesReferenceCount", header: "Dues refs" },
        { id: "openAlertCount", header: "Alerts" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryUcbIntegrationExposuresSurfaceKey,
      param: "ucbIntegrationsSearch",
      modelField: "integrationExposuresSearch",
      label: "Search integration exposures",
      placeholder:
        "Search Payroll Processing, Overtime Management, Leave and Attendance, Shift Scheduling, Document Management, Legal references, source references, and status",
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
      surfaceKey: hrIndustryUcbAuditTrailSurfaceKey,
      param: "ucbAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search union audit trail",
      placeholder:
        "Search union setup, membership updates, bargaining unit assignments, CBA setup, rule changes, grievance actions, dispute escalation, seniority updates, dues, renewals, and report exports",
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

export const HR_INDUSTRY_UCB_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY);

export type HrIndustryUcbListSurfaceKey =
  (typeof HR_INDUSTRY_UCB_LIST_SURFACE_KEYS)[number];

export const HR_INDUSTRY_UCB_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_UCB_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_UCB_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_UCB_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(
    HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY,
  );

export const HR_INDUSTRY_UCB_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrIndustryUcbUnionsSurfaceKey]: "erp-operational-table",
  [hrIndustryUcbAgreementsSurfaceKey]: "erp-operational-table",
  [hrIndustryUcbAssignmentsSurfaceKey]: "erp-operational-table",
  [hrIndustryUcbMembershipsSurfaceKey]: "erp-exception-table",
  [hrIndustryUcbRuleReferencesSurfaceKey]: "erp-analytical-table",
  [hrIndustryUcbSenioritySurfaceKey]: "erp-analytical-table",
  [hrIndustryUcbRuleConflictsSurfaceKey]: "erp-exception-table",
  [hrIndustryUcbDuesReferencesSurfaceKey]: "erp-analytical-table",
  [hrIndustryUcbGrievancesSurfaceKey]: "erp-exception-table",
  [hrIndustryUcbDisputesSurfaceKey]: "erp-exception-table",
  [hrIndustryUcbRepresentativesSurfaceKey]: "erp-operational-table",
  [hrIndustryUcbLaborMeetingsSurfaceKey]: "erp-operational-table",
  [hrIndustryUcbAlertsSurfaceKey]: "erp-exception-table",
  [hrIndustryUcbReportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryUcbIntegrationExposuresSurfaceKey]: "erp-analytical-table",
  [hrIndustryUcbAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrIndustryUcbListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrIndustryUcbListSurfaceKeys(): readonly HrIndustryUcbListSurfaceKey[] {
  return HR_INDUSTRY_UCB_LIST_SURFACE_KEYS;
}

export const hrIndustryUcbWorkbenchSurfaceKey =
  hrIndustryUcbGrievancesSurfaceKey;
