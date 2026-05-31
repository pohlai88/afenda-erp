import { z } from "zod";

import {
  HR_CSF_ASSESSMENT_TARGETS,
  HR_CSF_ASSESSMENT_TYPES,
  HR_CSF_CONFIDENCE_LEVELS,
} from "./hr.talent.csf-constants.shared";

export const hrCsfAssessmentEvidenceSchema = z.object({
  evidenceSummary: z.string().min(1).max(8000),
  source: z.string().min(1).max(512),
  evidenceDate: z.coerce.date().optional(),
  confidenceLevel: z.coerce
    .number()
    .int()
    .refine((value): value is (typeof HR_CSF_CONFIDENCE_LEVELS)[number] =>
      (HR_CSF_CONFIDENCE_LEVELS as readonly number[]).includes(value),
    )
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const hrCsfSubmitAssessmentSchema = z.object({
  employeeId: z.string().min(1),
  targetType: z.enum(HR_CSF_ASSESSMENT_TARGETS),
  profileId: z.string().min(1),
  proficiencyLevelId: z.string().min(1),
  assessmentType: z.enum(HR_CSF_ASSESSMENT_TYPES),
  assessmentDate: z.coerce.date().optional(),
  confidenceLevel: z.coerce
    .number()
    .int()
    .refine((value): value is (typeof HR_CSF_CONFIDENCE_LEVELS)[number] =>
      (HR_CSF_CONFIDENCE_LEVELS as readonly number[]).includes(value),
    )
    .optional(),
  assessorEmployeeId: z.string().min(1).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  evidence: z.array(hrCsfAssessmentEvidenceSchema).optional(),
});

export const hrCsfValidateAssessmentSchema = z.object({
  assessmentId: z.string().min(1),
  proficiencyLevelId: z.string().min(1).optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export const hrCsfAddAssessmentEvidenceSchema = z.object({
  assessmentId: z.string().min(1),
  evidenceSummary: z.string().min(1).max(8000),
  source: z.string().min(1).max(512),
  evidenceDate: z.coerce.date().optional(),
  confidenceLevel: z.coerce
    .number()
    .int()
    .refine((value): value is (typeof HR_CSF_CONFIDENCE_LEVELS)[number] =>
      (HR_CSF_CONFIDENCE_LEVELS as readonly number[]).includes(value),
    )
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const hrCsfListProfileAssessmentsSchema = z.object({
  targetType: z.enum(HR_CSF_ASSESSMENT_TARGETS),
  profileId: z.string().min(1),
});

export type HrCsfSubmitAssessmentInput = z.infer<typeof hrCsfSubmitAssessmentSchema>;
export type HrCsfValidateAssessmentInput = z.infer<
  typeof hrCsfValidateAssessmentSchema
>;
export type HrCsfAddAssessmentEvidenceInput = z.infer<
  typeof hrCsfAddAssessmentEvidenceSchema
>;
