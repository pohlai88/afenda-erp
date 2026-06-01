"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../../hr-suite-integration/server";
import {
  emitHrWorkforceEssAuditEvent,
  getHrWorkforceEssStore,
  listHrWorkforceEssIntegrationExposures,
  nextHrWorkforceEssId,
} from "../data/hr.workforce.ess-store.shared";
import { hrWorkforceEssAuditActions } from "../events/hr.workforce.ess.event";
import {
  requireHrWorkforceEssApprove,
  requireHrWorkforceEssRead,
  requireHrWorkforceEssWrite,
  type HrWorkforceEssExecutionGuard,
} from "../policies/hr.workforce.ess-access.policy.server";
import {
  HR_WORKFORCE_ESS_CLAIM_TYPES,
  HR_WORKFORCE_ESS_CONSENT_STATUSES,
  HR_WORKFORCE_ESS_DOCUMENT_TYPES,
  HR_WORKFORCE_ESS_LEAVE_TYPES,
  HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS,
} from "../schemas/hr.workforce.ess-constants.shared";
import {
  hrWorkforceEssExpenseClaimSchema,
  hrWorkforceEssLeaveRequestSchema,
  hrWorkforceEssProfileUpdateRequestSchema,
  hrWorkforceEssRequestTrackerSchema,
} from "../schemas/hr.workforce.ess.schema";

type ActionGuard = HrWorkforceEssExecutionGuard;

const profileUpdateSchema = z.object({
  employeeId: z.string().min(1).optional(),
  requestRef: z.string().min(1),
  fieldGroup: z.enum(HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS),
  sensitive: z.boolean().default(false),
});

const leaveRequestSchema = z.object({
  employeeId: z.string().min(1).optional(),
  requestRef: z.string().min(1),
  leaveType: z.enum(HR_WORKFORCE_ESS_LEAVE_TYPES),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  days: z.number().positive(),
});

const claimRequestSchema = z.object({
  employeeId: z.string().min(1).optional(),
  claimRef: z.string().min(1),
  claimType: z.enum(HR_WORKFORCE_ESS_CLAIM_TYPES),
  amount: z.number().nonnegative(),
  currency: z.string().min(3),
  receiptCount: z.number().int().nonnegative().default(0),
});

const documentAccessSchema = z.object({
  documentId: z.string().min(1),
  documentType: z.enum(HR_WORKFORCE_ESS_DOCUMENT_TYPES).optional(),
});

const decisionSchema = z.object({
  approvalId: z.string().min(1),
  decision: z.enum(["approved", "rejected", "returned"]),
  reason: z.string().min(1).optional(),
});

function actionFailure<T = void>(message: string, code: string) {
  return hrSuiteActionFailure<T>(message, { code });
}

function findSelfEmployeeId(guard: ActionGuard, store: {
  readonly employeeProfiles: readonly { readonly id: string; readonly userId: string }[];
}) {
  return (
    store.employeeProfiles.find((row) => row.userId === guard.session.id)?.id ??
    guard.session.id
  );
}

async function resolveWritableEmployeeId(input: {
  readonly guard: ActionGuard;
  readonly requestedEmployeeId?: string;
  readonly selfEmployeeId: string;
  readonly employeeIds: readonly string[];
}) {
  const visibleEmployeeIds = await input.guard.resolveVisibleEmployeeIds({
    selfEmployeeId: input.selfEmployeeId,
  });
  const candidate = input.requestedEmployeeId ?? input.selfEmployeeId;
  if (visibleEmployeeIds === null || visibleEmployeeIds.includes(candidate)) {
    return candidate;
  }
  throw new Error("Employee is outside the self-service access scope.");
}

export async function refreshHrWorkforceEssWorkbenchAction() {
  try {
    const guard = await requireHrWorkforceEssRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Employee Self-Service Portal.",
      "hr.ess.refresh_failed",
    );
  }
}

