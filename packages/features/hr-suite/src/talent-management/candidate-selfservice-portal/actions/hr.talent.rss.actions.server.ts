"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../../hr-suite-integration/server";
import {
  emitHrTalentRssAuditEvent,
  getHrTalentRssStore,
  listHrTalentRssIntegrationExposures,
  nextHrTalentRssId,
} from "../data/hr.talent.rss-store.shared";
import { hrTalentRssAuditActions } from "../events";
import {
  requireHrTalentRssApprove,
  requireHrTalentRssRead,
  requireHrTalentRssWrite,
} from "../policies/hr.talent.rss-access.policy.server";
import {
  hrTalentRssApplicationSchema,
  hrTalentRssCandidateProfileSchema,
  hrTalentRssCandidateReviewSchema,
  hrTalentRssDocumentSubmissionSchema,
  hrTalentRssPreEmploymentFormSchema,
  hrTalentRssRequisitionRequestSchema,
  hrTalentRssRetentionActionSchema,
  hrTalentRssScorecardSchema,
  type HrTalentRssApplicationInput,
  type HrTalentRssCandidateProfileInput,
  type HrTalentRssCandidateReviewInput,
  type HrTalentRssDocumentSubmissionInput,
  type HrTalentRssPreEmploymentFormInput,
  type HrTalentRssRequisitionRequestInput,
  type HrTalentRssRetentionActionInput,
  type HrTalentRssScorecardInput,
} from "../schemas";

type CandidateProfileActionInput = Omit<
  HrTalentRssCandidateProfileInput,
  | "id"
  | "organizationId"
  | "accountStatus"
  | "profileStatus"
  | "profileUpdatedAt"
>;
type ApplicationActionInput = Omit<
  HrTalentRssApplicationInput,
  "id" | "organizationId" | "status" | "submittedAt" | "withdrawnAt"
>;
type DocumentActionInput = Omit<
  HrTalentRssDocumentSubmissionInput,
  "id" | "organizationId" | "submittedAt" | "verifiedAt"
>;
type FormActionInput = Omit<
  HrTalentRssPreEmploymentFormInput,
  "id" | "organizationId" | "submittedAt" | "reviewedAt" | "status"
>;
type RequisitionRequestActionInput = Omit<
  HrTalentRssRequisitionRequestInput,
  "id" | "organizationId" | "submittedAt" | "decidedAt" | "status"
>;
type CandidateReviewActionInput = Omit<
  HrTalentRssCandidateReviewInput,
  "id" | "organizationId" | "reviewedAt"
>;
type ScorecardActionInput = Omit<
  HrTalentRssScorecardInput,
  "id" | "organizationId" | "status" | "submittedAt"
>;
type RetentionActionInput = Omit<
  HrTalentRssRetentionActionInput,
  "id" | "organizationId" | "performedAt" | "performedByUserId"
>;

const idSchema = z.object({ id: z.string().trim().min(1) });
const interviewResponseSchema = z.object({
  interviewId: z.string().trim().min(1),
  response: z.enum(["confirmed", "reschedule_requested", "no_show"]),
});
const assessmentAccessSchema = z.object({
  assessmentId: z.string().trim().min(1),
});
const offerResponseSchema = z.object({
  offerId: z.string().trim().min(1),
  response: z.enum(["viewed", "accepted", "declined"]),
});
const approvalDecisionSchema = z.object({
  approvalId: z.string().trim().min(1),
  status: z.enum([
    "approved",
    "rejected",
    "returned",
    "clarification_requested",
  ]),
  decisionComment: z.string().trim().optional(),
});
const taskUpdateSchema = z.object({
  taskId: z.string().trim().min(1),
  status: z.enum(["pending", "in_progress", "completed", "overdue", "blocked"]),
});
const consentSchema = z.object({
  candidateId: z.string().trim().min(1),
  consentStatus: z.enum(["captured", "withdrawn", "expired"]),
});

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrTalentRssWorkbenchAction() {
  try {
    const guard = await requireHrTalentRssRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Candidate Self-Service Portal.",
      "hr.rss.refresh_failed",
    );
  }
}

