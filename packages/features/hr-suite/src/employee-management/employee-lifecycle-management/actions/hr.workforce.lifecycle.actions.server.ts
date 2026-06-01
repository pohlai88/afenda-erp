"use server";

import {
  cancelHrLifecycleTransition,
  changeHrEmploymentStatus,
  confirmHrEmployment,
  recordHrEmployeeMovement,
  recordHrProbationOutcome,
  renewHrEmployeeContract,
  startHrOffboarding,
  startHrOnboarding,
  type HrProbationOutcome,
} from "@afenda/db";
import { zodActionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { hrWorkforceLifecycleAuditActions } from "../events/hr.workforce.lifecycle.event";
import {
  requireHrLifecycleWrite,
} from "../policies/hr.workforce.lifecycle-access.policy.server";
import {
  parseHrLifecycleConfirmEmploymentForm,
  parseHrLifecycleProbationOutcomeForm,
} from "../schemas/hr.workforce.lifecycle-probation.schema";
import { parseHrLifecycleMovementForm } from "../schemas/hr.workforce.lifecycle-movement.schema";
import { parseHrLifecycleContractRenewalForm } from "../schemas/hr.workforce.lifecycle-contract.schema";
import {
  parseHrLifecycleNoticePeriodForm,
  parseHrLifecycleStartOffboardingForm,
  parseHrLifecycleStartOnboardingForm,
} from "../schemas/hr.workforce.lifecycle-exit.schema";
import {
  parseHrLifecycleCancelTransitionForm,
  parseHrLifecycleScheduleStatusChangeForm,
} from "../schemas/hr.workforce.lifecycle-transition.schema";
import { finalizeLifecycleMutation } from "./hr.workforce.lifecycle.mutation.shared.server";

export async function changeHrEmploymentStatusAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleScheduleStatusChangeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const effectiveDate = parsed.data.effectiveDate ?? new Date();
  const isScheduled = effectiveDate.getTime() > Date.now();

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await changeHrEmploymentStatus({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      toStatus: parsed.data.toStatus,
      effectiveDate,
      reason: parsed.data.reason ?? null,
      approvalReference: parsed.data.approvalReference ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: isScheduled
        ? hrWorkforceLifecycleAuditActions.employmentStatus.scheduled
        : hrWorkforceLifecycleAuditActions.employmentStatus.changed,
      targetId: parsed.data.employeeId,
      summary: isScheduled
        ? `Scheduled employment status change to ${parsed.data.toStatus}`
        : `Changed employment status to ${parsed.data.toStatus}`,
      reason: parsed.data.reason,
      metadata: {
        toStatus: parsed.data.toStatus,
        effectiveDate: effectiveDate.toISOString(),
        lifecycleEventId: result.eventId,
      },
    };
  });
}

export async function cancelHrLifecycleTransitionAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleCancelTransitionForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeLifecycleMutation(organization.id, async () => {
    await cancelHrLifecycleTransition({
      organizationId: organization.id,
      transitionId: parsed.data.transitionId,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.transition.cancelled,
      targetId: parsed.data.transitionId,
      summary: "Cancelled scheduled lifecycle transition",
    };
  });
}

export async function recordHrProbationOutcomeAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleProbationOutcomeForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const outcome = parsed.data.outcome as HrProbationOutcome;
  const effectiveDate = parsed.data.effectiveDate ?? new Date();

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await recordHrProbationOutcome({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      outcome,
      effectiveDate,
      probationEndDate: parsed.data.probationEndDate ?? null,
      reason: parsed.data.reason ?? null,
      approvalReference: parsed.data.approvalReference ?? null,
    });

    const action =
      outcome === "extended"
        ? hrWorkforceLifecycleAuditActions.probation.extended
        : hrWorkforceLifecycleAuditActions.probation.outcomeRecorded;

    return {
      organizationId: organization.id,
      actorId: session.id,
      action,
      targetId: parsed.data.employeeId,
      summary: `Recorded probation outcome: ${outcome}`,
      reason: parsed.data.reason,
      metadata: {
        outcome,
        effectiveDate: effectiveDate.toISOString(),
        lifecycleEventId: result.eventId,
      },
    };
  });
}

