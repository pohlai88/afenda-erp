"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../employee-management/compliance-regulatory-tracking/server";
import {
  emitHrIndustryFhcAuditEvent,
  getHrIndustryFhcStore,
  listHrIndustryFhcComplianceTrainingRefs,
  listHrIndustryFhcLearningRequirementRefs,
  listHrIndustryFhcShiftSchedulingEligibilityRefs,
} from "./hr.industry.fhc-store.shared";
import { hrIndustryFhcAuditActions } from "../events";
import {
  requireHrIndustryFhcApprove,
  requireHrIndustryFhcRead,
  requireHrIndustryFhcWrite,
} from "./hr.industry.fhc-access.policy.server";
import {
  hrFhcDutyRestrictionSchema,
  hrFhcEvidenceSubmissionSchema,
  hrFhcRenewalCaseSchema,
  type HrFhcDutyRestrictionInput,
  type HrFhcEvidenceSubmissionInput,
  type HrFhcRenewalCaseInput,
} from "../schemas";

type EvidenceSubmissionActionInput = Omit<
  HrFhcEvidenceSubmissionInput,
  "id" | "organizationId" | "status" | "submittedAt"
>;
type RenewalCaseActionInput = Omit<
  HrFhcRenewalCaseInput,
  "id" | "organizationId" | "status"
>;
type DutyRestrictionActionInput = Omit<
  HrFhcDutyRestrictionInput,
  "id" | "organizationId" | "status"
>;

const evidenceDecisionSchema = z.object({
  evidenceId: z.string().trim().min(1),
});

const evidenceRejectionSchema = evidenceDecisionSchema.extend({
  rejectionReason: z.string().trim().min(1),
});

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrIndustryFhcWorkbenchAction() {
  try {
    const guard = await requireHrIndustryFhcRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Food Handler Compliance.",
      "hr.fhc.refresh_failed",
    );
  }
}