export async function requestHrWorkforceEssProfileUpdateAction(
  input: z.input<typeof profileUpdateSchema>,
) {
  try {
    const parsed = profileUpdateSchema.parse(input);
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const employeeId = await resolveWritableEmployeeId({
      guard,
      requestedEmployeeId: parsed.employeeId,
      selfEmployeeId: findSelfEmployeeId(guard, store),
      employeeIds: store.employeeProfiles.map((row) => row.id),
    });
    const row = hrWorkforceEssProfileUpdateRequestSchema.parse({
      id: nextHrWorkforceEssId("ess-profile-update", store.profileUpdates),
      organizationId: guard.organization.id,
      employeeId,
      requestRef: parsed.requestRef,
      fieldGroup: parsed.fieldGroup,
      sensitive: parsed.sensitive,
      status: parsed.sensitive ? "pending_approval" : "submitted",
      submittedAt: new Date().toISOString(),
      approverUserId: parsed.sensitive ? "user_hr_partner" : undefined,
    });
    store.profileUpdates.unshift(row);
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.profileUpdateRequested,
      actorId: guard.session.id,
      targetType: "profile_update",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Profile update ${row.requestRef} submitted for ${row.fieldGroup}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to request profile update.",
      "hr.ess.profile_update_failed",
    );
  }
}

