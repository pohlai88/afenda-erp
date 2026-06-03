import type {
  HrUcbGrievanceWorkflowReference,
  HrUcbIntegrationExposureReference,
  HrUcbPayrollDeductionReferenceExport,
  HrUcbRuleReferenceExport,
  HrUcbSeniorityDecisionReference,
} from "./hr.industry.ucb.contract";
import {
  hrIndustryUcbAuditActions,
  type HrIndustryUcbAuditAction,
} from "../events";
import type { HrUcbReportGroupBy } from "./hr.industry.ucb-constants.shared";
import type {
  HrUcbAlertInput,
  HrUcbBargainingUnitAssignmentInput,
  HrUcbCollectiveBargainingAgreementInput,
  HrUcbDisputeReferenceInput,
  HrUcbDuesReferenceInput,
  HrUcbGrievanceCaseInput,
  HrUcbIntegrationExposureInput,
  HrUcbLaborMeetingInput,
  HrUcbMembershipInput,
  HrUcbRepresentativeInput,
  HrUcbRuleConflictInput,
  HrUcbRuleReferenceInput,
  HrUcbSeniorityRankingInput,
  HrUcbUnionRecordInput,
} from "./hr.industry.ucb.schema";

export const HR_INDUSTRY_UCB_REFERENCE_DATE = "2026-06-01";

export type HrIndustryUcbAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrIndustryUcbAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "union"
    | "cba"
    | "bargaining_unit"
    | "membership"
    | "rule_reference"
    | "seniority"
    | "rule_conflict"
    | "dues_reference"
    | "grievance"
    | "dispute"
    | "representative"
    | "labor_meeting"
    | "alert"
    | "integration"
    | "report"
    | "restricted_access";
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrIndustryUcbReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly unionCount: number;
  readonly agreementCount: number;
  readonly membershipCount: number;
  readonly grievanceCount: number;
  readonly disputeCount: number;
  readonly duesReferenceCount: number;
  readonly expiringAgreementCount: number;
  readonly openAlertCount: number;
};

export type HrIndustryUcbStore = {
  unions: HrUcbUnionRecordInput[];
  agreements: HrUcbCollectiveBargainingAgreementInput[];
  bargainingUnitAssignments: HrUcbBargainingUnitAssignmentInput[];
  memberships: HrUcbMembershipInput[];
  ruleReferences: HrUcbRuleReferenceInput[];
  seniorityRankings: HrUcbSeniorityRankingInput[];
  ruleConflicts: HrUcbRuleConflictInput[];
  duesReferences: HrUcbDuesReferenceInput[];
  grievances: HrUcbGrievanceCaseInput[];
  disputes: HrUcbDisputeReferenceInput[];
  representatives: HrUcbRepresentativeInput[];
  laborMeetings: HrUcbLaborMeetingInput[];
  alerts: HrUcbAlertInput[];
  integrationExposures: HrUcbIntegrationExposureInput[];
  auditEvents: HrIndustryUcbAuditEvent[];
};

type EmployeeScoped = { readonly employeeId?: string };

const stores = new Map<string, HrIndustryUcbStore>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function hasEmployeeAccess(
  row: EmployeeScoped,
  visibleEmployeeIds: readonly string[] | null,
) {
  return (
    !row.employeeId ||
    visibleEmployeeIds === null ||
    visibleEmployeeIds.includes(row.employeeId)
  );
}

