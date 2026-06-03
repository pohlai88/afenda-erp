import { z } from "zod";

import { HR_EMPLOYEE_TARGET_ROLE_SOURCES } from "./hr.talent.career-pathing-constants.shared";

const requirementSchema = z.object({
  skillCode: z.string().trim().min(1).optional(),
  competencyCode: z.string().trim().min(1).optional(),
  targetLevel: z.union([z.number(), z.string()]),
  label: z.string().trim().max(160).nullable().optional(),
});

export const hrCareerPathSkillRequirementSchema = z.object({
  skillCode: z.string().trim().min(1),
  targetLevel: z.union([z.number(), z.string()]),
  label: z.string().trim().max(160).nullable().optional(),
});

export const hrCareerPathCompetencyRequirementSchema = z.object({
  competencyCode: z.string().trim().min(1),
  targetLevel: z.union([z.number(), z.string()]),
  label: z.string().trim().max(160).nullable().optional(),
});

export const hrCareerPathTargetRoleUpsertSchema = z.object({
  employeeId: z.string().trim().min(1),
  targetRoleTitle: z.string().trim().min(1).max(160),
  jobFamily: z.string().trim().max(120).optional(),
  grade: z.string().trim().max(64).optional(),
  positionId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  frameworkId: z.string().trim().min(1).optional(),
  stageId: z.string().trim().min(1).optional(),
  targetRoleSource: z.enum(HR_EMPLOYEE_TARGET_ROLE_SOURCES).default("employee"),
  requiredSkillRequirements: z.array(hrCareerPathSkillRequirementSchema).default([]),
  requiredCompetencyRequirements: z
    .array(hrCareerPathCompetencyRequirementSchema)
    .default([]),
  expectedReadinessDate: z.coerce.date().optional(),
  notes: z.string().trim().max(4000).optional(),
});

export const hrCareerPathTargetRoleRecommendSchema =
  hrCareerPathTargetRoleUpsertSchema.extend({
    targetRoleSource: z.enum(["manager", "hr"]),
  });

export type HrCareerPathTargetRoleUpsertInput = z.infer<
  typeof hrCareerPathTargetRoleUpsertSchema
>;

/** Guard unused requirement union for future combined payloads. */
export const hrCareerPathRequirementUnionSchema = requirementSchema;
