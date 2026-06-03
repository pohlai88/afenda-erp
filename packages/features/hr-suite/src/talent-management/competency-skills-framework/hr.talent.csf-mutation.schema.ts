import { z } from "zod";

import {
  HR_CSF_COMPETENCY_CATEGORIES,
  HR_CSF_LIBRARY_STATUSES,
  HR_CSF_REQUIREMENT_SCOPES,
  HR_CSF_SKILL_CATEGORIES,
  HR_CSF_SKILL_REQUIREMENT_CLASSES,
} from "./hr.talent.csf-constants.shared";

const hrCsfProficiencyLevelSchema = z.object({
  levelOrder: z.number().int().positive(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(4000),
  assessmentCriteria: z.string().min(1).max(4000),
});

export const hrCsfCreateProficiencyScaleSchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  description: z.string().max(4000).nullable().optional(),
  scaleStatus: z.enum(HR_CSF_LIBRARY_STATUSES).default("draft"),
  levels: z.array(hrCsfProficiencyLevelSchema).min(1),
});

export const hrCsfUpdateProficiencyScaleSchema = z.object({
  scaleId: z.string().min(1),
  name: z.string().min(1).max(256).optional(),
  description: z.string().max(4000).nullable().optional(),
  scaleStatus: z.enum(HR_CSF_LIBRARY_STATUSES).optional(),
  levels: z.array(hrCsfProficiencyLevelSchema).min(1).optional(),
});

export const hrCsfCreateCompetencySchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  category: z.enum(HR_CSF_COMPETENCY_CATEGORIES),
  description: z.string().max(4000).nullable().optional(),
  libraryStatus: z.enum(HR_CSF_LIBRARY_STATUSES).default("draft"),
  proficiencyScaleId: z.string().min(1),
});

export const hrCsfUpdateCompetencySchema = z.object({
  competencyId: z.string().min(1),
  name: z.string().min(1).max(256).optional(),
  category: z.enum(HR_CSF_COMPETENCY_CATEGORIES).optional(),
  description: z.string().max(4000).nullable().optional(),
  libraryStatus: z.enum(HR_CSF_LIBRARY_STATUSES).optional(),
  proficiencyScaleId: z.string().min(1).optional(),
});

export const hrCsfCreateSkillSchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  category: z.enum(HR_CSF_SKILL_CATEGORIES),
  description: z.string().max(4000).nullable().optional(),
  libraryStatus: z.enum(HR_CSF_LIBRARY_STATUSES).default("draft"),
  proficiencyScaleId: z.string().min(1),
});

export const hrCsfUpdateSkillSchema = z.object({
  skillId: z.string().min(1),
  name: z.string().min(1).max(256).optional(),
  category: z.enum(HR_CSF_SKILL_CATEGORIES).optional(),
  description: z.string().max(4000).nullable().optional(),
  libraryStatus: z.enum(HR_CSF_LIBRARY_STATUSES).optional(),
  proficiencyScaleId: z.string().min(1).optional(),
});

const hrCsfRequirementScopeFieldsSchema = z.object({
  scope: z.enum(HR_CSF_REQUIREMENT_SCOPES),
  scopeRef: z.string().nullable().optional(),
  jobRole: z.string().nullable().optional(),
  jobFamily: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  legalEntityCode: z.string().nullable().optional(),
});

function assertHrCsfRequirementScopeFields(
  data: z.infer<typeof hrCsfRequirementScopeFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  switch (data.scope) {
    case "job_role":
      if (!data.jobRole?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "jobRole is required for job_role scope.",
          path: ["jobRole"],
        });
      }
      return;
    case "job_family":
      if (!data.jobFamily?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "jobFamily is required for job_family scope.",
          path: ["jobFamily"],
        });
      }
      return;
    case "grade":
      if (!data.grade?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "grade is required for grade scope.",
          path: ["grade"],
        });
      }
      return;
    case "position":
      if (!data.positionId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "positionId is required for position scope.",
          path: ["positionId"],
        });
      }
      return;
    case "department":
      if (!data.departmentId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "departmentId is required for department scope.",
          path: ["departmentId"],
        });
      }
      return;
    case "legal_entity":
      if (!data.legalEntityCode?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "legalEntityCode is required for legal_entity scope.",
          path: ["legalEntityCode"],
        });
      }
      return;
    default:
      ctx.addIssue({
        code: "custom",
        message: "Unknown requirement scope.",
        path: ["scope"],
      });
  }
}

export const hrCsfCompetencyRequirementSchema = hrCsfRequirementScopeFieldsSchema
  .extend({
    competencyId: z.string().min(1),
    requiredProficiencyLevelId: z.string().min(1),
    notes: z.string().max(4000).nullable().optional(),
    requirementId: z.string().nullable().optional(),
  })
  .superRefine(assertHrCsfRequirementScopeFields);

export const hrCsfSkillRequirementSchema = hrCsfRequirementScopeFieldsSchema
  .extend({
    skillId: z.string().min(1),
    requiredProficiencyLevelId: z.string().min(1),
    requirementClass: z
      .enum(HR_CSF_SKILL_REQUIREMENT_CLASSES)
      .default("mandatory"),
    notes: z.string().max(4000).nullable().optional(),
    requirementId: z.string().nullable().optional(),
  })
  .superRefine(assertHrCsfRequirementScopeFields);

export const hrCsfDeleteRequirementSchema = z.object({
  requirementId: z.string().min(1),
});

export type HrCsfCreateProficiencyScaleInput = z.infer<
  typeof hrCsfCreateProficiencyScaleSchema
>;
export type HrCsfUpdateProficiencyScaleInput = z.infer<
  typeof hrCsfUpdateProficiencyScaleSchema
>;
export type HrCsfCreateCompetencyInput = z.infer<
  typeof hrCsfCreateCompetencySchema
>;
export type HrCsfUpdateCompetencyInput = z.infer<
  typeof hrCsfUpdateCompetencySchema
>;
export type HrCsfCreateSkillInput = z.infer<typeof hrCsfCreateSkillSchema>;
export type HrCsfUpdateSkillInput = z.infer<typeof hrCsfUpdateSkillSchema>;
export type HrCsfCompetencyRequirementInput = z.infer<
  typeof hrCsfCompetencyRequirementSchema
>;
export type HrCsfSkillRequirementInput = z.infer<
  typeof hrCsfSkillRequirementSchema
>;