function scopedRows<T extends EmployeeScoped>(
  rows: readonly T[],
  visibleEmployeeIds: readonly string[] | null,
) {
  return rows.filter((row) => hasEmployeeAccess(row, visibleEmployeeIds));
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function createSeedStore(organizationId: string): HrIndustryUcbStore {
  const unions = withOrg<HrUcbUnionRecordInput>(organizationId, [
    {
      id: "ucb-union-local-22",
      unionCode: "LOCAL-22",
      name: "United Operations Local 22",
      status: "active",
      representativeRef: "rep-morgan-local-22",
      primaryRepresentativeEmployeeId: "emp-520",
      activeMemberCount: 184,
    },
    {
      id: "ucb-union-food-allied",
      unionCode: "FASU-18",
      name: "Food and Allied Services Union",
      status: "active",
      representativeRef: "rep-priya-fasu",
      primaryRepresentativeEmployeeId: "emp-521",
      activeMemberCount: 92,
    },
    {
      id: "ucb-union-maintenance",
      unionCode: "MTN-07",
      name: "Maintenance Trades Council",
      status: "inactive",
      representativeRef: "rep-archive-mtn",
      activeMemberCount: 0,
    },
  ]);

  const agreements =
    withOrg<HrUcbCollectiveBargainingAgreementInput>(organizationId, [
      {
        id: "ucb-cba-ops-2026",
        agreementCode: "CBA-OPS-2026",
        unionId: "ucb-union-local-22",
        bargainingUnitId: "unit-warehouse-ops",
        title: "Warehouse Operations Collective Agreement",
        version: "2026.1",
        effectiveDate: "2026-01-01",
        expiryDate: "2026-12-31",
        status: "expiring",
        applicableWorkforce: "Hourly warehouse operators in US distribution centers",
        renewalDate: "2026-10-01",
        negotiationStatus: "preparing",
        clauses: ["Article 4 - Seniority", "Article 7 - Overtime", "Article 12 - Dues"],
      },
      {
        id: "ucb-cba-food-2025",
        agreementCode: "CBA-FASU-2025",
        unionId: "ucb-union-food-allied",
        bargainingUnitId: "unit-food-service",
        title: "Food Service Bargaining Agreement",
        version: "2025.3",
        effectiveDate: "2025-07-01",
        expiryDate: "2027-06-30",
        status: "active",
        applicableWorkforce: "Food handler and kitchen operations employees",
        renewalDate: "2027-03-31",
        negotiationStatus: "not_started",
        clauses: ["Clause 3 - Scheduling", "Clause 6 - Rest days", "Clause 9 - Allowances"],
      },
      {
        id: "ucb-cba-maint-2024",
        agreementCode: "CBA-MTN-2024",
        unionId: "ucb-union-maintenance",
        bargainingUnitId: "unit-maintenance",
        title: "Maintenance Transition Agreement",
        version: "2024.2",
        effectiveDate: "2024-01-01",
        expiryDate: "2025-12-31",
        status: "expired",
        applicableWorkforce: "Legacy maintenance employees",
        renewalDate: "2025-09-30",
        negotiationStatus: "stalled",
        clauses: ["Section 5 - Recall", "Section 8 - Holiday pay"],
      },
    ]);

  const bargainingUnitAssignments =
    withOrg<HrUcbBargainingUnitAssignmentInput>(organizationId, [
      {
        id: "ucb-asg-500",
        employeeId: "emp-500",
        employeeDisplayName: "Alicia Moreno",
        bargainingUnitId: "unit-warehouse-ops",
        bargainingUnitName: "Warehouse Operations",
        unionId: "ucb-union-local-22",
        departmentName: "Distribution",
        locationName: "NYC Distribution Center",
        roleName: "Forklift Operator",
        coveredWorkforce: "Hourly warehouse operators",
        assignmentDate: "2026-01-01",
        status: "active",
      },
      {
        id: "ucb-asg-501",
        employeeId: "emp-501",
        employeeDisplayName: "Jamal Reed",
        bargainingUnitId: "unit-warehouse-ops",
        bargainingUnitName: "Warehouse Operations",
        unionId: "ucb-union-local-22",
        departmentName: "Distribution",
        locationName: "Chicago Fulfillment",
        roleName: "Picker",
        coveredWorkforce: "Hourly warehouse operators",
        assignmentDate: "2026-02-15",
        status: "active",
      },
      {
        id: "ucb-asg-502",
        employeeId: "emp-502",
        employeeDisplayName: "Mei Lin Tan",
        bargainingUnitId: "unit-food-service",
        bargainingUnitName: "Food Service",
        unionId: "ucb-union-food-allied",
        departmentName: "Kitchen Operations",
        locationName: "Kuala Lumpur Campus",
        roleName: "Food Handler",
        coveredWorkforce: "Food service hourly employees",
        assignmentDate: "2025-07-01",
        status: "active",
      },
    ]);

  const memberships = withOrg<HrUcbMembershipInput>(organizationId, [
    {
      id: "ucb-mem-500",
      employeeId: "emp-500",
      employeeDisplayName: "Alicia Moreno",
      unionId: "ucb-union-local-22",
      bargainingUnitId: "unit-warehouse-ops",
      membershipStatus: "active",
      startDate: "2024-06-15",
      duesEligible: true,
      restrictedReason: "Union membership record",
    },
    {
      id: "ucb-mem-501",
      employeeId: "emp-501",
      employeeDisplayName: "Jamal Reed",
      unionId: "ucb-union-local-22",
      bargainingUnitId: "unit-warehouse-ops",
      membershipStatus: "pending",
      startDate: "2026-02-15",
      duesEligible: true,
      restrictedReason: "Pending membership authorization",
    },
    {
      id: "ucb-mem-502",
      employeeId: "emp-502",
      employeeDisplayName: "Mei Lin Tan",
      unionId: "ucb-union-food-allied",
      bargainingUnitId: "unit-food-service",
      membershipStatus: "active",
      startDate: "2025-07-01",
      duesEligible: true,
      restrictedReason: "Union membership record",
    },
  ]);

  const ruleReferences = withOrg<HrUcbRuleReferenceInput>(organizationId, [
    {
      id: "ucb-rule-pay-ops",
      agreementId: "ucb-cba-ops-2026",
      ruleType: "pay",
      sourceRef: "cba-ops-article-10-pay",
      summary: "Tiered hourly pay and allowance references for covered warehouse roles.",
      downstreamTargets: ["payroll_processing"],
      approvalStatus: "approved",
      status: "ready",
    },
    {
      id: "ucb-rule-overtime-ops",
      agreementId: "ucb-cba-ops-2026",
      ruleType: "overtime",
      sourceRef: "cba-ops-article-7-overtime",
      summary: "Seniority-based overtime offer order and daily premium reference.",
      downstreamTargets: ["overtime_management", "payroll_processing"],
      approvalStatus: "approved",
      status: "exposed",
    },
    {
      id: "ucb-rule-leave-food",
      agreementId: "ucb-cba-food-2025",
      ruleType: "leave",
      sourceRef: "cba-food-clause-8-leave",
      summary: "Vacation bidding and leave preference reference for food service employees.",
      downstreamTargets: ["leave_attendance_management", "shift_scheduling"],
      approvalStatus: "approved",
      status: "ready",
    },
    {
      id: "ucb-rule-rest-food",
      agreementId: "ucb-cba-food-2025",
      ruleType: "rest_days",
      sourceRef: "cba-food-clause-6-rest-days",
      summary: "Rest-day scheduling minimums and holiday premium references.",
      downstreamTargets: ["shift_scheduling", "payroll_processing"],
      approvalStatus: "approved",
      status: "ready",
    },
  ]);

  const seniorityRankings = withOrg<HrUcbSeniorityRankingInput>(
    organizationId,
    [
      {
        id: "ucb-sen-500",
        employeeId: "emp-500",
        employeeDisplayName: "Alicia Moreno",
        bargainingUnitId: "unit-warehouse-ops",
        roleName: "Forklift Operator",
        departmentName: "Distribution",
        locationName: "NYC Distribution Center",
        agreementId: "ucb-cba-ops-2026",
        seniorityDate: "2020-04-01",
        serviceLengthMonths: 74,
        rank: 1,
        rankingScope: "unit-warehouse-ops / Forklift Operator / NYC",
        decisionTypes: ["shift_preference", "overtime_priority", "layoff_order"],
        status: "active",
      },
      {
        id: "ucb-sen-501",
        employeeId: "emp-501",
        employeeDisplayName: "Jamal Reed",
        bargainingUnitId: "unit-warehouse-ops",
        roleName: "Picker",
        departmentName: "Distribution",
        locationName: "Chicago Fulfillment",
        agreementId: "ucb-cba-ops-2026",
        seniorityDate: "2023-11-12",
        serviceLengthMonths: 30,
        rank: 7,
        rankingScope: "unit-warehouse-ops / Picker / Chicago",
        decisionTypes: ["overtime_priority", "vacation_bidding", "recall_order"],
        status: "active",
      },
      {
        id: "ucb-sen-502",
        employeeId: "emp-502",
        employeeDisplayName: "Mei Lin Tan",
        bargainingUnitId: "unit-food-service",
        roleName: "Food Handler",
        departmentName: "Kitchen Operations",
        locationName: "Kuala Lumpur Campus",
        agreementId: "ucb-cba-food-2025",
        seniorityDate: "2021-09-20",
        serviceLengthMonths: 56,
        rank: 3,
        rankingScope: "unit-food-service / Food Handler / Kuala Lumpur",
        decisionTypes: ["shift_preference", "vacation_bidding"],
        status: "under_review",
      },
    ],
  );

  const ruleConflicts = withOrg<HrUcbRuleConflictInput>(organizationId, [
    {
      id: "ucb-conflict-overtime-501",
      targetRef: "otm-offer-2026-06-warehouse",
      employeeId: "emp-501",
      employeeDisplayName: "Jamal Reed",
      conflictType: "seniority_rule",
      ruleRef: "ucb-rule-overtime-ops",
      severity: "warning",
      actionBlocked: false,
      summary: "Overtime offer sequence skipped one higher seniority employee.",
      deadlineDate: "2026-06-03",
      status: "open",
    },
    {
      id: "ucb-conflict-shift-502",
      targetRef: "shift-schedule-food-week-23",
      employeeId: "emp-502",
      employeeDisplayName: "Mei Lin Tan",
      conflictType: "cba_rule",
      ruleRef: "ucb-rule-rest-food",
      severity: "blocker",
      actionBlocked: true,
      summary: "Proposed schedule violates rest-day minimum in food service agreement.",
      deadlineDate: "2026-06-02",
      status: "blocked",
    },
  ]);

  const duesReferences = withOrg<HrUcbDuesReferenceInput>(organizationId, [
    {
      id: "ucb-dues-500",
      employeeId: "emp-500",
      employeeDisplayName: "Alicia Moreno",
      unionId: "ucb-union-local-22",
      bargainingUnitId: "unit-warehouse-ops",
      deductionRef: "payroll-deduction-union-local-22-500",
      amountRef: "2.0 percent regular earnings",
      approvalStatus: "approved",
      payrollExposureStatus: "ready",
      effectiveDate: "2026-01-01",
      status: "approved",
    },
    {
      id: "ucb-dues-501",
      employeeId: "emp-501",
      employeeDisplayName: "Jamal Reed",
      unionId: "ucb-union-local-22",
      bargainingUnitId: "unit-warehouse-ops",
      deductionRef: "payroll-deduction-union-local-22-501",
      amountRef: "Pending authorization",
      approvalStatus: "pending_approval",
      payrollExposureStatus: "blocked",
      effectiveDate: "2026-02-15",
      status: "draft",
    },
    {
      id: "ucb-dues-502",
      employeeId: "emp-502",
      employeeDisplayName: "Mei Lin Tan",
      unionId: "ucb-union-food-allied",
      bargainingUnitId: "unit-food-service",
      deductionRef: "payroll-deduction-fasu-502",
      amountRef: "Fixed monthly reference FASU-2025",
      approvalStatus: "approved",
      payrollExposureStatus: "exposed",
      effectiveDate: "2025-07-01",
      status: "exposed",
    },
  ]);

  const grievances = withOrg<HrUcbGrievanceCaseInput>(organizationId, [
    {
      id: "ucb-grv-1001",
      caseCode: "GRV-2026-1001",
      employeeId: "emp-501",
      employeeDisplayName: "Jamal Reed",
      departmentName: "Distribution",
      locationName: "Chicago Fulfillment",
      bargainingUnitId: "unit-warehouse-ops",
      agreementId: "ucb-cba-ops-2026",
      agreementClause: "Article 7 - Overtime",
      category: "scheduling",
      severity: "high",
      stepLevel: 2,
      deadlineDate: "2026-06-05",
      hearingDate: "2026-06-03",
      escalationLevel: 1,
      status: "meeting_scheduled",
      mediationRef: "mediation-calendar-pending",
    },
    {
      id: "ucb-grv-1002",
      caseCode: "GRV-2026-1002",
      employeeId: "emp-502",
      employeeDisplayName: "Mei Lin Tan",
      departmentName: "Kitchen Operations",
      locationName: "Kuala Lumpur Campus",
      bargainingUnitId: "unit-food-service",
      agreementId: "ucb-cba-food-2025",
      agreementClause: "Clause 6 - Rest days",
      category: "contract_interpretation",
      severity: "critical",
      stepLevel: 3,
      deadlineDate: "2026-06-02",
      hearingDate: "2026-06-01",
      decision: "Pending arbitration review",
      escalationLevel: 2,
      status: "escalated",
      arbitrationRef: "arb-food-rest-2026-02",
      legalRef: "legal-labor-ref-882",
    },
    {
      id: "ucb-grv-1003",
      caseCode: "GRV-2026-1003",
      employeeId: "emp-500",
      employeeDisplayName: "Alicia Moreno",
      departmentName: "Distribution",
      locationName: "NYC Distribution Center",
      bargainingUnitId: "unit-warehouse-ops",
      agreementId: "ucb-cba-ops-2026",
      agreementClause: "Article 4 - Seniority",
      category: "seniority",
      severity: "medium",
      stepLevel: 1,
      deadlineDate: "2026-06-20",
      escalationLevel: 0,
      status: "under_review",
    },
  ]);

  const disputes = withOrg<HrUcbDisputeReferenceInput>(organizationId, [
    {
      id: "ucb-disp-1002",
      grievanceId: "ucb-grv-1002",
      employeeId: "emp-502",
      disputeType: "arbitration",
      referenceRef: "arb-food-rest-2026-02",
      summary: "Rest-day clause interpretation escalated for arbitration.",
      owner: "Labor Relations",
      status: "escalated",
    },
    {
      id: "ucb-disp-renewal-ops",
      disputeType: "unresolved_issue",
      referenceRef: "negotiation-ops-wage-grid",
      summary: "Wage grid renewal item unresolved before bargaining kickoff.",
      owner: "Bargaining Committee",
      status: "open",
    },
  ]);

  const representatives = withOrg<HrUcbRepresentativeInput>(organizationId, [
    {
      id: "ucb-rep-520",
      employeeId: "emp-520",
      displayName: "Morgan Lee",
      unionId: "ucb-union-local-22",
      representativeRole: "chief_steward",
      assignedDepartment: "Distribution",
      assignedSite: "NYC Distribution Center",
      status: "active",
    },
    {
      id: "ucb-rep-521",
      employeeId: "emp-521",
      displayName: "Priya Shah",
      unionId: "ucb-union-food-allied",
      representativeRole: "union_rep",
      assignedDepartment: "Kitchen Operations",
      assignedSite: "Kuala Lumpur Campus",
      status: "active",
    },
  ]);

  const laborMeetings = withOrg<HrUcbLaborMeetingInput>(organizationId, [
    {
      id: "ucb-meet-ops-renewal",
      meetingCode: "LRM-OPS-2026-06",
      unionId: "ucb-union-local-22",
      agreementId: "ucb-cba-ops-2026",
      scheduledDate: "2026-06-10",
      status: "action_pending",
      participants: ["Morgan Lee", "Labor Relations", "Payroll", "Operations VP"],
      minutesRef: "doc-lrm-ops-2026-06-minutes",
      actionItems: ["Confirm wage grid proposal", "Prepare seniority roster"],
      overdueActionCount: 1,
    },
    {
      id: "ucb-meet-food-grievance",
      meetingCode: "LRM-FASU-2026-05",
      unionId: "ucb-union-food-allied",
      agreementId: "ucb-cba-food-2025",
      scheduledDate: "2026-05-30",
      status: "held",
      participants: ["Priya Shah", "Kitchen Operations", "Legal", "HR Compliance"],
      minutesRef: "doc-lrm-fasu-2026-05-minutes",
      actionItems: ["Submit arbitration packet"],
      overdueActionCount: 0,
    },
  ]);

  const alerts = withOrg<HrUcbAlertInput>(organizationId, [
    {
      id: "ucb-alert-cba-expiring",
      alertType: "cba_expiring",
      targetRef: "ucb-cba-ops-2026",
      summary: "Warehouse agreement expires on 2026-12-31 and renewal planning is active.",
      dueDate: "2026-10-01",
      severity: "warning",
      status: "open",
    },
    {
      id: "ucb-alert-grievance-deadline",
      alertType: "grievance_deadline",
      targetRef: "ucb-grv-1002",
      summary: "Arbitration packet deadline due for escalated food service grievance.",
      dueDate: "2026-06-02",
      severity: "blocker",
      status: "overdue",
    },
    {
      id: "ucb-alert-labor-action",
      alertType: "overdue_action",
      targetRef: "ucb-meet-ops-renewal",
      summary: "One labor-relations action item is overdue from renewal meeting.",
      dueDate: "2026-06-01",
      severity: "warning",
      status: "open",
    },
  ]);

  const integrationExposures =
    withOrg<HrUcbIntegrationExposureInput>(organizationId, [
      {
        id: "ucb-int-payroll-pay-rule",
        integrationTarget: "payroll_processing",
        sourceRef: "ucb-rule-pay-ops",
        summary: "Approved CBA pay and allowance references ready for Payroll Processing.",
        exposedAt: "2026-06-01T08:00:00.000Z",
        status: "ready",
      },
      {
        id: "ucb-int-payroll-dues-502",
        integrationTarget: "payroll_processing",
        sourceRef: "ucb-dues-502",
        summary: "Approved union dues deduction reference exposed for food service employee.",
        employeeId: "emp-502",
        employeeDisplayName: "Mei Lin Tan",
        exposedAt: "2026-05-31T10:00:00.000Z",
        status: "exposed",
      },
      {
        id: "ucb-int-overtime-seniority",
        integrationTarget: "overtime_management",
        sourceRef: "ucb-rule-overtime-ops",
        summary: "Seniority-based overtime priority reference exposed to Overtime Management.",
        exposedAt: "2026-05-30T14:00:00.000Z",
        status: "exposed",
      },
      {
        id: "ucb-int-shift-rest-days",
        integrationTarget: "shift_scheduling",
        sourceRef: "ucb-rule-rest-food",
        summary: "Rest-day and scheduling rule reference ready for Shift Scheduling validation.",
        exposedAt: "2026-06-01T09:00:00.000Z",
        status: "ready",
      },
    ]);

  const auditEvents = withOrg<HrIndustryUcbAuditEvent>(organizationId, [
    {
      id: "ucb-audit-union-created",
      action: hrIndustryUcbAuditActions.unionCreated,
      actorId: "emp-900",
      targetType: "union",
      targetId: "ucb-union-local-22",
      summary: "Union record created with representative reference.",
      occurredAt: "2026-01-01T08:00:00.000Z",
    },
    {
      id: "ucb-audit-cba-created",
      action: hrIndustryUcbAuditActions.cbaCreated,
      actorId: "emp-900",
      targetType: "cba",
      targetId: "ucb-cba-ops-2026",
      summary: "Warehouse Operations CBA setup created.",
      occurredAt: "2026-01-01T08:30:00.000Z",
    },
    {
      id: "ucb-audit-membership",
      action: hrIndustryUcbAuditActions.membershipUpdated,
      actorId: "emp-910",
      targetType: "membership",
      targetId: "ucb-mem-501",
      employeeId: "emp-501",
      summary: "Membership status updated to pending for Jamal Reed.",
      occurredAt: "2026-02-15T09:00:00.000Z",
    },
    {
      id: "ucb-audit-seniority",
      action: hrIndustryUcbAuditActions.seniorityUpdated,
      actorId: "system",
      targetType: "seniority",
      targetId: "ucb-sen-500",
      employeeId: "emp-500",
      summary: "Seniority ranking refreshed for warehouse bargaining unit.",
      occurredAt: "2026-05-29T07:00:00.000Z",
    },
    {
      id: "ucb-audit-dispute",
      action: hrIndustryUcbAuditActions.disputeEscalated,
      actorId: "emp-930",
      targetType: "dispute",
      targetId: "ucb-disp-1002",
      employeeId: "emp-502",
      summary: "Food service grievance escalated to arbitration reference.",
      occurredAt: "2026-05-31T15:00:00.000Z",
    },
  ]);

  return {
    unions,
    agreements,
    bargainingUnitAssignments,
    memberships,
    ruleReferences,
    seniorityRankings,
    ruleConflicts,
    duesReferences,
    grievances,
    disputes,
    representatives,
    laborMeetings,
    alerts,
    integrationExposures,
    auditEvents,
  };
}

export function getHrIndustryUcbStore(
  organizationId: string,
): HrIndustryUcbStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrIndustryUcbStore(
  organizationId: string,
): HrIndustryUcbStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function filterHrIndustryUcbRecordsForAccess(input: {
  readonly store: HrIndustryUcbStore;
  readonly visibleEmployeeIds: readonly string[] | null;
}): HrIndustryUcbStore {
  const { store, visibleEmployeeIds } = input;
  return {
    ...store,
    bargainingUnitAssignments: scopedRows(
      store.bargainingUnitAssignments,
      visibleEmployeeIds,
    ),
    memberships: scopedRows(store.memberships, visibleEmployeeIds),
    seniorityRankings: scopedRows(store.seniorityRankings, visibleEmployeeIds),
    ruleConflicts: scopedRows(store.ruleConflicts, visibleEmployeeIds),
    duesReferences: scopedRows(store.duesReferences, visibleEmployeeIds),
    grievances: scopedRows(store.grievances, visibleEmployeeIds),
    disputes: scopedRows(store.disputes, visibleEmployeeIds),
    representatives: scopedRows(store.representatives, visibleEmployeeIds),
    integrationExposures: scopedRows(
      store.integrationExposures,
      visibleEmployeeIds,
    ),
    auditEvents: store.auditEvents.filter((event) =>
      hasEmployeeAccess(event, visibleEmployeeIds),
    ),
  };
}

export function listHrIndustryUcbPayrollDeductionRefs(
  store: HrIndustryUcbStore,
): HrUcbPayrollDeductionReferenceExport[] {
  return store.duesReferences
    .filter(
      (row) =>
        row.approvalStatus === "approved" &&
        row.payrollExposureStatus !== "blocked",
    )
    .map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeDisplayName: row.employeeDisplayName,
      unionId: row.unionId,
      bargainingUnitId: row.bargainingUnitId,
      deductionRef: row.deductionRef,
      amountRef: row.amountRef,
      status: row.status,
    }));
}

