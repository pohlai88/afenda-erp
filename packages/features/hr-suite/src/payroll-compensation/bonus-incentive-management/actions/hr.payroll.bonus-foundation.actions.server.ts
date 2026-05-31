"use server";

import {
  appendHrBonusIncentiveAuditEventInTx,
  archiveHrBonusPlanInTx,
  assignHrBonusPlanParticipantInTx,
  upsertHrBonusCycleInTx,
  upsertHrBonusEligibilityRuleInTx,
  upsertHrBonusPlanInTx,
  upsertHrBonusTargetInTx,
} from "@afenda/db";
import {
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrPayrollBonusAuditActions } from "../events/hr.payroll.bonus.event";
import { requireHrBonusWrite } from "../policies/hr.payroll.bonus-access.policy.server";
import {
  parseArchiveBonusPlanForm,
  parseAssignBonusPlanParticipantForm,
  parseUpsertBonusCycleForm,
  parseUpsertBonusEligibilityRuleForm,
  parseUpsertBonusPlanForm,
  parseUpsertBonusTargetForm,
} from "../schemas/hr.payroll.bonus-foundation-form.shared";
import { finalizeBonusMutation } from "./hr.payroll.bonus.mutation.shared.server";

/** BON-001 + BON-002 */
export async function upsertBonusPlanAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseUpsertBonusPlanForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await upsertHrBonusPlanInTx(db, {
      organizationId: organization.id,
      code: parsed.data.code,
      name: parsed.data.name,
      planType: parsed.data.planType,
      description: parsed.data.description ?? null,
      currencyCode: parsed.data.currencyCode,
      requiresApproval: parsed.data.requiresApproval,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.plan.upserted,
      planId: saved.planId,
      summary: "Bonus plan created or updated",
      metadata: {
        code: parsed.data.code,
        planType: parsed.data.planType,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.plan.upserted,
      targetId: saved.planId,
      summary: "Bonus plan created or updated",
      metadata: { code: parsed.data.code },
    };
  });
}

export async function archiveBonusPlanAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseArchiveBonusPlanForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const archived = await archiveHrBonusPlanInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.plan.archived,
      planId: archived.planId,
      summary: "Bonus plan archived",
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.plan.archived,
      targetId: archived.planId,
      summary: "Bonus plan archived",
    };
  });
}

/** BON-003 */
export async function upsertBonusEligibilityRuleAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseUpsertBonusEligibilityRuleForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await upsertHrBonusEligibilityRuleInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      ruleId: parsed.data.ruleId,
      legalEntityCode: parsed.data.legalEntityCode ?? null,
      departmentId: parsed.data.departmentId ?? null,
      grade: parsed.data.grade ?? null,
      jobRole: parsed.data.jobRole ?? null,
      employmentType: parsed.data.employmentType ?? null,
      minTenureMonths: parsed.data.minTenureMonths ?? null,
      maxTenureMonths: parsed.data.maxTenureMonths ?? null,
      performanceRating: parsed.data.performanceRating ?? null,
      salesTeamCode: parsed.data.salesTeamCode ?? null,
      employeeStatus: parsed.data.employeeStatus ?? null,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.eligibility.upserted,
      planId: parsed.data.planId,
      summary: "Bonus eligibility rule configured",
      metadata: { ruleId: saved.ruleId },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.eligibility.upserted,
      targetId: saved.ruleId,
      summary: "Bonus eligibility rule configured",
      metadata: { planId: parsed.data.planId },
    };
  });
}

/** BON-004 */
export async function assignBonusPlanParticipantAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseAssignBonusPlanParticipantForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const assigned = await assignHrBonusPlanParticipantInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      employeeId: parsed.data.employeeId,
      assignedByUserId: session.id,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.participant.assigned,
      planId: parsed.data.planId,
      employeeId: parsed.data.employeeId,
      summary: assigned.eligible
        ? "Eligible employee assigned to bonus plan"
        : "Employee assigned but flagged ineligible",
      metadata: {
        participantId: assigned.participantId,
        eligible: assigned.eligible,
        ineligibilityReason: assigned.ineligibilityReason,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.participant.assigned,
      targetId: assigned.participantId,
      summary: assigned.eligible
        ? "Eligible employee assigned to bonus plan"
        : "Employee assigned but flagged ineligible",
      metadata: {
        planId: parsed.data.planId,
        eligible: assigned.eligible,
      },
    };
  });
}

/** BON-005 */
export async function upsertBonusCycleAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseUpsertBonusCycleForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await upsertHrBonusCycleInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      code: parsed.data.code,
      name: parsed.data.name,
      periodStartAt: parsed.data.periodStartAt,
      periodEndAt: parsed.data.periodEndAt,
      cutoffAt: parsed.data.cutoffAt ?? null,
      approvalAt: parsed.data.approvalAt ?? null,
      payoutAt: parsed.data.payoutAt ?? null,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.cycle.upserted,
      planId: parsed.data.planId,
      summary: "Bonus cycle configured",
      metadata: {
        cycleId: saved.cycleId,
        code: parsed.data.code,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.cycle.upserted,
      targetId: saved.cycleId,
      summary: "Bonus cycle configured",
      metadata: { planId: parsed.data.planId },
    };
  });
}

/** BON-006 */
export async function upsertBonusTargetAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseUpsertBonusTargetForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await upsertHrBonusTargetInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      cycleId: parsed.data.cycleId,
      targetId: parsed.data.targetId,
      targetKind: parsed.data.targetKind,
      targetValue: parsed.data.targetValue,
      label: parsed.data.label ?? null,
      employeeId: parsed.data.employeeId ?? null,
      departmentId: parsed.data.departmentId ?? null,
      teamRef: parsed.data.teamRef ?? null,
      projectRef: parsed.data.projectRef ?? null,
      currencyCode: parsed.data.currencyCode ?? null,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.target.upserted,
      planId: parsed.data.planId,
      targetId: saved.targetId,
      summary: "Bonus target recorded",
      metadata: {
        targetKind: parsed.data.targetKind,
        cycleId: parsed.data.cycleId,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.target.upserted,
      targetId: saved.targetId,
      summary: "Bonus target recorded",
      metadata: { planId: parsed.data.planId },
    };
  });
}
