"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../hr-suite-integration/server";
import {
  buildHrIndustryUcbReportRows,
  emitHrIndustryUcbAuditEvent,
  getHrIndustryUcbStore,
  listHrIndustryUcbGrievanceWorkflowRefs,
  listHrIndustryUcbIntegrationExposureRefs,
  listHrIndustryUcbPayrollDeductionRefs,
  listHrIndustryUcbRuleReferenceExports,
  listHrIndustryUcbSeniorityDecisionRefs,
} from "./hr.industry.ucb-store.shared";
import { hrIndustryUcbAuditActions } from "./hr.industry.ucb.event";
import {
  requireHrIndustryUcbApprove,
  requireHrIndustryUcbRead,
  requireHrIndustryUcbWrite,
} from "./hr.industry.ucb-access.policy.server";
import {
  HR_UCB_REPORT_GROUP_BY,
  type HrUcbReportGroupBy,
} from "./hr.industry.ucb-constants.shared";
import {
  hrUcbBargainingUnitAssignmentSchema,
  hrUcbCollectiveBargainingAgreementSchema,
  hrUcbGrievanceCaseSchema,
  hrUcbLaborMeetingSchema,
  hrUcbMembershipSchema,
  hrUcbRuleConflictSchema,
  hrUcbRuleReferenceSchema,
  hrUcbUnionRecordSchema,
  type HrUcbBargainingUnitAssignmentInput,
  type HrUcbCollectiveBargainingAgreementInput,
  type HrUcbGrievanceCaseInput,
  type HrUcbLaborMeetingInput,
  type HrUcbMembershipInput,
  type HrUcbRuleReferenceInput,
  type HrUcbUnionRecordInput,
} from "./hr.industry.ucb.schema";

type UnionInput = Omit<
  HrUcbUnionRecordInput,
  "id" | "organizationId" | "status" | "activeMemberCount"
>;
type CbaInput = Omit<
  HrUcbCollectiveBargainingAgreementInput,
  "id" | "organizationId" | "status"
>;
type AssignmentInput = Omit<
  HrUcbBargainingUnitAssignmentInput,
  "id" | "organizationId" | "status"
>;
type MembershipInput = Omit<
  HrUcbMembershipInput,
  "id" | "organizationId"
>;
type RuleReferenceInput = Omit<
  HrUcbRuleReferenceInput,
  "id" | "organizationId" | "status"
>;
type GrievanceInput = Omit<
  HrUcbGrievanceCaseInput,
  "id" | "organizationId" | "status" | "stepLevel" | "escalationLevel"
>;
type LaborMeetingInput = Omit<
  HrUcbLaborMeetingInput,
  "id" | "organizationId" | "status"
>;

const idSchema = z.object({ id: z.string().trim().min(1) });
const membershipStatusSchema = z.object({
  membershipId: z.string().trim().min(1),
  membershipStatus: z.enum(["active", "pending", "resigned", "inactive", "exempt"]),
  endDate: z.string().date().optional(),
});
const seniorityRefreshSchema = z.object({
  employeeId: z.string().trim().min(1),
  rank: z.number().int().positive(),
  reason: z.string().trim().min(1),
});
const conflictValidationSchema = z.object({
  targetRef: z.string().trim().min(1),
  employeeId: z.string().trim().optional(),
  employeeDisplayName: z.string().trim().optional(),
  conflictType: z.enum(["cba_rule", "seniority_rule", "dues_rule"]),
  ruleRef: z.string().trim().min(1),
  severity: z.enum(["info", "warning", "blocker"]),
  actionBlocked: z.boolean(),
  summary: z.string().trim().min(1),
  deadlineDate: z.string().date().optional(),
});
const duesApprovalSchema = z.object({
  duesReferenceId: z.string().trim().min(1),
  exposeToPayroll: z.boolean().default(false),
});
const grievanceStepSchema = z.object({
  grievanceId: z.string().trim().min(1),
  decision: z.string().trim().optional(),
  nextStatus: z.enum([
    "under_review",
    "meeting_scheduled",
    "pending_decision",
    "escalated",
    "resolved",
    "withdrawn",
    "closed",
  ]),
});
const disputeEscalationSchema = z.object({
  grievanceId: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  disputeType: z.enum([
    "grievance",
    "mediation",
    "arbitration",
    "legal_reference",
    "unresolved_issue",
  ]),
  referenceRef: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  owner: z.string().trim().min(1),
});
const reportExportSchema = z.object({
  groupBy: z.enum(HR_UCB_REPORT_GROUP_BY).catch("union"),
});

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrIndustryUcbWorkbenchAction() {
  try {
    const guard = await requireHrIndustryUcbRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Union and Collective Bargaining Management.",
      "hr.ucb.refresh_failed",
    );
  }
}