export function listHrIndustryUcbRuleReferenceExports(
  store: HrIndustryUcbStore,
): HrUcbRuleReferenceExport[] {
  return store.ruleReferences
    .filter((row) => row.approvalStatus === "approved")
    .map((row) => ({
      id: row.id,
      agreementId: row.agreementId,
      ruleType: row.ruleType,
      sourceRef: row.sourceRef,
      downstreamTargets: row.downstreamTargets,
      status: row.status,
    }));
}

export function listHrIndustryUcbGrievanceWorkflowRefs(
  store: HrIndustryUcbStore,
): HrUcbGrievanceWorkflowReference[] {
  return store.grievances.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    bargainingUnitId: row.bargainingUnitId,
    agreementId: row.agreementId,
    agreementClause: row.agreementClause,
    stepLevel: row.stepLevel,
    deadlineDate: row.deadlineDate,
    escalationLevel: row.escalationLevel,
    status: row.status,
  }));
}

export function listHrIndustryUcbSeniorityDecisionRefs(
  store: HrIndustryUcbStore,
): HrUcbSeniorityDecisionReference[] {
  return store.seniorityRankings.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeDisplayName: row.employeeDisplayName,
    bargainingUnitId: row.bargainingUnitId,
    agreementId: row.agreementId,
    rank: row.rank,
    seniorityDate: row.seniorityDate,
    decisionTypes: row.decisionTypes,
  }));
}

