"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../../hr-suite-integration/server";
import {
  emitHrWorkforceEssAuditEvent,
  getHrWorkforceEssStore,
  listHrWorkforceEssIntegrationExposures,
  nextHrWorkforceEssId,
  type HrWorkforceEssStore,
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
  HR_WORKFORCE_ESS_DOCUMENT_TYPES,
  HR_WORKFORCE_ESS_LEAVE_TYPES,
  HR_WORKFORCE_ESS_PAY_DOCUMENT_TYPES,
  HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS,
} from "../schemas/hr.workforce.ess-constants.shared";
import {
  hrWorkforceEssApprovalInboxItemSchema,
  hrWorkforceEssExpenseClaimSchema,
  hrWorkforceEssLeaveRequestSchema,
  hrWorkforceEssNotificationSchema,
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

const isoDateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function dateValue(value: string) {
  return Date.parse(`${value}T00:00:00.000Z`);
}

const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1).optional(),
    requestRef: z.string().min(1),
    leaveType: z.enum(HR_WORKFORCE_ESS_LEAVE_TYPES),
    startDate: isoDateOnlySchema,
    endDate: isoDateOnlySchema,
    days: z.number().positive(),
  })
  .refine((value) => dateValue(value.endDate) >= dateValue(value.startDate), {
    message: "Leave end date must be on or after the start date.",
    path: ["endDate"],
  });

const claimRequestSchema = z.object({
  employeeId: z.string().min(1).optional(),
  claimRef: z.string().min(1),
  claimType: z.enum(HR_WORKFORCE_ESS_CLAIM_TYPES),
  amount: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  receiptCount: z.number().int().nonnegative().default(0),
});

const documentDownloadTypeSchema = z.enum([
  ...HR_WORKFORCE_ESS_DOCUMENT_TYPES,
  ...HR_WORKFORCE_ESS_PAY_DOCUMENT_TYPES,
]);

const documentAccessSchema = z.object({
  documentId: z.string().min(1),
  documentType: documentDownloadTypeSchema.optional(),
});

const decisionSchema = z
  .object({
    approvalId: z.string().min(1),
    decision: z.enum(["approved", "rejected", "returned"]),
    reason: z.string().min(1).optional(),
  })
  .refine(
    (value) =>
      value.decision === "approved" ||
      Boolean(value.reason?.trim().length),
    {
      message: "Rejected or returned approvals require a reason.",
      path: ["reason"],
    },
  );

function actionFailure<T = void>(message: string, code: string) {
  return hrSuiteActionFailure<T>(message, { code });
}

function employeeAccessFailure<T = void>() {
  return actionFailure<T>(
    "Employee record is outside the self-service access scope.",
    "hr.ess.employee_forbidden",
  );
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
  if (
    input.employeeIds.includes(candidate) &&
    (visibleEmployeeIds === null || visibleEmployeeIds.includes(candidate))
  ) {
    return candidate;
  }
  return null;
}

async function canAccessEmployeeRecord(input: {
  readonly guard: ActionGuard;
  readonly store: HrWorkforceEssStore;
  readonly employeeId: string;
}) {
  const visibleEmployeeIds = await input.guard.resolveVisibleEmployeeIds({
    selfEmployeeId: findSelfEmployeeId(input.guard, input.store),
  });
  return (
    visibleEmployeeIds === null ||
    visibleEmployeeIds.includes(input.employeeId)
  );
}

async function canDecideApproval(input: {
  readonly guard: ActionGuard;
  readonly store: HrWorkforceEssStore;
  readonly approval: { readonly approverUserId: string; readonly employeeId: string };
}) {
  if (input.approval.approverUserId === input.guard.session.id) {
    return true;
  }

  const visibleEmployeeIds = await input.guard.resolveVisibleEmployeeIds({
    selfEmployeeId: findSelfEmployeeId(input.guard, input.store),
  });
  return visibleEmployeeIds === null;
}

function employeeDisplayName(input: {
  readonly store: HrWorkforceEssStore;
  readonly employeeId: string;
}) {
  return (
    input.store.employeeProfiles.find((row) => row.id === input.employeeId)
      ?.displayName ?? input.employeeId
  );
}

function employeeManagerUserId(input: {
  readonly store: HrWorkforceEssStore;
  readonly employeeId: string;
}) {
  return (
    input.store.employeeProfiles.find((row) => row.id === input.employeeId)
      ?.managerUserId ?? "manager_unassigned"
  );
}

function enqueueNotification(input: {
  readonly store: HrWorkforceEssStore;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly event:
    | "request_submitted"
    | "request_approved"
    | "request_rejected"
    | "request_returned"
    | "task_required";
  readonly message: string;
}) {
  const row = hrWorkforceEssNotificationSchema.parse({
    id: nextHrWorkforceEssId("ess-notification", input.store.notifications),
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    event: input.event,
    status: "delivered",
    channel: "portal",
    message: input.message,
    sentAt: new Date().toISOString(),
  });
  input.store.notifications.unshift(row);
  return row;
}

