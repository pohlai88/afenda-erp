"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../../hr-suite-integration/server";
import {
  calculateHrIndustryGpgLocalityAdjustedPay,
  emitHrIndustryGpgAuditEvent,
  getHrIndustryGpgStore,
  listHrIndustryGpgIntegrationExposureRefs,
  listHrIndustryGpgLifecycleMovementRefs,
  listHrIndustryGpgPayrollReferenceExports,
  listHrIndustryGpgStepIncreaseEligibilityRefs,
  validateHrIndustryGpgAssignment,
} from "../data/hr.industry.gpg-store.shared";
import { hrIndustryGpgAuditActions } from "../events";
import {
  requireHrIndustryGpgApprove,
  requireHrIndustryGpgRead,
  requireHrIndustryGpgWrite,
} from "../policies/hr.industry.gpg-access.policy.server";
import {
  hrGpgClassificationReviewSchema,
  hrGpgGradeMovementSchema,
  hrGpgPositionAssignmentSchema,
  type HrGpgClassificationReviewInput,
  type HrGpgGradeMovementInput,
  type HrGpgPositionAssignmentInput,
} from "../schemas";

type PositionAssignmentActionInput = Omit<
  HrGpgPositionAssignmentInput,
  "id" | "organizationId" | "validationStatus" | "validationMessage"
>;
type GradeMovementActionInput = Omit<
  HrGpgGradeMovementInput,
  "id" | "organizationId" | "status"
>;
type ClassificationReviewActionInput = Omit<
  HrGpgClassificationReviewInput,
  "id" | "organizationId" | "status"
>;

const stepCandidateSchema = z.object({
  candidateId: z.string().trim().min(1),
});

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrIndustryGpgWorkbenchAction() {
  try {
    const guard = await requireHrIndustryGpgRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Government Classification Pay Grades.",
      "hr.gpg.refresh_failed",
    );
  }
}

