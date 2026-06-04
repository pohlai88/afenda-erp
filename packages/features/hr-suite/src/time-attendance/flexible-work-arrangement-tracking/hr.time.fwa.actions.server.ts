"use server";

import { type HrFwaRequestDecision } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { z } from "zod";

import {
  cancelHrFwaPendingRequest,
  decideHrFwaApprovalRequest,
  renewHrFwaApprovedArrangement,
  suspendHrFwaApprovedArrangement,
  terminateHrFwaApprovedArrangement,
} from "./hrs-hr-time-fwa-approval-server";
import { createHrFwaArrangementSchedulePattern } from "./hrs-hr-time-fwa-schedule-server";
import { upsertHrFwaApprovedRemoteLocation } from "./hrs-hr-time-fwa-location-server";
import {
  previewHrTimeFwaRequestEligibility,
  submitHrTimeFwaRequest,
} from "./hrs-hr-time-fwa-request-server";
import { hrTimeFwaAuditActions } from "./hrs-hr-time-fwa-workflow-events";
import { resolveHrFwaApproverContext } from "./hr.time.fwa-approver-context.shared.server";
import {
  assertHrTimeFwaCanInitiateForEmployee,
  requireHrFwaWrite,
  requireHrTimeFwaDecide,
  requireHrTimeFwaEmployeeSubmit,
  requireHrTimeFwaInitiate,
  requireHrTimeFwaRead,
} from "./hr.time.fwa-access.policy.server";
import {
  parseInitiateHrFwaRequestForm,
  parseSubmitHrFwaEmployeeRequestForm,
} from "./hr.time.fwa-request.schema";
import {
  cancelHrFwaRequestFormSchema,
  decideHrFwaRequestFormSchema,
  renewHrFwaArrangementFormSchema,
  suspendHrFwaArrangementFormSchema,
  terminateHrFwaArrangementFormSchema,
} from "./hr.time.fwa-workflow.schema";
import {
  createHrFwaSchedulePatternFormSchema,
  hrFwaSchedulePatternDetailsSchema,
} from "./hr.time.fwa-schedule.schema";
import { upsertHrFwaRemoteLocationFormSchema } from "./hr.time.fwa-location.schema";
import { finalizeHrTimeFwaMutation } from "./hr.time.fwa.mutation.shared.server";

function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return schema.safeParse(raw);
}

function parseSchedulePatternForm(formData: FormData) {
  const raw = formData.get("patternDetails");
  if (typeof raw === "string" && raw.trim()) {
    try {
      const patternDetails = hrFwaSchedulePatternDetailsSchema.parse(
        JSON.parse(raw),
      );
      return createHrFwaSchedulePatternFormSchema.safeParse({
        employeeId: formData.get("employeeId") ?? undefined,
        label: formData.get("label") ?? undefined,
        patternDetails,
      });
    } catch {
      return { success: false as const, error: new z.ZodError([]) };
    }
  }

  return createHrFwaSchedulePatternFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
}

/** HRM-FWA-004 — eligible employee submits a flexible work request. */
export async function submitHrTimeFwaRequestAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseSubmitHrFwaEmployeeRequestForm(formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeFwaEmployeeSubmit();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await submitHrTimeFwaRequest({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      employeeId: guard.selfEmployeeId,
      initiatorKind: "employee",
      initiatorEmployeeId: guard.selfEmployeeId,
      arrangementKind: parsed.data.arrangementKind,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      reason: parsed.data.reason,
      policyGroupCode: parsed.data.policyGroupCode,
      remoteLocationId: parsed.data.remoteLocationId,
      supportingDocumentId: parsed.data.supportingDocumentId,
      exceptionRequested: parsed.data.exceptionRequested,
      schedulePatternLabel: parsed.data.schedulePatternLabel,
      schedulePatternDetails: parsed.data.schedulePatternDetails,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.request.submitted,
      targetId: result.requestId,
      summary: "Flexible work arrangement request submitted",
      metadata: {
        arrangementKind: parsed.data.arrangementKind,
        employeeId: guard.selfEmployeeId,
        eligibility: result.eligibility,
        exceptionRequested:
          parsed.data.exceptionRequested ?? !result.eligibility.eligible,
      },
    };
  });
}