export async function confirmHrEmploymentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleConfirmEmploymentForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const effectiveDate = parsed.data.effectiveDate ?? new Date();

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await confirmHrEmployment({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      effectiveDate,
      reason: parsed.data.reason ?? null,
      approvalReference: parsed.data.approvalReference ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.confirmation.applied,
      targetId: parsed.data.employeeId,
      summary: "Confirmed employment",
      reason: parsed.data.reason,
      metadata: {
        effectiveDate: effectiveDate.toISOString(),
        lifecycleEventId: result.eventId,
      },
    };
  });
}

export async function recordHrEmployeeMovementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleMovementForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const effectiveDate = parsed.data.effectiveDate ?? new Date();
  const placement = {
    ...(parsed.data.currentDepartmentId !== undefined
      ? { currentDepartmentId: parsed.data.currentDepartmentId }
      : {}),
    ...(parsed.data.currentPositionId !== undefined
      ? { currentPositionId: parsed.data.currentPositionId }
      : {}),
    ...(parsed.data.managerEmployeeId !== undefined
      ? { managerEmployeeId: parsed.data.managerEmployeeId }
      : {}),
  };

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await recordHrEmployeeMovement({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      movementKind: parsed.data.movementKind,
      effectiveDate,
      placement,
      grade: parsed.data.grade,
      workLocationCode: parsed.data.workLocationCode,
      reason: parsed.data.reason ?? null,
      approvalReference: parsed.data.approvalReference ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.movement.recorded,
      targetId: parsed.data.employeeId,
      summary: `Recorded ${parsed.data.movementKind} movement`,
      reason: parsed.data.reason,
      metadata: {
        movementKind: parsed.data.movementKind,
        effectiveDate: effectiveDate.toISOString(),
        lifecycleEventId: result.eventId,
        assignmentId: result.assignmentId,
        changedFields: result.changedFields,
      },
    };
  });
}

export async function renewHrEmployeeContractAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleContractRenewalForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const effectiveDate = parsed.data.effectiveDate ?? new Date();

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await renewHrEmployeeContract({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      contractEndDate: parsed.data.contractEndDate,
      effectiveDate,
      reason: parsed.data.reason,
      approvalReference: parsed.data.approvalReference ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.contract.renewed,
      targetId: parsed.data.employeeId,
      summary: "Renewed fixed-term contract",
      reason: parsed.data.reason,
      metadata: {
        effectiveDate: effectiveDate.toISOString(),
        contractEndDate: parsed.data.contractEndDate.toISOString(),
        lifecycleEventId: result.eventId,
      },
    };
  });
}

export async function initiateHrNoticePeriodAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleNoticePeriodForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const effectiveDate = parsed.data.effectiveDate ?? new Date();

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await changeHrEmploymentStatus({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      toStatus: "notice_period",
      effectiveDate,
      reason: parsed.data.reason,
      approvalReference: parsed.data.approvalReference ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.exit.noticePeriodStarted,
      targetId: parsed.data.employeeId,
      summary: "Initiated notice period",
      reason: parsed.data.reason,
      metadata: {
        toStatus: "notice_period",
        effectiveDate: effectiveDate.toISOString(),
        lastWorkingDate: parsed.data.lastWorkingDate?.toISOString(),
        lifecycleEventId: result.eventId,
      },
    };
  });
}

export async function startHrOffboardingCaseAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleStartOffboardingForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const effectiveDate = parsed.data.effectiveDate ?? new Date();

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await startHrOffboarding({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      reason: parsed.data.reason,
      lastWorkingDate: parsed.data.lastWorkingDate ?? null,
      effectiveDate,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.offboarding.caseStarted,
      targetId: parsed.data.employeeId,
      summary: "Started offboarding case",
      reason: parsed.data.reason,
      metadata: {
        caseId: result.caseId,
        lifecycleEventId: result.eventId,
        lastWorkingDate: parsed.data.lastWorkingDate?.toISOString(),
      },
    };
  });
}

export async function startHrOnboardingCaseAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLifecycleWrite();
  const parsed = parseHrLifecycleStartOnboardingForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeLifecycleMutation(organization.id, async () => {
    const result = await startHrOnboarding({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      reason: parsed.data.reason ?? null,
      targetStatus: parsed.data.targetStatus,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceLifecycleAuditActions.onboarding.caseStarted,
      targetId: parsed.data.employeeId,
      summary: "Started onboarding checklist",
      reason: parsed.data.reason,
      metadata: {
        caseId: result.caseId,
        lifecycleEventId: result.eventId,
        targetStatus: parsed.data.targetStatus,
      },
    };
  });
}
