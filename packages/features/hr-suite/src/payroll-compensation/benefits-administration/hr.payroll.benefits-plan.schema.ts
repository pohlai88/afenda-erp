import { z } from "zod";

import {
  HRM_BENEFIT_CATEGORIES,
  HRM_BENEFIT_COVERAGE_LEVELS,
} from "./hr.payroll.benefits-constants.shared";
import {
  hrBenefitsEntityIdSchema,
  hrBenefitsFormDateTimeInput,
} from "./hr.payroll.benefits-form-fields.shared";

export const upsertHrBenefitPlanFormSchema = z.object({
  code: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(500),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(HRM_BENEFIT_CATEGORIES),
  providerId: hrBenefitsEntityIdSchema.optional(),
  allowsDependents: z.coerce.boolean().optional(),
  defaultCoverageLevel: z.enum(HRM_BENEFIT_COVERAGE_LEVELS).optional(),
  employerContributionAmount: z.string().trim().max(20).optional(),
  employeeContributionAmount: z.string().trim().max(20).optional(),
  currencyCode: z.string().trim().length(3).optional(),
  requiresApproval: z.coerce.boolean().optional(),
  effectiveFrom: hrBenefitsFormDateTimeInput.optional(),
  effectiveTo: hrBenefitsFormDateTimeInput.optional(),
});

export type UpsertHrBenefitPlanFormInput = z.infer<
  typeof upsertHrBenefitPlanFormSchema
>;

export const archiveHrBenefitPlanFormSchema = z.object({
  planId: hrBenefitsEntityIdSchema,
});