export async function createHrTalentRssCandidateProfileAction(
  input: CandidateProfileActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssCandidateProfileSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-candidate", store.candidateProfiles),
      organizationId: guard.organization.id,
      accountStatus: "active",
      profileStatus: "complete",
      profileUpdatedAt: new Date().toISOString(),
    });
    store.candidateProfiles.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.candidateProfileCreated,
      actorId: guard.session.id,
      targetType: "candidate_profile",
      targetId: row.id,
      candidateId: row.id,
      summary: `Created candidate profile ${row.candidateRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create candidate profile.",
      "hr.rss.profile_create_failed",
    );
  }
}

export async function submitHrTalentRssApplicationAction(
  input: ApplicationActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssApplicationSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-application", store.applications),
      organizationId: guard.organization.id,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    store.applications.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: row.internalApplication
        ? hrTalentRssAuditActions.internalApplicationSubmitted
        : hrTalentRssAuditActions.applicationSubmitted,
      actorId: guard.session.id,
      targetType: "application",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.id,
      summary: `Submitted application ${row.applicationRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to submit application.",
      "hr.rss.application_submit_failed",
    );
  }
}

export async function withdrawHrTalentRssApplicationAction(input: {
  readonly id: string;
}) {
  try {
    const parsed = idSchema.parse(input);
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.applications.find((candidate) => candidate.id === parsed.id);
    if (!row) {
      return actionFailure(
        "Application was not found.",
        "hr.rss.application_missing",
      );
    }
    Object.assign(row, {
      status: "withdrawn" as const,
      withdrawnAt: new Date().toISOString(),
    });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.applicationWithdrawn,
      actorId: guard.session.id,
      targetType: "application",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.id,
      summary: `Withdrew application ${row.applicationRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to withdraw application.",
      "hr.rss.application_withdraw_failed",
    );
  }
}

export async function uploadHrTalentRssDocumentAction(
  input: DocumentActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssDocumentSubmissionSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-document", store.documents),
      organizationId: guard.organization.id,
      submittedAt: new Date().toISOString(),
    });
    store.documents.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.documentUploaded,
      actorId: guard.session.id,
      targetType: "document",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Uploaded candidate document ${row.title}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to upload candidate document.",
      "hr.rss.document_upload_failed",
    );
  }
}

export async function respondHrTalentRssInterviewAction(input: {
  readonly interviewId: string;
  readonly response: "confirmed" | "reschedule_requested" | "no_show";
}) {
  try {
    const parsed = interviewResponseSchema.parse(input);
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.interviews.find(
      (candidate) => candidate.id === parsed.interviewId,
    );
    if (!row) {
      return actionFailure("Interview was not found.", "hr.rss.interview_missing");
    }
    if (parsed.response === "reschedule_requested" && !row.rescheduleEnabled) {
      return actionFailure(
        "Interview reschedule is not enabled.",
        "hr.rss.interview_reschedule_disabled",
      );
    }
    Object.assign(row, { status: parsed.response });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        parsed.response === "reschedule_requested"
          ? hrTalentRssAuditActions.interviewRescheduleRequested
          : hrTalentRssAuditActions.interviewResponded,
      actorId: guard.session.id,
      targetType: "interview",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Interview response recorded as ${parsed.response}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to respond to interview.",
      "hr.rss.interview_response_failed",
    );
  }
}

export async function accessHrTalentRssAssessmentAction(input: {
  readonly assessmentId: string;
}) {
  try {
    const parsed = assessmentAccessSchema.parse(input);
    const guard = await requireHrTalentRssRead();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.assessments.find(
      (candidate) => candidate.id === parsed.assessmentId,
    );
    if (!row) {
      return actionFailure(
        "Assessment was not found.",
        "hr.rss.assessment_missing",
      );
    }
    Object.assign(row, { status: "accessed" as const });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.assessmentAccessed,
      actorId: guard.session.id,
      targetType: "assessment",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Assessment ${row.assessmentName} accessed.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to access assessment.",
      "hr.rss.assessment_access_failed",
    );
  }
}

export async function submitHrTalentRssPreEmploymentFormAction(
  input: FormActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssPreEmploymentFormSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-form", store.preEmploymentForms),
      organizationId: guard.organization.id,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    store.preEmploymentForms.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.preEmploymentFormSubmitted,
      actorId: guard.session.id,
      targetType: "form",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Submitted pre-employment form ${row.formType}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to submit pre-employment form.",
      "hr.rss.form_submit_failed",
    );
  }
}

export async function respondHrTalentRssOfferAction(input: {
  readonly offerId: string;
  readonly response: "viewed" | "accepted" | "declined";
}) {
  try {
    const parsed = offerResponseSchema.parse(input);
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.offers.find((candidate) => candidate.id === parsed.offerId);
    if (!row) {
      return actionFailure("Offer was not found.", "hr.rss.offer_missing");
    }
    Object.assign(row, {
      status: parsed.response,
      documentAcknowledged:
        parsed.response === "viewed" ? true : row.documentAcknowledged,
      candidateRespondedAt: new Date().toISOString(),
    });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.offerResponded,
      actorId: guard.session.id,
      targetType: "offer",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Offer ${row.offerRef} response recorded as ${parsed.response}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to respond to offer.",
      "hr.rss.offer_response_failed",
    );
  }
}

export async function submitHrTalentRssRequisitionRequestAction(
  input: RequisitionRequestActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssRequisitionRequestSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-req-request", store.requisitionRequests),
      organizationId: guard.organization.id,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
    store.requisitionRequests.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.requisitionRequestSubmitted,
      actorId: guard.session.id,
      targetType: "requisition_request",
      targetId: row.id,
      summary: `Submitted requisition request ${row.requestRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to submit requisition request.",
      "hr.rss.requisition_submit_failed",
    );
  }
}