/** HRM-FWA-005 — manager or HR initiates a flexible work arrangement. */
export async function initiateHrTimeFwaByManagerOrHrAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseInitiateHrFwaRequestForm(formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeFwaInitiate();
  await assertHrTimeFwaCanInitiateForEmployee(guard, parsed.data.employeeId);

  const initiatorKind =
    parsed.data.initiatorKind === "hr" && guard.canWriteFwa
      ? "hr"
      : guard.canWriteFwa
        ? parsed.data.initiatorKind
        : "manager";

  if (initiatorKind === "hr") {
    await requireHrFwaWrite();
  }

  const approver = await resolveHrFwaApproverContext({
    organizationId: guard.organization.id,
    authUserId: guard.session.id,
    canWrite: guard.canWriteFwa,
  });

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await submitHrTimeFwaRequest({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      employeeId: parsed.data.employeeId,
      initiatorKind,
      initiatorEmployeeId: approver.actorManagerEmployeeIds[0] ?? null,
      arrangementKind: parsed.data.arrangementKind,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      reason: parsed.data.reason,
      policyGroupCode: parsed.data.policyGroupCode,
      remoteLocationId: parsed.data.remoteLocationId,
      supportingDocumentId: parsed.data.supportingDocumentId,
      exceptionRequested: parsed.data.exceptionRequested,
      schedulePatternLabel: parsed.data.schedulePatternLabel,
      schedulePatternDetails: parsed.data.schedulePatternDetails,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.request.submitted,
      targetId: result.requestId,
      summary: `Flexible work arrangement initiated by ${initiatorKind}`,
      metadata: {
        arrangementKind: parsed.data.arrangementKind,
        employeeId: parsed.data.employeeId,
        initiatorKind,
        eligibility: result.eligibility,
        exceptionRequested:
          parsed.data.exceptionRequested ?? !result.eligibility.eligible,
      },
    };
  });
}

export async function previewHrTimeFwaEligibilityAction(input: {
  employeeId: string;
  arrangementKind: string;
  policyGroupCode?: string;
  startDateIso: string;
  endDateIso?: string | null;
  remoteLocationId?: string | null;
  supportingDocumentId?: string | null;
  exceptionRequested?: boolean;
}): Promise<ActionResult<{ eligibility: Record<string, unknown> }>> {
  const guard = await requireHrTimeFwaRead();
  const approver = await resolveHrFwaApproverContext({
    organizationId: guard.organization.id,
    authUserId: guard.session.id,
    canWrite: guard.canWriteFwa,
  });

  if (
    input.employeeId !== approver.actorManagerEmployeeIds[0] &&
    !guard.canWriteFwa
  ) {
    await assertHrTimeFwaCanInitiateForEmployee(guard, input.employeeId);
  }

  const startDate = new Date(input.startDateIso);
  if (Number.isNaN(startDate.getTime())) {
    return actionFailure("Start date is invalid.");
  }

  const endDate = input.endDateIso ? new Date(input.endDateIso) : null;
  if (endDate && Number.isNaN(endDate.getTime())) {
    return actionFailure("End date is invalid.");
  }

  const eligibility = await previewHrTimeFwaRequestEligibility({
    organizationId: guard.organization.id,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind as never,
    policyGroupCode: input.policyGroupCode,
    startDate,
    endDate,
    remoteLocationId: input.remoteLocationId,
    supportingDocumentId: input.supportingDocumentId,
    exceptionRequested: input.exceptionRequested,
  });

  return { ok: true, data: { eligibility } };
}

export async function decideHrFwaRequestAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(decideHrFwaRequestFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeFwaDecide();
  const {
    requestId,
    decision,
    rejectionReason,
    decisionNote,
    returnedNote,
    exceptionReason,
  } = parsed.data;

  const auditAction =
    decision === "approve"
      ? hrTimeFwaAuditActions.approval.approved
      : decision === "reject"
        ? hrTimeFwaAuditActions.approval.rejected
        : decision === "return"
          ? hrTimeFwaAuditActions.approval.returned
          : hrTimeFwaAuditActions.approval.exceptionApproved;

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await decideHrFwaApprovalRequest({
      organizationId: guard.organization.id,
      requestId,
      decision: decision as HrFwaRequestDecision,
      rejectionReason,
      decisionNote,
      returnedNote,
      exceptionReason,
      actorAuthUserId: guard.session.id,
      actorCanHrApprove: guard.actorCanHrApprove,
      actorCanDepartmentApprove: guard.actorCanDepartmentApprove,
      actorManagerEmployeeIds: guard.actorManagerEmployeeIds,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: auditAction,
      targetId: result.requestId,
      summary: `Flexible work ${decision}`,
      ...(decision === "reject" && rejectionReason
        ? { reason: rejectionReason }
        : {}),
      ...(decision === "exception_approve" && exceptionReason
        ? { reason: exceptionReason }
        : {}),
      metadata: {
        status: result.status,
        decision,
        arrangementId: result.arrangementId,
      },
    };
  });
}

