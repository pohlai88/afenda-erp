import { z } from "zod";

import { HR_CSF_PROFILE_STATUSES } from "./hr.talent.csf-constants.shared";

export const hrCsfUpsertCompetencyProfileSchema = z.object({
  employeeId: z.string().min(1),
  competencyId: z.string().min(1),
  currentProficiencyLevelId: z.string().min(1).nullable().optional(),
  selfAssessmentEnabled: z.boolean().optional(),
  hrValidationRequired: z.boolean().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export const hrCsfUpsertSkillProfileSchema = z.object({
  employeeId: z.string().min(1),
  skillId: z.string().min(1),
  currentProficiencyLevelId: z.string().min(1).nullable().optional(),
  selfAssessmentEnabled: z.boolean().optional(),
  hrValidationRequired: z.boolean().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export const hrCsfListEmployeeProfilesSchema = z.object({
  employeeId: z.string().min(1),
});

export const hrCsfProfileStatusSchema = z.enum(HR_CSF_PROFILE_STATUSES);

export type HrCsfUpsertCompetencyProfileInput = z.infer<
  typeof hrCsfUpsertCompetencyProfileSchema
>;
export type HrCsfUpsertSkillProfileInput = z.infer<
  typeof hrCsfUpsertSkillProfileSchema
>;
