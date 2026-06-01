"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../../hr-suite-integration/server";
import {
  emitHrIndustryMscAuditEvent,
  getHrIndustryMscStore,
  listHrIndustryMscComplianceTrainingRefs,
  listHrIndustryMscDocumentEvidenceRefs,
  listHrIndustryMscIntegrationExposureRefs,
  listHrIndustryMscLearningRequirementRefs,
  listHrIndustryMscShiftSchedulingEligibilityRefs,
} from "../data/hr.industry.msc-store.shared";
import { hrIndustryMscAuditActions } from "../events";
import {
  requireHrIndustryMscApprove,
  requireHrIndustryMscRead,
  requireHrIndustryMscWrite,
} from "../policies/hr.industry.msc-access.policy.server";
import {
  hrMscCorrectiveActionSchema,
  hrMscSafetyCertificationSchema,
  hrMscTrainingAssignmentSchema,
  hrMscWorkplaceIncidentSchema,
  hrMscWorkRestrictionSchema,
  type HrMscCorrectiveActionInput,
  type HrMscSafetyCertificationInput,
  type HrMscTrainingAssignmentInput,
  type HrMscWorkplaceIncidentInput,
  type HrMscWorkRestrictionInput,
} from "../schemas";

type TrainingCompletionActionInput = {
  readonly assignmentId: string;
  readonly completedAt: string;
  readonly evidenceDocumentRef?: string;
  readonly ppeAcknowledgmentRef?: string;
};
type CertificationRenewalActionInput = Omit<
  HrMscSafetyCertificationInput,
  "id" | "organizationId" | "status"
>;
type IncidentReportActionInput = Omit<
  HrMscWorkplaceIncidentInput,
  "id" | "organizationId" | "status"
>;
type CorrectiveActionInput = Omit<
  HrMscCorrectiveActionInput,
  "id" | "organizationId" | "status"
>;
type WorkRestrictionActionInput = Omit<
  HrMscWorkRestrictionInput,
  "id" | "organizationId" | "status"
>;

const trainingCompletionSchema = z.object({
  assignmentId: z.string().trim().min(1),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  evidenceDocumentRef: z.string().trim().min(1).optional(),
  ppeAcknowledgmentRef: z.string().trim().min(1).optional(),
});

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrIndustryMscWorkbenchAction() {
  try {
    const guard = await requireHrIndustryMscRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Manufacturing Safety Training and OSHA Compliance.",
      "hr.msc.refresh_failed",
    );
  }
}

export async function completeHrIndustryMscTrainingAction(
  input: TrainingCompletionActionInput,
) {
  try {
    const parsed = trainingCompletionSchema.parse(input);
    const guard = await requireHrIndustryMscWrite();
    const store = getHrIndustryMscStore(guard.organization.id);
    const assignment = store.trainingAssignments.find(
      (row) => row.id === parsed.assignmentId,
    );
    if (!assignment) {
      return actionFailure(
        "Safety training assignment was not found.",
        "hr.msc.training_missing",
      );
    }

    const row = hrMscTrainingAssignmentSchema.parse({
      ...assignment,
      completedAt: parsed.completedAt,
      evidenceDocumentRef:
        parsed.evidenceDocumentRef ?? assignment.evidenceDocumentRef,
      ppeAcknowledgmentRef:
        parsed.ppeAcknowledgmentRef ?? assignment.ppeAcknowledgmentRef,
      status: "completed",
    } satisfies HrMscTrainingAssignmentInput);
    Object.assign(assignment, row);
    emitHrIndustryMscAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        row.trainingType === "ppe"
          ? hrIndustryMscAuditActions.ppeAcknowledged
          : hrIndustryMscAuditActions.trainingCompleted,
      actorId: guard.session.id,
      targetType: row.trainingType === "ppe" ? "ppe_acknowledgment" : "training",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Completed ${row.trainingType} training for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to complete manufacturing safety training.",
      "hr.msc.training_complete_failed",
    );
  }
}