export async function createHrIndustryUcbUnionAction(input: UnionInput) {
  try {
    const guard = await requireHrIndustryUcbWrite();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbUnionRecordSchema.parse({
      ...input,
      id: `ucb-union-${store.unions.length + 1}`,
      organizationId: guard.organization.id,
      status: "active",
      activeMemberCount: 0,
    });
    store.unions.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.unionCreated,
      actorId: guard.session.id,
      targetType: "union",
      targetId: row.id,
      summary: `Created union ${row.unionCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to create union record.", "hr.ucb.union_failed");
  }
}

export async function createHrIndustryUcbCbaAction(input: CbaInput) {
  try {
    const guard = await requireHrIndustryUcbWrite();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbCollectiveBargainingAgreementSchema.parse({
      ...input,
      id: `ucb-cba-${store.agreements.length + 1}`,
      organizationId: guard.organization.id,
      status: "draft",
    });
    store.agreements.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.cbaCreated,
      actorId: guard.session.id,
      targetType: "cba",
      targetId: row.id,
      summary: `Created collective bargaining agreement ${row.agreementCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to create CBA record.", "hr.ucb.cba_failed");
  }
}

export async function assignHrIndustryUcbBargainingUnitAction(
  input: AssignmentInput,
) {
  try {
    const guard = await requireHrIndustryUcbWrite();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbBargainingUnitAssignmentSchema.parse({
      ...input,
      id: `ucb-asg-${store.bargainingUnitAssignments.length + 1}`,
      organizationId: guard.organization.id,
      status: "active",
    });
    store.bargainingUnitAssignments.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.bargainingUnitAssigned,
      actorId: guard.session.id,
      targetType: "bargaining_unit",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Assigned ${row.employeeDisplayName} to ${row.bargainingUnitName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to assign bargaining unit.",
      "hr.ucb.assignment_failed",
    );
  }
}

export async function updateHrIndustryUcbMembershipAction(
  input: MembershipInput,
) {
  try {
    const guard = await requireHrIndustryUcbWrite();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbMembershipSchema.parse({
      ...input,
      id: `ucb-mem-${store.memberships.length + 1}`,
      organizationId: guard.organization.id,
    });
    store.memberships.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.membershipUpdated,
      actorId: guard.session.id,
      targetType: "membership",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Updated union membership for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to update union membership.",
      "hr.ucb.membership_failed",
    );
  }
}

export async function setHrIndustryUcbMembershipStatusAction(input: {
  readonly membershipId: string;
  readonly membershipStatus: HrUcbMembershipInput["membershipStatus"];
  readonly endDate?: string;
}) {
  try {
    const parsed = membershipStatusSchema.parse(input);
    const guard = await requireHrIndustryUcbWrite();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const membership = store.memberships.find(
      (row) => row.id === parsed.membershipId,
    );
    if (!membership) {
      return actionFailure(
        "Union membership was not found.",
        "hr.ucb.membership_missing",
      );
    }
    Object.assign(membership, parsed);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.membershipUpdated,
      actorId: guard.session.id,
      targetType: "membership",
      targetId: membership.id,
      employeeId: membership.employeeId,
      summary: `Membership status changed to ${parsed.membershipStatus}.`,
    });
    return { ok: true as const, data: membership };
  } catch {
    return actionFailure(
      "Unable to change membership status.",
      "hr.ucb.membership_status_failed",
    );
  }
}