export async function submitHrIndustryFhcEvidenceAction(
  input: EvidenceSubmissionActionInput,
) {
  try {
    const guard = await requireHrIndustryFhcWrite();
    const store = getHrIndustryFhcStore(guard.organization.id);
    const row = hrFhcEvidenceSubmissionSchema.parse({
      ...input,
      id: `fhc-evidence-${store.evidenceSubmissions.length + 1}`,
      organizationId: guard.organization.id,
      submittedBy: guard.session.id,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    });
    store.evidenceSubmissions.unshift(row);
    emitHrIndustryFhcAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        row.evidenceType === "health_certificate" ||
        row.evidenceType === "medical_fitness"
          ? hrIndustryFhcAuditActions.healthCertificationSubmitted
          : hrIndustryFhcAuditActions.permitSubmitted,
      actorId: guard.session.id,
      targetType:
        row.evidenceType === "health_certificate" ||
        row.evidenceType === "medical_fitness"
          ? "health_certification"
          : "permit",
      targetId: row.targetRef,
      employeeId: row.employeeId,
      summary: `Submitted ${row.evidenceType} evidence for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to submit certification evidence.",
      "hr.fhc.evidence_submit_failed",
    );
  }
}

export async function verifyHrIndustryFhcEvidenceAction(input: {
  readonly evidenceId: string;
}) {
  try {
    const parsed = evidenceDecisionSchema.parse(input);
    const guard = await requireHrIndustryFhcApprove();
    const store = getHrIndustryFhcStore(guard.organization.id);
    const existingIndex = store.evidenceSubmissions.findIndex(
      (row) => row.id === parsed.evidenceId,
    );
    if (existingIndex < 0) {
      return actionFailure(
        "Certification evidence was not found.",
        "hr.fhc.evidence_missing",
      );
    }

    const existing = store.evidenceSubmissions[existingIndex];
    if (!existing) {
      return actionFailure(
        "Certification evidence was not found.",
        "hr.fhc.evidence_missing",
      );
    }
    const updated = hrFhcEvidenceSubmissionSchema.parse({
      ...existing,
      status: "verified",
      verifiedBy: guard.session.id,
      verifiedAt: new Date().toISOString(),
      rejectionReason: undefined,
    });
    store.evidenceSubmissions.splice(existingIndex, 1, updated);
    emitHrIndustryFhcAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFhcAuditActions.evidenceVerified,
      actorId: guard.session.id,
      targetType: "evidence",
      targetId: updated.id,
      employeeId: updated.employeeId,
      summary: `Verified ${updated.evidenceType} evidence for ${updated.employeeDisplayName}.`,
    });
    return { ok: true as const, data: updated };
  } catch {
    return actionFailure(
      "Unable to verify certification evidence.",
      "hr.fhc.evidence_verify_failed",
    );
  }
}

export async function rejectHrIndustryFhcEvidenceAction(input: {
  readonly evidenceId: string;
  readonly rejectionReason: string;
}) {
  try {
    const parsed = evidenceRejectionSchema.parse(input);
    const guard = await requireHrIndustryFhcApprove();
    const store = getHrIndustryFhcStore(guard.organization.id);
    const existingIndex = store.evidenceSubmissions.findIndex(
      (row) => row.id === parsed.evidenceId,
    );
    if (existingIndex < 0) {
      return actionFailure(
        "Certification evidence was not found.",
        "hr.fhc.evidence_missing",
      );
    }

    const existing = store.evidenceSubmissions[existingIndex];
    if (!existing) {
      return actionFailure(
        "Certification evidence was not found.",
        "hr.fhc.evidence_missing",
      );
    }
    const updated = hrFhcEvidenceSubmissionSchema.parse({
      ...existing,
      status: "rejected",
      verifiedBy: guard.session.id,
      verifiedAt: new Date().toISOString(),
      rejectionReason: parsed.rejectionReason,
    });
    store.evidenceSubmissions.splice(existingIndex, 1, updated);
    emitHrIndustryFhcAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFhcAuditActions.evidenceRejected,
      actorId: guard.session.id,
      targetType: "evidence",
      targetId: updated.id,
      employeeId: updated.employeeId,
      summary: `Rejected ${updated.evidenceType} evidence for ${updated.employeeDisplayName}.`,
    });
    return { ok: true as const, data: updated };
  } catch {
    return actionFailure(
      "Unable to reject certification evidence.",
      "hr.fhc.evidence_reject_failed",
    );
  }
}

export async function openHrIndustryFhcRenewalCaseAction(
  input: RenewalCaseActionInput,
) {
  try {
    const guard = await requireHrIndustryFhcWrite();
    const store = getHrIndustryFhcStore(guard.organization.id);
    const row = hrFhcRenewalCaseSchema.parse({
      ...input,
      id: `fhc-renewal-${store.renewalCases.length + 1}`,
      organizationId: guard.organization.id,
      status: "pending_submission",
    });
    store.renewalCases.unshift(row);
    emitHrIndustryFhcAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFhcAuditActions.permitRenewed,
      actorId: guard.session.id,
      targetType: "renewal",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Opened ${row.certificateType} renewal case for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to open certification renewal.",
      "hr.fhc.renewal_open_failed",
    );
  }
}

export async function applyHrIndustryFhcDutyRestrictionAction(
  input: DutyRestrictionActionInput,
) {
  try {
    const guard = await requireHrIndustryFhcApprove();
    const store = getHrIndustryFhcStore(guard.organization.id);
    const row = hrFhcDutyRestrictionSchema.parse({
      ...input,
      id: `fhc-restriction-${store.dutyRestrictions.length + 1}`,
      organizationId: guard.organization.id,
      status: "active",
      reviewerEmployeeId: input.reviewerEmployeeId ?? guard.session.id,
    });
    store.dutyRestrictions.unshift(row);
    emitHrIndustryFhcAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryFhcAuditActions.dutyRestrictionApplied,
      actorId: guard.session.id,
      targetType: "duty_restriction",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Applied food handling duty restriction for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to apply food handling duty restriction.",
      "hr.fhc.restriction_apply_failed",
    );
  }
}

export async function exportHrIndustryFhcIntegrationRefsAction() {
  try {
    const guard = await requireHrIndustryFhcRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Food Handler Compliance integration export access is required.",
        "hr.fhc.integration_forbidden",
      );
    }
    const store = getHrIndustryFhcStore(guard.organization.id);
    return {
      ok: true as const,
      data: {
        shiftScheduling: listHrIndustryFhcShiftSchedulingEligibilityRefs(store),
        complianceTraining: listHrIndustryFhcComplianceTrainingRefs(store),
        learningRequirements: listHrIndustryFhcLearningRequirementRefs(store),
      },
    };
  } catch {
    return actionFailure(
      "Unable to export Food Handler Compliance references.",
      "hr.fhc.integration_export_failed",
    );
  }
}
