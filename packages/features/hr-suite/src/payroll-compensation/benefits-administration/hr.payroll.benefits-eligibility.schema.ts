import { z } from "zod";

import {
  hrBenefitsEntityIdSchema,
  hrBenefitsFormDateTimeInput,
  nullableScopeText,
} from "./hr.payroll.benefits-form-fields.shared";

export const upsertHrBenefitEligibilityRuleFormSchema = z.object({
  planId: hrBenefitsEntityIdSchema,
  ruleId: hrBenefitsEntityIdSchema.optional(),
  countryCode: z.string().trim().length(2).toUpperCase().optional(),
  legalEntityCode: nullableScopeText,
  workLocationCode: nullableScopeText,
  employmentType: nullableScopeText,
  workerCategory: nullableScopeText,
  grade: nullableScopeText,
  level: nullableScopeText,
  minTenureMonths: z.coerce.number().int().min(0).max(600).optional(),
  maxTenureMonths: z.coerce.number().int().min(0).max(600).optional(),
  effectiveFrom: hrBenefitsFormDateTimeInput.optional(),
  effectiveTo: hrBenefitsFormDateTimeInput.optional(),
});

export type UpsertHrBenefitEligibilityRuleFormInput = z.infer<
  typeof upsertHrBenefitEligibilityRuleFormSchema
>;

export const determineHrBenefitEligibilityFormSchema = z.object({
  employeeId: hrBenefitsEntityIdSchema,
  planId: hrBenefitsEntityIdSchema,
});

export type DetermineHrBenefitEligibilityFormInput = z.infer<
  typeof determineHrBenefitEligibilityFormSchema
>;
