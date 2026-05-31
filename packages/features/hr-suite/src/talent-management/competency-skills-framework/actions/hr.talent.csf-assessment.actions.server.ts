"use server";

import { runWithOrganizationContext } from "@afenda/db";

import {
  requireHrCsfManagerAssess,
  requireHrCsfSelfAssess,
  requireHrCsfValidateAssess,
} from "../policies/hr.talent.csf-assessment-access.policy.server";
import {
  hrCsfAddAssessmentEvidenceSchema,
  hrCsfSubmitAssessmentSchema,
  hrCsfValidateAssessmentSchema,
} from "../schemas/hr.talent.csf-assessment.schema";

export async function submitHrTalentCsfSelfAssessmentAction(input: unknown) {
  const assessmentGuard = await requireHrCsfSelfAssess();
  const parsed = hrCsfSubmitAssessmentSchema.parse({
    ...(typeof input === "object" && input !== null ? input : {}),
    assessmentType: "self",
  });

  await assessmentGuard.assertSelfAssessmentTarget(parsed.employeeId);

  return runWithOrganizationContext(assessmentGuard.organization.id, async (db) => {
    const { submitHrCsfAssessmentInTx } = await import("@afenda/db");
    return submitHrCsfAssessmentInTx(db, {
      organizationId: assessmentGuard.organization.id,
      actorUserId: assessmentGuard.session.id,
      employeeId: parsed.employeeId,
      targetType: parsed.targetType,
      profileId: parsed.profileId,
      proficiencyLevelId: parsed.proficiencyLevelId,
      assessmentType: "self",
      assessmentDate: parsed.assessmentDate,
      confidenceLevel: parsed.confidenceLevel,
      assessorEmployeeId: assessmentGuard.actorEmployeeIds[0] ?? null,
      notes: parsed.notes,
      evidence: parsed.evidence,
    });
  });
}

export async function submitHrTalentCsfManagerAssessmentAction(input: unknown) {
  const assessmentGuard = await requireHrCsfManagerAssess();
  const parsed = hrCsfSubmitAssessmentSchema.parse({
    ...(typeof input === "object" && input !== null ? input : {}),
    assessmentType: "manager",
  });

  await assessmentGuard.assertManagerAssessmentTarget(parsed.employeeId);

  return runWithOrganizationContext(assessmentGuard.organization.id, async (db) => {
    const { submitHrCsfAssessmentInTx } = await import("@afenda/db");
    return submitHrCsfAssessmentInTx(db, {
      organizationId: assessmentGuard.organization.id,
      actorUserId: assessmentGuard.session.id,
      employeeId: parsed.employeeId,
      targetType: parsed.targetType,
      profileId: parsed.profileId,
      proficiencyLevelId: parsed.proficiencyLevelId,
      assessmentType: "manager",
      assessmentDate: parsed.assessmentDate,
      confidenceLevel: parsed.confidenceLevel,
      assessorEmployeeId:
        parsed.assessorEmployeeId ?? assessmentGuard.actorEmployeeIds[0] ?? null,
      notes: parsed.notes,
      evidence: parsed.evidence,
    });
  });
}

export async function validateHrTalentCsfAssessmentAction(input: unknown) {
  const assessmentGuard = await requireHrCsfValidateAssess();
  const parsed = hrCsfValidateAssessmentSchema.parse(input);

  return runWithOrganizationContext(assessmentGuard.organization.id, async (db) => {
    const { validateHrCsfAssessmentInTx } = await import("@afenda/db");
    return validateHrCsfAssessmentInTx(db, {
      organizationId: assessmentGuard.organization.id,
      actorUserId: assessmentGuard.session.id,
      assessmentId: parsed.assessmentId,
      proficiencyLevelId: parsed.proficiencyLevelId,
      notes: parsed.notes,
    });
  });
}

export async function addHrTalentCsfAssessmentEvidenceAction(input: unknown) {
  const assessmentGuard = await requireHrCsfManagerAssess();
  const parsed = hrCsfAddAssessmentEvidenceSchema.parse(input);

  return runWithOrganizationContext(assessmentGuard.organization.id, async (db) => {
    const { addHrCsfAssessmentEvidenceInTx } = await import("@afenda/db");
    return addHrCsfAssessmentEvidenceInTx(db, {
      organizationId: assessmentGuard.organization.id,
      actorUserId: assessmentGuard.session.id,
      assessmentId: parsed.assessmentId,
      evidenceSummary: parsed.evidenceSummary,
      source: parsed.source,
      evidenceDate: parsed.evidenceDate,
      confidenceLevel: parsed.confidenceLevel,
      metadata: parsed.metadata,
    });
  });
}