export function listHrIndustryUcbIntegrationExposureRefs(
  store: HrIndustryUcbStore,
): HrUcbIntegrationExposureReference[] {
  return store.integrationExposures.map((row) => ({
    id: row.id,
    integrationTarget: row.integrationTarget,
    sourceRef: row.sourceRef,
    summary: row.summary,
    employeeId: row.employeeId,
    status: row.status,
  }));
}

function reportGroupLabel(input: {
  readonly store: HrIndustryUcbStore;
  readonly groupBy: HrUcbReportGroupBy;
  readonly agreement: HrUcbCollectiveBargainingAgreementInput | undefined;
  readonly membership: HrUcbMembershipInput | undefined;
  readonly grievance: HrUcbGrievanceCaseInput | undefined;
}) {
  const { store, groupBy, agreement, membership, grievance } = input;
  const union = store.unions.find(
    (row) => row.id === (agreement?.unionId ?? membership?.unionId),
  );
  switch (groupBy) {
    case "union":
      return union?.name ?? "Unassigned union";
    case "bargaining_unit":
      return (
        store.bargainingUnitAssignments.find(
          (row) =>
            row.bargainingUnitId ===
            (membership?.bargainingUnitId ?? grievance?.bargainingUnitId),
        )?.bargainingUnitName ?? "Unassigned bargaining unit"
      );
    case "agreement":
      return agreement?.title ?? grievance?.agreementId ?? "No agreement";
    case "department":
      return grievance?.departmentName ?? "Shared labor-relations scope";
    case "location":
      return grievance?.locationName ?? "Shared location";
    case "grievance_status":
      return grievance?.status ?? "No grievance";
    case "renewal_status":
      return agreement?.negotiationStatus ?? "No renewal";
    case "dues_status":
      return (
        store.duesReferences.find(
          (row) => row.employeeId === membership?.employeeId,
        )?.status ?? "No dues reference"
      );
  }
}

