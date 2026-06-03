import { z } from "zod";

export const hrSftCoverageStaffingStatusSchema = z.enum([
  "balanced",
  "understaffed",
  "overstaffed",
]);

export type HrSftCoverageStaffingStatus = z.infer<
  typeof hrSftCoverageStaffingStatusSchema
>;

export const hrSftCreateCoverageRequirementSchema = z.object({
  requirementDate: z.coerce.date(),
  templateId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  positionId: z.string().trim().min(1).optional(),
  locationCode: z.string().trim().max(64).optional(),
  roleCode: z.string().trim().max(64).optional(),
  requiredSkillCode: z.string().trim().max(64).optional(),
  requiredCertificationCode: z.string().trim().max(64).optional(),
  minHeadcount: z.coerce.number().int().min(1),
  maxHeadcount: z.coerce.number().int().min(1).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type HrSftCreateCoverageRequirementInput = z.infer<
  typeof hrSftCreateCoverageRequirementSchema
>;

export const hrSftCoverageCompareQuerySchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  departmentId: z.string().trim().min(1).optional(),
  locationCode: z.string().trim().max(64).optional(),
});

export type HrSftCoverageCompareQueryInput = z.infer<
  typeof hrSftCoverageCompareQuerySchema
>;
