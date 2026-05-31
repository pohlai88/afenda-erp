import {
  listHrCsfAssessmentEvidence,
  listHrCsfAssessmentsForProfile,
} from "@afenda/db/hr-competency-skills-profiles";

import {
  canHrCsfViewEmployeeProfile,
  requireHrCsfRead,
} from "../policies/hr.talent.csf-access.policy.server";
import {
  hrCsfListProfileAssessmentsSchema,
  hrCsfValidateAssessmentSchema,
} from "../schemas/hr.talent.csf-assessment.schema";

export async function listHrTalentCsfProfileAssessments(input: unknown) {
  const guard = await requireHrCsfRead();
  const parsed = hrCsfListProfileAssessmentsSchema.parse(input);

  const assessments = await listHrCsfAssessmentsForProfile({
    organizationId: guard.organization.id,
    targetType: parsed.targetType,
    profileId: parsed.profileId,
  });

  if (assessments.length > 0) {
    const visible = await guard.resolveVisibleEmployeeIds({
      scope: guard.canWriteCsf ? "org" : "team",
      selfEmployeeId: null,
    });
    if (!canHrCsfViewEmployeeProfile(guard, assessments[0]!.employeeId, visible)) {
      throw new Error("Access denied for competency assessments.");
    }
  }

  return assessments;
}

export async function listHrTalentCsfAssessmentEvidence(input: unknown) {
  const guard = await requireHrCsfRead();
  const parsed = hrCsfValidateAssessmentSchema.pick({ assessmentId: true }).parse(input);

  return listHrCsfAssessmentEvidence({
    organizationId: guard.organization.id,
    assessmentId: parsed.assessmentId,
  });
}