function enqueueApproval(input: {
  readonly store: HrWorkforceEssStore;
  readonly organizationId: string;
  readonly approvalType: "profile_update" | "leave" | "claim" | "task_completion";
  readonly targetId: string;
  readonly employeeId: string;
  readonly approverUserId: string;
  readonly submittedAt: string;
}) {
  const row = hrWorkforceEssApprovalInboxItemSchema.parse({
    id: nextHrWorkforceEssId("ess-approval", input.store.approvalInbox),
    organizationId: input.organizationId,
    approvalType: input.approvalType,
    targetId: input.targetId,
    employeeId: input.employeeId,
    employeeName: employeeDisplayName(input),
    approverUserId: input.approverUserId,
    status: "pending_approval",
    submittedAt: input.submittedAt,
  });
  input.store.approvalInbox.unshift(row);
  return row;
}

function updateRequestTracker(input: {
  readonly store: HrWorkforceEssStore;
  readonly employeeId: string;
  readonly requestRef: string;
  readonly requestType: "profile_update" | "leave" | "claim";
  readonly status: "submitted" | "pending_approval" | "approved" | "rejected" | "returned" | "cancelled" | "amended";
  readonly updatedAt: string;
  readonly reason?: string;
}) {
  for (const row of input.store.requestTracker) {
    if (
      row.employeeId === input.employeeId &&
      row.requestRef === input.requestRef &&
      row.requestType === input.requestType
    ) {
      Object.assign(row, {
        status: input.status,
        updatedAt: input.updatedAt,
        rejectionReason: input.status === "rejected" ? input.reason : undefined,
        correctionGuidance:
          input.status === "returned" ? input.reason : undefined,
      });
    }
  }
}

function targetDecisionFields(input: {
  readonly decision: "approved" | "rejected" | "returned";
  readonly reason?: string;
  readonly decidedAt: string;
}) {
  return {
    status: input.decision,
    decidedAt: input.decidedAt,
    rejectionReason: input.decision === "rejected" ? input.reason : undefined,
    correctionGuidance: input.decision === "returned" ? input.reason : undefined,
  };
}