export function buildHrIndustryUcbReportRows(input: {
  readonly store: HrIndustryUcbStore;
  readonly groupBy: HrUcbReportGroupBy;
}): HrIndustryUcbReportRow[] {
  const agreementsById = new Map(
    input.store.agreements.map((agreement) => [agreement.id, agreement]),
  );
  const groups = new Map<string, HrIndustryUcbReportRow>();
  const sourceRows = [
    ...input.store.memberships.map((membership) => ({
      membership,
      agreement: input.store.agreements.find(
        (agreement) => agreement.bargainingUnitId === membership.bargainingUnitId,
      ),
      grievance: undefined,
    })),
    ...input.store.grievances.map((grievance) => ({
      membership: undefined,
      agreement: agreementsById.get(grievance.agreementId),
      grievance,
    })),
  ];

  for (const source of sourceRows) {
    const label = reportGroupLabel({
      store: input.store,
      groupBy: input.groupBy,
      ...source,
    });
    const existing = groups.get(label);
    groups.set(label, {
      id: `ucb-report-${slug(label)}`,
      groupLabel: label,
      unionCount:
        existing?.unionCount ??
        input.store.unions.filter((row) => row.status === "active").length,
      agreementCount:
        (existing?.agreementCount ?? 0) + (source.agreement ? 1 : 0),
      membershipCount:
        (existing?.membershipCount ?? 0) + (source.membership ? 1 : 0),
      grievanceCount:
        (existing?.grievanceCount ?? 0) + (source.grievance ? 1 : 0),
      disputeCount:
        existing?.disputeCount ??
        input.store.disputes.filter((row) => row.status !== "closed").length,
      duesReferenceCount:
        (existing?.duesReferenceCount ?? 0) + (source.membership ? 1 : 0),
      expiringAgreementCount:
        existing?.expiringAgreementCount ??
        input.store.agreements.filter((row) => row.status === "expiring")
          .length,
      openAlertCount:
        existing?.openAlertCount ??
        input.store.alerts.filter(
          (row) => row.status === "open" || row.status === "overdue",
        ).length,
    });
  }

  return [...groups.values()];
}

export function emitHrIndustryUcbAuditEvent(input: {
  readonly store: HrIndustryUcbStore;
  readonly action: HrIndustryUcbAuditAction;
  readonly actorId: string;
  readonly targetType: HrIndustryUcbAuditEvent["targetType"];
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
}) {
  const event: HrIndustryUcbAuditEvent = {
    id: `ucb-audit-${input.store.auditEvents.length + 1}`,
    organizationId: input.store.unions[0]?.organizationId ?? "unknown",
    action: input.action,
    actorId: input.actorId,
    targetType: input.targetType,
    targetId: input.targetId,
    employeeId: input.employeeId,
    summary: input.summary,
    occurredAt: new Date().toISOString(),
  };
  input.store.auditEvents = [event, ...input.store.auditEvents];
  return event;
}