export async function upsertHrIndustryUcbRuleReferenceAction(
  input: RuleReferenceInput,
) {
  try {
    const guard = await requireHrIndustryUcbApprove();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbRuleReferenceSchema.parse({
      ...input,
      id: `ucb-rule-${store.ruleReferences.length + 1}`,
      organizationId: guard.organization.id,
      status: input.approvalStatus === "approved" ? "ready" : "blocked",
    });
    store.ruleReferences.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.cbaRuleChanged,
      actorId: guard.session.id,
      targetType: "rule_reference",
      targetId: row.id,
      summary: `Updated CBA ${row.ruleType} rule reference ${row.sourceRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to update CBA rule reference.",
      "hr.ucb.rule_failed",
    );
  }
}

export async function calculateOrRefreshHrIndustryUcbSeniorityRankingAction(
  input: { readonly employeeId: string; readonly rank: number; readonly reason: string },
) {
  try {
    const parsed = seniorityRefreshSchema.parse(input);
    const guard = await requireHrIndustryUcbApprove();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const ranking = store.seniorityRankings.find(
      (row) => row.employeeId === parsed.employeeId,
    );
    if (!ranking) {
      return actionFailure(
        "Seniority ranking was not found.",
        "hr.ucb.seniority_missing",
      );
    }
    Object.assign(ranking, { rank: parsed.rank, status: "active" });
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.seniorityUpdated,
      actorId: guard.session.id,
      targetType: "seniority",
      targetId: ranking.id,
      employeeId: ranking.employeeId,
      summary: `Refreshed seniority rank to ${parsed.rank}: ${parsed.reason}`,
    });
    return { ok: true as const, data: ranking };
  } catch {
    return actionFailure(
      "Unable to refresh seniority ranking.",
      "hr.ucb.seniority_failed",
    );
  }
}

export async function validateHrIndustryUcbRuleConflictAction(input: {
  readonly targetRef: string;
  readonly employeeId?: string;
  readonly employeeDisplayName?: string;
  readonly conflictType: "cba_rule" | "seniority_rule" | "dues_rule";
  readonly ruleRef: string;
  readonly severity: "info" | "warning" | "blocker";
  readonly actionBlocked: boolean;
  readonly summary: string;
  readonly deadlineDate?: string;
}) {
  try {
    const parsed = conflictValidationSchema.parse(input);
    const guard = await requireHrIndustryUcbRead();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const conflict = hrUcbRuleConflictSchema.parse({
      ...parsed,
      id: `ucb-conflict-${store.ruleConflicts.length + 1}`,
      organizationId: guard.organization.id,
      status: parsed.actionBlocked ? "blocked" : "open",
    });
    store.ruleConflicts.unshift(conflict);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.ruleConflictFlagged,
      actorId: guard.session.id,
      targetType: "rule_conflict",
      targetId: conflict.id,
      employeeId: conflict.employeeId,
      summary: conflict.summary,
    });
    return { ok: true as const, data: conflict };
  } catch {
    return actionFailure(
      "Unable to validate CBA rule conflict.",
      "hr.ucb.conflict_failed",
    );
  }
}

export async function approveHrIndustryUcbDuesReferenceAction(input: {
  readonly duesReferenceId: string;
  readonly exposeToPayroll?: boolean;
}) {
  try {
    const parsed = duesApprovalSchema.parse(input);
    const guard = await requireHrIndustryUcbApprove();
    if (parsed.exposeToPayroll && !guard.canExposePayroll) {
      return actionFailure(
        "Payroll exposure access is required.",
        "hr.ucb.payroll_forbidden",
      );
    }
    const store = getHrIndustryUcbStore(guard.organization.id);
    const dues = store.duesReferences.find(
      (row) => row.id === parsed.duesReferenceId,
    );
    if (!dues) {
      return actionFailure(
        "Union dues reference was not found.",
        "hr.ucb.dues_missing",
      );
    }
    Object.assign(dues, {
      approvalStatus: "approved",
      payrollExposureStatus: parsed.exposeToPayroll ? "exposed" : "ready",
      status: parsed.exposeToPayroll ? "exposed" : "approved",
    });
    emitHrIndustryUcbAuditEvent({
      store,
      action: parsed.exposeToPayroll
        ? hrIndustryUcbAuditActions.duesReferenceExposed
        : hrIndustryUcbAuditActions.duesReferenceApproved,
      actorId: guard.session.id,
      targetType: "dues_reference",
      targetId: dues.id,
      employeeId: dues.employeeId,
      summary: `Approved union dues reference ${dues.deductionRef}.`,
    });
    return { ok: true as const, data: dues };
  } catch {
    return actionFailure(
      "Unable to approve union dues reference.",
      "hr.ucb.dues_approval_failed",
    );
  }
}

export async function createHrIndustryUcbGrievanceAction(
  input: GrievanceInput,
) {
  try {
    const guard = await requireHrIndustryUcbWrite();
    if (!guard.canManageGrievances) {
      return actionFailure(
        "Grievance management access is required.",
        "hr.ucb.grievance_forbidden",
      );
    }
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbGrievanceCaseSchema.parse({
      ...input,
      id: `ucb-grv-${store.grievances.length + 1}`,
      organizationId: guard.organization.id,
      status: "submitted",
      stepLevel: 1,
      escalationLevel: 0,
    });
    store.grievances.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.grievanceCreated,
      actorId: guard.session.id,
      targetType: "grievance",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Created grievance ${row.caseCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create grievance case.",
      "hr.ucb.grievance_failed",
    );
  }
}

export async function advanceHrIndustryUcbGrievanceStepAction(input: {
  readonly grievanceId: string;
  readonly decision?: string;
  readonly nextStatus:
    | "under_review"
    | "meeting_scheduled"
    | "pending_decision"
    | "escalated"
    | "resolved"
    | "withdrawn"
    | "closed";
}) {
  try {
    const parsed = grievanceStepSchema.parse(input);
    const guard = await requireHrIndustryUcbApprove();
    if (!guard.canManageGrievances) {
      return actionFailure(
        "Grievance management access is required.",
        "hr.ucb.grievance_forbidden",
      );
    }
    const store = getHrIndustryUcbStore(guard.organization.id);
    const grievance = store.grievances.find(
      (row) => row.id === parsed.grievanceId,
    );
    if (!grievance) {
      return actionFailure(
        "Grievance was not found.",
        "hr.ucb.grievance_missing",
      );
    }
    Object.assign(grievance, {
      status: parsed.nextStatus,
      stepLevel:
        parsed.nextStatus === "closed" || parsed.nextStatus === "resolved"
          ? grievance.stepLevel
          : grievance.stepLevel + 1,
      escalationLevel:
        parsed.nextStatus === "escalated"
          ? grievance.escalationLevel + 1
          : grievance.escalationLevel,
      decision: parsed.decision ?? grievance.decision,
    });
    emitHrIndustryUcbAuditEvent({
      store,
      action:
        parsed.nextStatus === "closed"
          ? hrIndustryUcbAuditActions.grievanceClosed
          : hrIndustryUcbAuditActions.grievanceStepAdvanced,
      actorId: guard.session.id,
      targetType: "grievance",
      targetId: grievance.id,
      employeeId: grievance.employeeId,
      summary: `Advanced grievance ${grievance.caseCode} to ${parsed.nextStatus}.`,
    });
    return { ok: true as const, data: grievance };
  } catch {
    return actionFailure(
      "Unable to advance grievance step.",
      "hr.ucb.grievance_step_failed",
    );
  }
}

export async function escalateHrIndustryUcbDisputeAction(input: {
  readonly grievanceId?: string;
  readonly employeeId?: string;
  readonly disputeType:
    | "grievance"
    | "mediation"
    | "arbitration"
    | "legal_reference"
    | "unresolved_issue";
  readonly referenceRef: string;
  readonly summary: string;
  readonly owner: string;
}) {
  try {
    const parsed = disputeEscalationSchema.parse(input);
    const guard = await requireHrIndustryUcbApprove();
    if (!guard.canReadLegalReferences && parsed.disputeType === "legal_reference") {
      return actionFailure(
        "Legal reference access is required.",
        "hr.ucb.legal_forbidden",
      );
    }
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = {
      id: `ucb-disp-${store.disputes.length + 1}`,
      organizationId: guard.organization.id,
      ...parsed,
      status: "escalated" as const,
    };
    store.disputes.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.disputeEscalated,
      actorId: guard.session.id,
      targetType: "dispute",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Escalated dispute reference ${row.referenceRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to escalate labor dispute.",
      "hr.ucb.dispute_failed",
    );
  }
}

export async function recordHrIndustryUcbLaborMeetingAction(
  input: LaborMeetingInput,
) {
  try {
    const guard = await requireHrIndustryUcbWrite();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const row = hrUcbLaborMeetingSchema.parse({
      ...input,
      id: `ucb-meet-${store.laborMeetings.length + 1}`,
      organizationId: guard.organization.id,
      status: "scheduled",
    });
    store.laborMeetings.unshift(row);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.laborMeetingRecorded,
      actorId: guard.session.id,
      targetType: "labor_meeting",
      targetId: row.id,
      summary: `Recorded labor-relations meeting ${row.meetingCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to record labor-relations meeting.",
      "hr.ucb.meeting_failed",
    );
  }
}