export async function submitHrWorkforceEssLeaveRequestAction(
  input: z.input<typeof leaveRequestSchema>,
) {
  try {
    const parsed = leaveRequestSchema.parse(input);
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const employeeId = await resolveWritableEmployeeId({
      guard,
      requestedEmployeeId: parsed.employeeId,
      selfEmployeeId: findSelfEmployeeId(guard, store),
      employeeIds: store.employeeProfiles.map((row) => row.id),
    });
    const employee = store.employeeProfiles.find((row) => row.id === employeeId);
    const row = hrWorkforceEssLeaveRequestSchema.parse({
      id: nextHrWorkforceEssId("ess-leave", store.leaveRequests),
      organizationId: guard.organization.id,
      employeeId,
      requestRef: parsed.requestRef,
      leaveType: parsed.leaveType,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      days: parsed.days,
      status: "pending_approval",
      submittedAt: new Date().toISOString(),
      approverUserId: employee?.managerUserId ?? "manager_unassigned",
    });
    store.leaveRequests.unshift(row);
    store.requestTracker.unshift(
      hrWorkforceEssRequestTrackerSchema.parse({
        id: nextHrWorkforceEssId("ess-tracker", store.requestTracker),
        organizationId: guard.organization.id,
        employeeId,
        requestType: "leave",
        requestRef: row.requestRef,
        status: row.status,
        submittedAt: row.submittedAt,
        updatedAt: row.submittedAt,
      }),
    );
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.leaveRequested,
      actorId: guard.session.id,
      targetType: "leave_request",
      targetId: row.id,
      employeeId,
      summary: `Leave request ${row.requestRef} submitted.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to submit leave request.",
      "hr.ess.leave_submit_failed",
    );
  }
}

export async function amendHrWorkforceEssLeaveRequestAction(input: {
  readonly leaveRequestId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly days: number;
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.leaveRequests.find(
      (candidate) => candidate.id === input.leaveRequestId,
    );
    if (!row || !["submitted", "pending_approval", "returned"].includes(row.status)) {
      return actionFailure("Leave request cannot be amended.", "hr.ess.leave_amend_forbidden");
    }
    Object.assign(row, {
      startDate: input.startDate,
      endDate: input.endDate,
      days: input.days,
      status: "amended",
    });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.leaveAmended,
      actorId: guard.session.id,
      targetType: "leave_request",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Leave request ${row.requestRef} amended.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to amend leave request.", "hr.ess.leave_amend_failed");
  }
}

export async function cancelHrWorkforceEssLeaveRequestAction(input: {
  readonly leaveRequestId: string;
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.leaveRequests.find(
      (candidate) => candidate.id === input.leaveRequestId,
    );
    if (!row || ["approved", "rejected", "cancelled"].includes(row.status)) {
      return actionFailure("Leave request cannot be cancelled.", "hr.ess.leave_cancel_forbidden");
    }
    Object.assign(row, { status: "cancelled" });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.leaveCancelled,
      actorId: guard.session.id,
      targetType: "leave_request",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Leave request ${row.requestRef} cancelled.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to cancel leave request.", "hr.ess.leave_cancel_failed");
  }
}

export async function submitHrWorkforceEssClaimAction(
  input: z.input<typeof claimRequestSchema>,
) {
  try {
    const parsed = claimRequestSchema.parse(input);
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const employeeId = await resolveWritableEmployeeId({
      guard,
      requestedEmployeeId: parsed.employeeId,
      selfEmployeeId: findSelfEmployeeId(guard, store),
      employeeIds: store.employeeProfiles.map((row) => row.id),
    });
    const row = hrWorkforceEssExpenseClaimSchema.parse({
      id: nextHrWorkforceEssId("ess-claim", store.expenseClaims),
      organizationId: guard.organization.id,
      employeeId,
      claimRef: parsed.claimRef,
      claimType: parsed.claimType,
      amount: parsed.amount,
      currency: parsed.currency,
      status: "submitted",
      receiptCount: parsed.receiptCount,
      submittedAt: new Date().toISOString(),
    });
    store.expenseClaims.unshift(row);
    store.requestTracker.unshift(
      hrWorkforceEssRequestTrackerSchema.parse({
        id: nextHrWorkforceEssId("ess-tracker", store.requestTracker),
        organizationId: guard.organization.id,
        employeeId,
        requestType: "claim",
        requestRef: row.claimRef,
        status: row.status,
        submittedAt: row.submittedAt,
        updatedAt: row.submittedAt,
      }),
    );
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.claimSubmitted,
      actorId: guard.session.id,
      targetType: "claim",
      targetId: row.id,
      employeeId,
      summary: `Claim ${row.claimRef} submitted with ${row.receiptCount} receipt(s).`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to submit claim.", "hr.ess.claim_submit_failed");
  }
}

export async function uploadHrWorkforceEssSupportingDocumentAction(input: {
  readonly targetId: string;
  readonly title: string;
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const claim = store.expenseClaims.find((row) => row.id === input.targetId);
    if (!claim) {
      return actionFailure("Target request was not found.", "hr.ess.upload_target_missing");
    }
    claim.receiptCount += 1;
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.supportingDocumentUploaded,
      actorId: guard.session.id,
      targetType: "document",
      targetId: input.targetId,
      employeeId: claim.employeeId,
      summary: `Supporting document ${input.title} uploaded.`,
    });
    return { ok: true as const, data: claim };
  } catch {
    return actionFailure("Unable to upload supporting document.", "hr.ess.upload_failed");
  }
}

export async function downloadHrWorkforceEssDocumentAction(
  input: z.input<typeof documentAccessSchema>,
) {
  try {
    const parsed = documentAccessSchema.parse(input);
    const guard = await requireHrWorkforceEssRead();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const hrDocument = store.documents.find((row) => row.id === parsed.documentId);
    const payDocument = store.payDocuments.find(
      (row) => row.id === parsed.documentId,
    );
    const document = hrDocument ?? payDocument;
    if (!document || !document.authorized) {
      return actionFailure("Document is not authorized for download.", "hr.ess.document_forbidden");
    }
    Object.assign(document, { downloadedAt: new Date().toISOString() });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        payDocument
          ? hrWorkforceEssAuditActions.payDocumentAccessed
          : hrWorkforceEssAuditActions.documentAccessed,
      actorId: guard.session.id,
      targetType: payDocument ? "pay_document" : "document",
      targetId: document.id,
      employeeId: document.employeeId,
      summary: `Authorized document ${document.documentRef} accessed.`,
    });
    return { ok: true as const, data: { documentId: document.id } };
  } catch {
    return actionFailure("Unable to access document.", "hr.ess.document_access_failed");
  }
}

export async function acknowledgeHrWorkforceEssPolicyAction(input: {
  readonly acknowledgementId: string;
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.acknowledgements.find(
      (candidate) => candidate.id === input.acknowledgementId,
    );
    if (!row) {
      return actionFailure("Acknowledgement was not found.", "hr.ess.ack_missing");
    }
    Object.assign(row, {
      status: HR_WORKFORCE_ESS_CONSENT_STATUSES.includes("acknowledged")
        ? "acknowledged"
        : row.status,
      acknowledgedAt: new Date().toISOString(),
    });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.policyAcknowledged,
      actorId: guard.session.id,
      targetType: "acknowledgement",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Policy notice ${row.noticeRef} acknowledged.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to acknowledge policy.", "hr.ess.ack_failed");
  }
}

export async function completeHrWorkforceEssTaskAction(input: {
  readonly taskId: string;
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.assignedTasks.find((candidate) => candidate.id === input.taskId);
    if (!row) {
      return actionFailure("Task was not found.", "hr.ess.task_missing");
    }
    Object.assign(row, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.taskCompleted,
      actorId: guard.session.id,
      targetType: "task",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Task ${row.title} completed.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to complete task.", "hr.ess.task_complete_failed");
  }
}

export async function markHrWorkforceEssNotificationReadAction(input: {
  readonly notificationId: string;
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.notifications.find(
      (candidate) => candidate.id === input.notificationId,
    );
    if (!row) {
      return actionFailure("Notification was not found.", "hr.ess.notification_missing");
    }
    Object.assign(row, {
      status: "read",
      readAt: new Date().toISOString(),
    });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.notificationRead,
      actorId: guard.session.id,
      targetType: "notification",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Notification ${row.event} marked read.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to update notification.", "hr.ess.notification_failed");
  }
}

export async function decideHrWorkforceEssApprovalAction(
  input: z.input<typeof decisionSchema>,
) {
  try {
    const parsed = decisionSchema.parse(input);
    const guard = await requireHrWorkforceEssApprove();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.approvalInbox.find(
      (candidate) => candidate.id === parsed.approvalId,
    );
    if (!row) {
      return actionFailure("Approval was not found.", "hr.ess.approval_missing");
    }
    Object.assign(row, {
      status: parsed.decision,
      decisionReason: parsed.reason,
      decidedAt: new Date().toISOString(),
    });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.approvalDecided,
      actorId: guard.session.id,
      targetType: "approval",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Approval ${row.id} ${parsed.decision}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to decide approval.", "hr.ess.approval_failed");
  }
}

export async function captureHrWorkforceEssConsentAction(input: {
  readonly consentId: string;
  readonly status: "acknowledged" | "declined";
}) {
  try {
    const guard = await requireHrWorkforceEssWrite();
    const store = getHrWorkforceEssStore(guard.organization.id);
    const row = store.consentRecords.find(
      (candidate) => candidate.id === input.consentId,
    );
    if (!row) {
      return actionFailure("Consent record was not found.", "hr.ess.consent_missing");
    }
    Object.assign(row, {
      status: input.status,
      capturedAt: new Date().toISOString(),
    });
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.consentCaptured,
      actorId: guard.session.id,
      targetType: "consent",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Consent ${row.consentType} ${input.status}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to capture consent.", "hr.ess.consent_failed");
  }
}

export async function exportHrWorkforceEssIntegrationRefsAction() {
  try {
    const guard = await requireHrWorkforceEssRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Integration references are not available for this role.",
        "hr.ess.integration_forbidden",
      );
    }
    const store = getHrWorkforceEssStore(guard.organization.id);
    const data = listHrWorkforceEssIntegrationExposures(store);
    emitHrWorkforceEssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrWorkforceEssAuditActions.integrationExposed,
      actorId: guard.session.id,
      targetType: "access_log",
      targetId: "ess-integration-export",
      summary: "Employee self-service integration references exported.",
    });
    return { ok: true as const, data };
  } catch {
    return actionFailure(
      "Unable to export integration references.",
      "hr.ess.integration_failed",
    );
  }
}