function syncApprovalDecisionTarget(input: {
  readonly store: HrWorkforceEssStore;
  readonly approval: {
    readonly approvalType: string;
    readonly targetId: string;
    readonly employeeId: string;
  };
  readonly decision: "approved" | "rejected" | "returned";
  readonly reason?: string;
  readonly decidedAt: string;
}) {
  const decisionFields = targetDecisionFields(input);

  if (input.approval.approvalType === "profile_update") {
    const target = input.store.profileUpdates.find(
      (row) => row.id === input.approval.targetId,
    );
    if (!target) return;
    Object.assign(target, decisionFields);
    updateRequestTracker({
      store: input.store,
      employeeId: target.employeeId,
      requestRef: target.requestRef,
      requestType: "profile_update",
      status: input.decision,
      updatedAt: input.decidedAt,
      reason: input.reason,
    });
    return;
  }

  if (input.approval.approvalType === "leave") {
    const target = input.store.leaveRequests.find(
      (row) => row.id === input.approval.targetId,
    );
    if (!target) return;
    Object.assign(target, decisionFields);
    updateRequestTracker({
      store: input.store,
      employeeId: target.employeeId,
      requestRef: target.requestRef,
      requestType: "leave",
      status: input.decision,
      updatedAt: input.decidedAt,
      reason: input.reason,
    });
    return;
  }

  if (input.approval.approvalType === "claim") {
    const target = input.store.expenseClaims.find(
      (row) => row.id === input.approval.targetId,
    );
    if (!target) return;
    Object.assign(target, {
      status: input.decision,
      rejectionReason:
        input.decision === "rejected" ? input.reason : undefined,
      correctionGuidance:
        input.decision === "returned" ? input.reason : undefined,
    });
    updateRequestTracker({
      store: input.store,
      employeeId: target.employeeId,
      requestRef: target.claimRef,
      requestType: "claim",
      status: input.decision,
      updatedAt: input.decidedAt,
      reason: input.reason,
    });
  }
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
    if (!employeeId) {
      return employeeAccessFailure();
    }
    const submittedAt = new Date().toISOString();
    const approverUserId = parsed.sensitive ? "user_hr_partner" : undefined;
    const row = hrWorkforceEssProfileUpdateRequestSchema.parse({
      id: nextHrWorkforceEssId("ess-profile-update", store.profileUpdates),
      organizationId: guard.organization.id,
      employeeId,
      requestRef: parsed.requestRef,
      fieldGroup: parsed.fieldGroup,
      sensitive: parsed.sensitive,
      status: parsed.sensitive ? "pending_approval" : "submitted",
      submittedAt,
      approverUserId,
    });
    store.profileUpdates.unshift(row);
    store.requestTracker.unshift(
      hrWorkforceEssRequestTrackerSchema.parse({
        id: nextHrWorkforceEssId("ess-tracker", store.requestTracker),
        organizationId: guard.organization.id,
        employeeId,
        requestType: "profile_update",
        requestRef: row.requestRef,
        status: row.status,
        submittedAt,
        updatedAt: submittedAt,
      }),
    );
    if (approverUserId) {
      enqueueApproval({
        store,
        organizationId: guard.organization.id,
        approvalType: "profile_update",
        targetId: row.id,
        employeeId,
        approverUserId,
        submittedAt,
      });
    }
    enqueueNotification({
      store,
      organizationId: guard.organization.id,
      employeeId,
      event: "request_submitted",
      message: `Profile update ${row.requestRef} was submitted.`,
    });
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
    if (!employeeId) {
      return employeeAccessFailure();
    }
    const submittedAt = new Date().toISOString();
    const approverUserId = employeeManagerUserId({ store, employeeId });
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
      submittedAt,
      approverUserId,
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
        submittedAt,
        updatedAt: submittedAt,
      }),
    );
    enqueueApproval({
      store,
      organizationId: guard.organization.id,
      approvalType: "leave",
      targetId: row.id,
      employeeId,
      approverUserId,
      submittedAt,
    });
    enqueueNotification({
      store,
      organizationId: guard.organization.id,
      employeeId,
      event: "request_submitted",
      message: `Leave request ${row.requestRef} was submitted.`,
    });
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
    if (!(await canAccessEmployeeRecord({ guard, store, employeeId: row.employeeId }))) {
      return employeeAccessFailure();
    }
    Object.assign(row, {
      startDate: input.startDate,
      endDate: input.endDate,
      days: input.days,
      status: "amended",
    });
    updateRequestTracker({
      store,
      employeeId: row.employeeId,
      requestRef: row.requestRef,
      requestType: "leave",
      status: "amended",
      updatedAt: new Date().toISOString(),
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
    if (!(await canAccessEmployeeRecord({ guard, store, employeeId: row.employeeId }))) {
      return employeeAccessFailure();
    }
    Object.assign(row, { status: "cancelled" });
    updateRequestTracker({
      store,
      employeeId: row.employeeId,
      requestRef: row.requestRef,
      requestType: "leave",
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });
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
    if (!employeeId) {
      return employeeAccessFailure();
    }
    const submittedAt = new Date().toISOString();
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
      submittedAt,
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
        submittedAt,
        updatedAt: submittedAt,
      }),
    );
    enqueueApproval({
      store,
      organizationId: guard.organization.id,
      approvalType: "claim",
      targetId: row.id,
      employeeId,
      approverUserId: employeeManagerUserId({ store, employeeId }),
      submittedAt,
    });
    enqueueNotification({
      store,
      organizationId: guard.organization.id,
      employeeId,
      event: "request_submitted",
      message: `Claim ${row.claimRef} was submitted.`,
    });
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
    if (
      !(await canAccessEmployeeRecord({
        guard,
        store,
        employeeId: claim.employeeId,
      }))
    ) {
      return employeeAccessFailure();
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
    if (
      parsed.documentType &&
      document.documentType !== parsed.documentType
    ) {
      return actionFailure(
        "Document type is not authorized for this download.",
        "hr.ess.document_type_forbidden",
      );
    }
    if (
      !(await canAccessEmployeeRecord({
        guard,
        store,
        employeeId: document.employeeId,
      }))
    ) {
      return employeeAccessFailure();
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
    if (!(await canAccessEmployeeRecord({ guard, store, employeeId: row.employeeId }))) {
      return employeeAccessFailure();
    }
    Object.assign(row, {
      status: "acknowledged",
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
    if (!(await canAccessEmployeeRecord({ guard, store, employeeId: row.employeeId }))) {
      return employeeAccessFailure();
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
    if (!(await canAccessEmployeeRecord({ guard, store, employeeId: row.employeeId }))) {
      return employeeAccessFailure();
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
    if (row.status !== "pending_approval") {
      return actionFailure(
        "Approval has already been decided.",
        "hr.ess.approval_not_pending",
      );
    }
    if (!(await canDecideApproval({ guard, store, approval: row }))) {
      return employeeAccessFailure();
    }
    const decidedAt = new Date().toISOString();
    const reason = parsed.reason?.trim();
    Object.assign(row, {
      status: parsed.decision,
      decisionReason: reason,
      decidedAt,
    });
    syncApprovalDecisionTarget({
      store,
      approval: row,
      decision: parsed.decision,
      reason,
      decidedAt,
    });
    enqueueNotification({
      store,
      organizationId: guard.organization.id,
      employeeId: row.employeeId,
      event:
        parsed.decision === "approved"
          ? "request_approved"
          : parsed.decision === "rejected"
            ? "request_rejected"
            : "request_returned",
      message: `Request approval ${row.id} was ${parsed.decision}.`,
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
    if (!(await canAccessEmployeeRecord({ guard, store, employeeId: row.employeeId }))) {
      return employeeAccessFailure();
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