export async function reviewHrTalentRssCandidateAction(
  input: CandidateReviewActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssCandidateReviewSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-review", store.candidateReviews),
      organizationId: guard.organization.id,
      reviewedAt: new Date().toISOString(),
    });
    store.candidateReviews.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.candidateReviewed,
      actorId: guard.session.id,
      targetType: "candidate_review",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Candidate review decision recorded as ${row.decision}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to review candidate.",
      "hr.rss.candidate_review_failed",
    );
  }
}

export async function submitHrTalentRssScorecardAction(
  input: ScorecardActionInput,
) {
  try {
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssScorecardSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-scorecard", store.scorecards),
      organizationId: guard.organization.id,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    store.scorecards.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.scorecardSubmitted,
      actorId: guard.session.id,
      targetType: "scorecard",
      targetId: row.id,
      applicationId: row.applicationId,
      summary: `Submitted scorecard for application ${row.applicationId}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to submit scorecard.",
      "hr.rss.scorecard_submit_failed",
    );
  }
}

export async function decideHrTalentRssApprovalAction(input: {
  readonly approvalId: string;
  readonly status:
    | "approved"
    | "rejected"
    | "returned"
    | "clarification_requested";
  readonly decisionComment?: string;
}) {
  try {
    const parsed = approvalDecisionSchema.parse(input);
    const guard = await requireHrTalentRssApprove();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.approvals.find(
      (candidate) => candidate.id === parsed.approvalId,
    );
    if (!row) {
      return actionFailure("Approval was not found.", "hr.rss.approval_missing");
    }
    Object.assign(row, {
      status: parsed.status,
      decisionComment: parsed.decisionComment,
      decidedAt: new Date().toISOString(),
    });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.approvalDecided,
      actorId: guard.session.id,
      targetType: "approval",
      targetId: row.id,
      summary: `Approval ${row.id} decided as ${parsed.status}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to decide approval.",
      "hr.rss.approval_decision_failed",
    );
  }
}