export async function assignHrIndustryGpgPositionClassificationAction(
  input: PositionAssignmentActionInput,
) {
  try {
    const guard = await requireHrIndustryGpgWrite();
    const store = getHrIndustryGpgStore(guard.organization.id);
    const validation = validateHrIndustryGpgAssignment({
      store,
      classificationCode: input.classificationCode,
      gradeCode: input.gradeCode,
      stepCode: input.stepCode,
      salaryTableCode: input.salaryTableCode,
    });
    const row = hrGpgPositionAssignmentSchema.parse({
      ...input,
      id: `gpg-assignment-${store.positionAssignments.length + 1}`,
      organizationId: guard.organization.id,
      validationStatus: validation.status,
      validationMessage: validation.message,
    });
    store.positionAssignments.unshift(row);
    emitHrIndustryGpgAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        row.validationStatus === "blocked"
          ? hrIndustryGpgAuditActions.assignmentBlocked
          : hrIndustryGpgAuditActions.positionAssigned,
      actorId: guard.session.id,
      targetType: "position_assignment",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `${row.validationStatus === "blocked" ? "Blocked" : "Assigned"} ${row.employeeDisplayName} to ${row.classificationCode}, ${row.gradeCode}, ${row.stepCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to assign classification, grade, and step reference.",
      "hr.gpg.assignment_failed",
    );
  }
}

export async function calculateHrIndustryGpgLocalityPayAction(input: {
  readonly baseRate: number;
  readonly adjustmentRate: number;
}) {
  try {
    await requireHrIndustryGpgRead();
    return {
      ok: true as const,
      data: {
        adjustedPay: calculateHrIndustryGpgLocalityAdjustedPay(input),
      },
    };
  } catch {
    return actionFailure(
      "Unable to calculate locality-adjusted pay.",
      "hr.gpg.locality_calculation_failed",
    );
  }
}

export async function processHrIndustryGpgStepIncreaseAction(input: {
  readonly candidateId: string;
}) {
  try {
    const parsed = stepCandidateSchema.parse(input);
    const guard = await requireHrIndustryGpgApprove();
    const store = getHrIndustryGpgStore(guard.organization.id);
    const candidate = store.stepIncreaseCandidates.find(
      (row) => row.id === parsed.candidateId,
    );
    if (!candidate) {
      return actionFailure(
        "Step increase candidate was not found.",
        "hr.gpg.step_candidate_missing",
      );
    }
    if (candidate.eligibilityStatus !== "eligible") {
      return actionFailure(
        "Step increase candidate is not eligible.",
        "hr.gpg.step_candidate_not_eligible",
      );
    }
    emitHrIndustryGpgAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryGpgAuditActions.stepIncreaseProcessed,
      actorId: guard.session.id,
      targetType: "step_movement",
      targetId: candidate.id,
      employeeId: candidate.employeeId,
      summary: `Processed step increase for ${candidate.employeeDisplayName} from ${candidate.currentStepCode} to ${candidate.nextStepCode}.`,
    });
    return { ok: true as const, data: candidate };
  } catch {
    return actionFailure(
      "Unable to process step increase.",
      "hr.gpg.step_increase_failed",
    );
  }
}

export async function recordHrIndustryGpgGradeMovementAction(
  input: GradeMovementActionInput,
) {
  try {
    const guard = await requireHrIndustryGpgApprove();
    const store = getHrIndustryGpgStore(guard.organization.id);
    const row = hrGpgGradeMovementSchema.parse({
      ...input,
      id: `gpg-movement-${store.gradeMovements.length + 1}`,
      organizationId: guard.organization.id,
      status: "approved",
    });
    store.gradeMovements.unshift(row);
    emitHrIndustryGpgAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        row.movementType === "promotion"
          ? hrIndustryGpgAuditActions.promotionProcessed
          : row.movementType === "reclassification"
            ? hrIndustryGpgAuditActions.reclassificationProcessed
            : row.movementType === "downgrade" ||
                row.movementType === "demotion"
              ? hrIndustryGpgAuditActions.downgradeRecorded
              : row.movementType === "acting_grade"
                ? hrIndustryGpgAuditActions.actingGradeRecorded
                : hrIndustryGpgAuditActions.retentionRecorded,
      actorId: guard.session.id,
      targetType:
        row.movementType === "reclassification"
          ? "reclassification"
          : row.movementType === "acting_grade"
            ? "acting_grade"
            : row.movementType === "pay_retention" ||
                row.movementType === "grade_retention"
              ? "retention"
              : "grade_movement",
      targetId: row.id,
      employeeId: row.employeeId,
      summary: `Recorded ${row.movementType} for ${row.employeeDisplayName}, ${row.fromGradeCode} to ${row.toGradeCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to record grade movement.",
      "hr.gpg.grade_movement_failed",
    );
  }
}

export async function openHrIndustryGpgClassificationReviewAction(
  input: ClassificationReviewActionInput,
) {
  try {
    const guard = await requireHrIndustryGpgWrite();
    const store = getHrIndustryGpgStore(guard.organization.id);
    const row = hrGpgClassificationReviewSchema.parse({
      ...input,
      id: `gpg-review-${store.classificationReviews.length + 1}`,
      organizationId: guard.organization.id,
      status: "submitted",
    });
    store.classificationReviews.unshift(row);
    emitHrIndustryGpgAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrIndustryGpgAuditActions.classificationReviewRecorded,
      actorId: guard.session.id,
      targetType: "classification_review",
      targetId: row.id,
      summary: `Opened ${row.reviewType} for ${row.classificationCode}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to open classification review.",
      "hr.gpg.classification_review_failed",
    );
  }
}

export async function exportHrIndustryGpgIntegrationRefsAction() {
  try {
    const guard = await requireHrIndustryGpgRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Government Classification Pay Grades integration export access is required.",
        "hr.gpg.integration_forbidden",
      );
    }
    const store = getHrIndustryGpgStore(guard.organization.id);
    return {
      ok: true as const,
      data: {
        payrollReferences: listHrIndustryGpgPayrollReferenceExports(store),
        lifecycleMovementReferences:
          listHrIndustryGpgLifecycleMovementRefs(store),
        stepIncreaseEligibility:
          listHrIndustryGpgStepIncreaseEligibilityRefs(store),
        integrationExposures: listHrIndustryGpgIntegrationExposureRefs(store),
      },
    };
  } catch {
    return actionFailure(
      "Unable to export Government Classification Pay Grades references.",
      "hr.gpg.integration_export_failed",
    );
  }
}