export async function exportHrIndustryUcbIntegrationRefsAction() {
  try {
    const guard = await requireHrIndustryUcbRead();
    if (!guard.canExposeIntegrations && !guard.canExposePayroll) {
      return actionFailure(
        "Union management integration export access is required.",
        "hr.ucb.integration_forbidden",
      );
    }
    const store = getHrIndustryUcbStore(guard.organization.id);
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.integrationExposed,
      actorId: guard.session.id,
      targetType: "integration",
      targetId: "ucb-integration-export",
      summary: "Exported CBA, seniority, grievance, dues, and integration references.",
    });
    return {
      ok: true as const,
      data: {
        ruleReferences: listHrIndustryUcbRuleReferenceExports(store),
        seniorityReferences: listHrIndustryUcbSeniorityDecisionRefs(store),
        grievanceWorkflowReferences: listHrIndustryUcbGrievanceWorkflowRefs(store),
        payrollDuesReferences: guard.canExposePayroll
          ? listHrIndustryUcbPayrollDeductionRefs(store)
          : [],
        integrationExposures: listHrIndustryUcbIntegrationExposureRefs(store),
      },
    };
  } catch {
    return actionFailure(
      "Unable to export union management integration references.",
      "hr.ucb.integration_export_failed",
    );
  }
}