export async function updateHrTalentRssTaskAction(input: {
  readonly taskId: string;
  readonly status: "pending" | "in_progress" | "completed" | "overdue" | "blocked";
}) {
  try {
    const parsed = taskUpdateSchema.parse(input);
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.roleTasks.find(
      (candidate) => candidate.id === parsed.taskId,
    );
    if (!row) {
      return actionFailure("Task was not found.", "hr.rss.task_missing");
    }
    Object.assign(row, { status: parsed.status });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.taskUpdated,
      actorId: guard.session.id,
      targetType: "role_task",
      targetId: row.id,
      candidateId: row.candidateId,
      applicationId: row.applicationId,
      summary: `Updated portal task ${row.title} to ${parsed.status}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure("Unable to update task.", "hr.rss.task_update_failed");
  }
}

export async function captureHrTalentRssConsentAction(input: {
  readonly candidateId: string;
  readonly consentStatus: "captured" | "withdrawn" | "expired";
}) {
  try {
    const parsed = consentSchema.parse(input);
    const guard = await requireHrTalentRssWrite();
    const store = getHrTalentRssStore(guard.organization.id);
    const row = store.privacyRecords.find(
      (candidate) => candidate.candidateId === parsed.candidateId,
    );
    if (!row) {
      return actionFailure(
        "Privacy record was not found.",
        "hr.rss.privacy_missing",
      );
    }
    Object.assign(row, {
      consentStatus: parsed.consentStatus,
      consentCapturedAt:
        parsed.consentStatus === "captured"
          ? new Date().toISOString()
          : row.consentCapturedAt,
    });
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.consentCaptured,
      actorId: guard.session.id,
      targetType: "privacy",
      targetId: row.id,
      candidateId: row.candidateId,
      summary: `Candidate consent status changed to ${parsed.consentStatus}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to capture consent.",
      "hr.rss.consent_capture_failed",
    );
  }
}

export async function recordHrTalentRssRetentionAction(
  input: RetentionActionInput,
) {
  try {
    const guard = await requireHrTalentRssApprove();
    if (!guard.canReadRestricted) {
      return actionFailure(
        "Restricted privacy access is required.",
        "hr.rss.retention_forbidden",
      );
    }
    const store = getHrTalentRssStore(guard.organization.id);
    const row = hrTalentRssRetentionActionSchema.parse({
      ...input,
      id: nextHrTalentRssId("rss-retention", store.retentionActions),
      organizationId: guard.organization.id,
      performedByUserId: guard.session.id,
      performedAt: new Date().toISOString(),
    });
    store.retentionActions.unshift(row);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        row.action === "closure_requested"
          ? hrTalentRssAuditActions.accountClosureRequested
          : hrTalentRssAuditActions.retentionActionRecorded,
      actorId: guard.session.id,
      targetType: "retention",
      targetId: row.id,
      candidateId: row.candidateId,
      summary: `Recorded retention action ${row.action}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to record retention action.",
      "hr.rss.retention_action_failed",
    );
  }
}

export async function exportHrTalentRssIntegrationRefsAction() {
  try {
    const guard = await requireHrTalentRssRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Recruitment self-service integration exposure access is required.",
        "hr.rss.integration_forbidden",
      );
    }
    const store = getHrTalentRssStore(guard.organization.id);
    emitHrTalentRssAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentRssAuditActions.integrationExposed,
      actorId: guard.session.id,
      targetType: "application",
      targetId: "rss-integration-export",
      summary:
        "Exported recruitment self-service application, offer, consent, and retention references.",
    });
    return {
      ok: true as const,
      data: listHrTalentRssIntegrationExposures(store),
    };
  } catch {
    return actionFailure(
      "Unable to export recruitment self-service references.",
      "hr.rss.integration_export_failed",
    );
  }
}
