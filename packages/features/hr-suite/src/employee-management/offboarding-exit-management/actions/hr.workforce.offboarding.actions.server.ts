"use server";

import {
  addHrOffboardingSettlementBlocker,
  cancelHrOffboarding,
  completeHrOffboarding,
  completeHrOffboardingClearanceItem,
  decideHrOffboardingApprovalStep,
  linkHrOffboardingDocument,
  markHrOffboardingSettlementReady,
  recordHrOffboardingExitInterviewFeedback,
  recordHrOffboardingRehireEligibility,
  resolveHrOffboardingSettlementBlocker,
  scheduleHrOffboardingExitInterview,
  startHrOffboarding,
  triggerHrOffboardingVacancy,
  updateHrOffboardingAssetStatus,
  waiveHrOffboardingClearanceItem,
} from "@afenda/db";
import { zodActionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { hrWorkforceOffboardingAuditActions } from "../events/hr.workforce.offboarding.event";
import { requireHrOffboardingWrite } from "../policies/hr.workforce.offboarding-access.policy.server";
import {
  parseHrOffboardingApprovalDecisionForm,
  parseHrOffboardingAssetStatusForm,
  parseHrOffboardingCaseActionForm,
  parseHrOffboardingClearanceActionForm,
  parseHrOffboardingDocumentLinkForm,
  parseHrOffboardingExitInterviewFeedbackForm,
  parseHrOffboardingExitInterviewScheduleForm,
  parseHrOffboardingRehireForm,
  parseHrOffboardingSettlementBlockerForm,
  parseHrOffboardingSettlementBlockerResolveForm,
  parseHrOffboardingStartCaseForm,
} from "../schemas/hr.workforce.offboarding-form.shared";
import { finalizeOffboardingMutation } from "./hr.workforce.offboarding.mutation.shared.server";

export async function initiateHrOffboardingExitCaseAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingStartCaseForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    const result = await startHrOffboarding({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      exitType: parsed.data.exitType,
      reason: parsed.data.reason,
      effectiveDate: parsed.data.effectiveDate,
      noticeStartDate: parsed.data.noticeStartDate,
      noticeEndDate: parsed.data.noticeEndDate,
      requiredNoticeDays: parsed.data.requiredNoticeDays,
      lastWorkingDate: parsed.data.lastWorkingDate,
      sensitiveDetails: parsed.data.sensitiveDetails,
      actorUserId: session.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.case.started,
      targetId: parsed.data.employeeId,
      summary: "Started offboarding case",
      reason: parsed.data.reason,
      metadata: { caseId: result.caseId, exitType: parsed.data.exitType },
    };
  });
}

export async function completeHrOffboardingClearanceItemAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingClearanceActionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await completeHrOffboardingClearanceItem({
      organizationId: organization.id,
      itemId: parsed.data.itemId,
      evidenceNote: parsed.data.evidenceNote,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.clearance.completed,
      targetId: parsed.data.itemId,
      summary: "Completed clearance item",
    };
  });
}

export async function waiveHrOffboardingClearanceItemAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingClearanceActionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await waiveHrOffboardingClearanceItem({
      organizationId: organization.id,
      itemId: parsed.data.itemId,
      evidenceNote: parsed.data.evidenceNote,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.clearance.waived,
      targetId: parsed.data.itemId,
      summary: "Waived clearance item",
    };
  });
}

export async function decideHrOffboardingApprovalStepAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingApprovalDecisionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await decideHrOffboardingApprovalStep({
      organizationId: organization.id,
      stepId: parsed.data.stepId,
      decision: parsed.data.decision,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action:
        parsed.data.decision === "approved"
          ? hrWorkforceOffboardingAuditActions.approval.approved
          : hrWorkforceOffboardingAuditActions.approval.rejected,
      targetId: parsed.data.stepId,
      summary: `${parsed.data.decision} approval step`,
    };
  });
}

export async function updateHrOffboardingAssetStatusAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingAssetStatusForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await updateHrOffboardingAssetStatus({
      organizationId: organization.id,
      assetId: parsed.data.assetId,
      status: parsed.data.status,
      notes: parsed.data.notes,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.asset.updated,
      targetId: parsed.data.assetId,
      summary: `Updated asset status to ${parsed.data.status}`,
    };
  });
}

export async function completeHrOffboardingCaseAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingCaseActionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    const result = await completeHrOffboarding({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.case.completed,
      targetId: parsed.data.caseId,
      summary: "Completed offboarding case",
      metadata: { lifecycleEventId: result.eventId },
    };
  });
}

export async function cancelHrOffboardingCaseAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingCaseActionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    const result = await cancelHrOffboarding({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      reason: parsed.data.reason,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.case.cancelled,
      targetId: parsed.data.caseId,
      summary: "Cancelled offboarding case",
      reason: parsed.data.reason,
      metadata: { lifecycleEventId: result.eventId },
    };
  });
}

export async function scheduleHrOffboardingExitInterviewAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingExitInterviewScheduleForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await scheduleHrOffboardingExitInterview({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      scheduledAt: parsed.data.scheduledAt,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.exitInterview.scheduled,
      targetId: parsed.data.caseId,
      summary: "Scheduled exit interview",
    };
  });
}

export async function recordHrOffboardingExitInterviewFeedbackAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingExitInterviewFeedbackForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await recordHrOffboardingExitInterviewFeedback({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      feedback: parsed.data.feedback,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.exitInterview.feedbackRecorded,
      targetId: parsed.data.caseId,
      summary: "Recorded exit interview feedback",
    };
  });
}

export async function recordHrOffboardingRehireEligibilityAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingRehireForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await recordHrOffboardingRehireEligibility({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      rehireEligibility: parsed.data.rehireEligibility,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.rehire.recorded,
      targetId: parsed.data.caseId,
      summary: "Recorded rehire eligibility",
    };
  });
}

export async function triggerHrOffboardingVacancyAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingCaseActionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await triggerHrOffboardingVacancy({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.vacancy.triggered,
      targetId: parsed.data.caseId,
      summary: "Triggered vacancy reference",
    };
  });
}

export async function linkHrOffboardingDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingDocumentLinkForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    const result = await linkHrOffboardingDocument({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      documentKind: parsed.data.documentKind,
      employeeDocumentId: parsed.data.employeeDocumentId,
      externalReference: parsed.data.externalReference,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.document.linked,
      targetId: parsed.data.caseId,
      summary: "Linked exit document",
      metadata: { linkId: result.linkId },
    };
  });
}

export async function addHrOffboardingSettlementBlockerAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingSettlementBlockerForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    const result = await addHrOffboardingSettlementBlocker({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      blockerCode: parsed.data.blockerCode,
      title: parsed.data.title,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.settlement.blockerAdded,
      targetId: parsed.data.caseId,
      summary: "Added settlement blocker",
      metadata: { blockerId: result.blockerId },
    };
  });
}

export async function resolveHrOffboardingSettlementBlockerAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingSettlementBlockerResolveForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await resolveHrOffboardingSettlementBlocker({
      organizationId: organization.id,
      blockerId: parsed.data.blockerId,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.settlement.blockerResolved,
      targetId: parsed.data.blockerId,
      summary: "Resolved settlement blocker",
    };
  });
}

export async function markHrOffboardingSettlementReadyAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrOffboardingWrite();
  const parsed = parseHrOffboardingCaseActionForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeOffboardingMutation(organization.id, async () => {
    await markHrOffboardingSettlementReady({
      organizationId: organization.id,
      caseId: parsed.data.caseId,
      actorUserId: session.id,
    });
    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceOffboardingAuditActions.settlement.ready,
      targetId: parsed.data.caseId,
      summary: "Marked settlement ready for Payroll",
    };
  });
}