export async function exportHrIndustryUcbReportAction(input?: {
  readonly groupBy?: HrUcbReportGroupBy;
}) {
  try {
    const parsed = reportExportSchema.parse(input ?? {});
    const guard = await requireHrIndustryUcbRead();
    if (!guard.canExportReports) {
      return actionFailure(
        "Union management report export access is required.",
        "hr.ucb.report_forbidden",
      );
    }
    const store = getHrIndustryUcbStore(guard.organization.id);
    const reportRows = buildHrIndustryUcbReportRows({
      store,
      groupBy: parsed.groupBy,
    });
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.reportExported,
      actorId: guard.session.id,
      targetType: "report",
      targetId: `ucb-report-${parsed.groupBy}`,
      summary: `Exported union management report grouped by ${parsed.groupBy}.`,
    });
    return { ok: true as const, data: reportRows };
  } catch {
    return actionFailure(
      "Unable to export union management report.",
      "hr.ucb.report_export_failed",
    );
  }
}

export async function acknowledgeHrIndustryUcbAlertAction(input: {
  readonly id: string;
}) {
  try {
    const parsed = idSchema.parse(input);
    const guard = await requireHrIndustryUcbApprove();
    const store = getHrIndustryUcbStore(guard.organization.id);
    const alert = store.alerts.find((row) => row.id === parsed.id);
    if (!alert) {
      return actionFailure("Alert was not found.", "hr.ucb.alert_missing");
    }
    Object.assign(alert, { status: "acknowledged" });
    emitHrIndustryUcbAuditEvent({
      store,
      action: hrIndustryUcbAuditActions.alertGenerated,
      actorId: guard.session.id,
      targetType: "alert",
      targetId: alert.id,
      summary: `Acknowledged union management alert ${alert.id}.`,
    });
    return { ok: true as const, data: alert };
  } catch {
    return actionFailure(
      "Unable to acknowledge union management alert.",
      "hr.ucb.alert_ack_failed",
    );
  }
}