export async function suspendHrFwaArrangementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(suspendHrFwaArrangementFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeFwaDecide();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await suspendHrFwaApprovedArrangement({
      organizationId: guard.organization.id,
      arrangementId: parsed.data.arrangementId,
      actorAuthUserId: guard.session.id,
      suspensionReason: parsed.data.suspensionReason,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.arrangement.suspended,
      targetId: result.arrangementId,
      summary: "Flexible work arrangement suspended",
      reason: parsed.data.suspensionReason,
    };
  });
}

export async function terminateHrFwaArrangementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(terminateHrFwaArrangementFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeFwaDecide();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await terminateHrFwaApprovedArrangement({
      organizationId: guard.organization.id,
      arrangementId: parsed.data.arrangementId,
      actorAuthUserId: guard.session.id,
      terminationReason: parsed.data.terminationReason,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.arrangement.terminated,
      targetId: result.arrangementId,
      summary: "Flexible work arrangement terminated",
      reason: parsed.data.terminationReason,
    };
  });
}

export async function renewHrFwaArrangementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(renewHrFwaArrangementFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeFwaDecide();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await renewHrFwaApprovedArrangement({
      organizationId: guard.organization.id,
      arrangementId: parsed.data.arrangementId,
      actorAuthUserId: guard.session.id,
      newEffectiveTo: parsed.data.newEffectiveTo,
      renewalReason: parsed.data.renewalReason,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.arrangement.renewed,
      targetId: result.arrangementId,
      summary: "Flexible work arrangement renewed",
      reason: parsed.data.renewalReason,
      metadata: { newEffectiveTo: parsed.data.newEffectiveTo.toISOString() },
    };
  });
}

export async function cancelHrFwaRequestAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(cancelHrFwaRequestFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrFwaWrite();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await cancelHrFwaPendingRequest({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.request.cancelled,
      targetId: result.requestId,
      summary: "Flexible work request cancelled",
    };
  });
}

export async function createHrFwaSchedulePatternAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseSchedulePatternForm(formData);
  if (!parsed.success) {
    return actionFailure("Schedule pattern details are invalid.");
  }

  const guard = await requireHrFwaWrite();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await createHrFwaArrangementSchedulePattern({
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      label: parsed.data.label,
      patternDetails: parsed.data.patternDetails,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeFwaAuditActions.schedule.created,
      targetId: result.schedulePatternId,
      summary: "Flexible work schedule pattern created",
    };
  });
}

export async function upsertHrFwaRemoteLocationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(upsertHrFwaRemoteLocationFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrFwaWrite();

  return finalizeHrTimeFwaMutation(guard.organization.id, async () => {
    const result = await upsertHrFwaApprovedRemoteLocation({
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      remoteLocationId: parsed.data.remoteLocationId,
      label: parsed.data.label,
      locationKind: parsed.data.locationKind,
      countryCode: parsed.data.countryCode,
      regionCode: parsed.data.regionCode,
      addressLine: parsed.data.addressLine,
      isApproved: parsed.data.isApproved,
      approvedByAuthUserId: parsed.data.isApproved ? guard.session.id : null,
      restrictionNotes: parsed.data.restrictionNotes,
      restrictions: parsed.data.restrictions,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: parsed.data.isApproved
        ? hrTimeFwaAuditActions.location.approved
        : hrTimeFwaAuditActions.location.upserted,
      targetId: result.remoteLocationId,
      summary: parsed.data.isApproved
        ? "Remote work location approved"
        : "Remote work location saved",
    };
  });
}
