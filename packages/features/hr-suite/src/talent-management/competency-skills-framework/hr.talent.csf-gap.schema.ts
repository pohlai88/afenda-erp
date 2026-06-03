import { z } from "zod";

export const hrCsfGapKindSchema = z.enum(["skill", "competency"]);

export const hrCsfSkillRequirementClassSchema = z.enum([
  "mandatory",
  "preferred",
  "critical",
  "optional",
]);

export const hrCsfGapSeveritySchema = z.enum([
  "none",
  "low",
  "moderate",
  "high",
  "critical",
]);

export const hrCsfGapPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const hrCsfRoleImpactSchema = z.enum([
  "minimal",
  "moderate",
  "significant",
  "critical",
]);

export const hrCsfDevelopmentUrgencySchema = z.enum([
  "deferred",
  "planned",
  "soon",
  "immediate",
]);

export const hrCsfAnalyzeEmployeeGapsSchema = z.object({
  employeeId: z.string().trim().min(1),
  positionId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  grade: z.string().trim().min(1).optional(),
  jobRole: z.string().trim().min(1).optional(),
  jobFamily: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
  linkageRefs: z
    .object({
      courseRef: z.string().trim().min(1).optional(),
      learningPathRef: z.string().trim().min(1).optional(),
      certificationRef: z.string().trim().min(1).optional(),
      coachingRef: z.string().trim().min(1).optional(),
      developmentPlanRef: z.string().trim().min(1).optional(),
    })
    .optional(),
});

export const hrCsfListEmployeeGapsSchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  hasGapOnly: z.boolean().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const hrCsfComputeSkillGapSchema = z.object({
  skillId: z.string().trim().min(1),
  requiredLevelOrder: z.number().int().positive(),
  currentLevelOrder: z.number().int().nonnegative(),
  requirementClass: hrCsfSkillRequirementClassSchema.optional(),
});

export const hrCsfComputeCompetencyGapSchema = z.object({
  competencyId: z.string().trim().min(1),
  requiredLevelOrder: z.number().int().positive(),
  currentLevelOrder: z.number().int().nonnegative(),
});

export const hrCsfClassifyGapSchema = z.object({
  gapKind: hrCsfGapKindSchema,
  gapSize: z.number().int().nonnegative(),
  hasGap: z.boolean(),
  requirementClass: hrCsfSkillRequirementClassSchema.optional(),
});

export type HrCsfAnalyzeEmployeeGapsInput = z.infer<
  typeof hrCsfAnalyzeEmployeeGapsSchema
>;
export type HrCsfListEmployeeGapsInput = z.infer<
  typeof hrCsfListEmployeeGapsSchema
>;