export async function renewHrIndustryMscCertificationAction(
  input: CertificationRenewalActionInput,
) {
  try {
    const guard = await requireHrIndustryMscApprove();
    const store = getHrIndustryMscStore(guard.organization.id);
    const row = hrMscSafetyCertificationSchema.parse({
      ...input,
      id: `msc-cert-${store.safetyCertifications.length + 1}`,
      organizationId: guard.organization.id,
      status: "active",
    });
    store.safetyCertifications.unshift(row);
    emitHrIndustryMscAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryMscAuditActions.certificateRenewed,
      actorId: guard.session.id,
      targetType: "certification",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Renewed ${row.certificationType} certification for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to renew safety certification.",
      "hr.msc.certification_renew_failed",
    );
  }
}

export async function reportHrIndustryMscIncidentAction(
  input: IncidentReportActionInput,
) {
  try {
    const guard = await requireHrIndustryMscWrite();
    const store = getHrIndustryMscStore(guard.organization.id);
    const row = hrMscWorkplaceIncidentSchema.parse({
      ...input,
      id: `msc-incident-${store.workplaceIncidents.length + 1}`,
      organizationId: guard.organization.id,
      status: input.oshaRecordable ? "recordable_reference" : "reported",
    });
    store.workplaceIncidents.unshift(row);
    emitHrIndustryMscAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryMscAuditActions.incidentReported,
      actorId: guard.session.id,
      targetType: "incident",
      targetId: row.id,
      ...(row.employeeId ? { employeeId: row.employeeId } : {}),
      summary: `Reported ${row.incidentType} incident at ${row.siteName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to report manufacturing safety incident.",
      "hr.msc.incident_report_failed",
    );
  }
}

export async function assignHrIndustryMscCorrectiveAction(
  input: CorrectiveActionInput,
) {
  try {
    const guard = await requireHrIndustryMscWrite();
    const store = getHrIndustryMscStore(guard.organization.id);
    const row = hrMscCorrectiveActionSchema.parse({
      ...input,
      id: `msc-ca-${store.correctiveActions.length + 1}`,
      organizationId: guard.organization.id,
      status: "assigned",
    });
    store.correctiveActions.unshift(row);
    emitHrIndustryMscAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryMscAuditActions.correctiveActionAssigned,
      actorId: guard.session.id,
      targetType: "corrective_action",
      targetId: row.id,
      summary: `Assigned corrective action for ${row.sourceType} ${row.sourceRef}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to assign safety corrective action.",
      "hr.msc.corrective_action_failed",
    );
  }
}

export async function applyHrIndustryMscWorkRestrictionAction(
  input: WorkRestrictionActionInput,
) {
  try {
    const guard = await requireHrIndustryMscApprove();
    const store = getHrIndustryMscStore(guard.organization.id);
    const row = hrMscWorkRestrictionSchema.parse({
      ...input,
      id: `msc-restriction-${store.workRestrictions.length + 1}`,
      organizationId: guard.organization.id,
      status: "active",
    });
    store.workRestrictions.unshift(row);
    emitHrIndustryMscAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryMscAuditActions.workRestrictionApplied,
      actorId: guard.session.id,
      targetType: "work_restriction",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Applied ${row.restrictionScope} restriction for ${row.employeeDisplayName}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to apply manufacturing safety work restriction.",
      "hr.msc.restriction_failed",
    );
  }
}

export async function exportHrIndustryMscIntegrationRefsAction() {
  try {
    const guard = await requireHrIndustryMscRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Manufacturing safety integration export access is required.",
        "hr.msc.integration_forbidden",
      );
    }
    const store = getHrIndustryMscStore(guard.organization.id);
    return {
      ok: true as const,
      data: {
        complianceTraining: listHrIndustryMscComplianceTrainingRefs(store),
        learningRequirements: listHrIndustryMscLearningRequirementRefs(store),
        schedulingEligibility:
          listHrIndustryMscShiftSchedulingEligibilityRefs(store),
        documentEvidence: listHrIndustryMscDocumentEvidenceRefs(store),
        integrationExposures: listHrIndustryMscIntegrationExposureRefs(store),
      },
    };
  } catch {
    return actionFailure(
      "Unable to export manufacturing safety integration references.",
      "hr.msc.integration_export_failed",
    );
  }
}
