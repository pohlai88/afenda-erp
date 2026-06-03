import { z } from "zod";

import {
  HRM_BENEFIT_COVERAGE_LEVELS,
  HRM_BENEFIT_DEPENDENT_RELATIONSHIPS,
  HRM_BENEFIT_ENROLLMENT_CHANNELS,
  HRM_BENEFIT_LIFE_EVENT_KINDS,
} from "./hr.payroll.benefits-constants.shared";
import {
  hrBenefitsEntityIdSchema,
  hrBenefitsFormDateTimeInput,
} from "./hr.payroll.benefits-form-fields.shared";

export const hrBenefitEnrollmentDependentFormSchema = z.object({
  dependentName: z.string().trim().min(1).max(200),
  relationship: z.enum(HRM_BENEFIT_DEPENDENT_RELATIONSHIPS),
  dateOfBirth: hrBenefitsFormDateTimeInput.optional(),
  dependentReferenceId: z.string().trim().max(64).optional(),
  coverageStartDate: hrBenefitsFormDateTimeInput,
  coverageEndDate: hrBenefitsFormDateTimeInput.optional(),
});

export const createHrBenefitEnrollmentFormSchema = z.object({
  employeeId: hrBenefitsEntityIdSchema,
  planId: hrBenefitsEntityIdSchema,
  coverageLevel: z.enum(HRM_BENEFIT_COVERAGE_LEVELS),
  enrollmentChannel: z.enum(HRM_BENEFIT_ENROLLMENT_CHANNELS),
  coverageStartDate: hrBenefitsFormDateTimeInput,
  coverageEndDate: hrBenefitsFormDateTimeInput.optional(),
  openEnrollmentWindowId: hrBenefitsEntityIdSchema.optional(),
  lifeEventId: hrBenefitsEntityIdSchema.optional(),
  eligibilityOverrideReference: z.string().trim().max(200).optional(),
  waiverReason: z.string().trim().max(500).optional(),
  dependents: z.array(hrBenefitEnrollmentDependentFormSchema).max(12).optional(),
});

export const addHrBenefitEnrollmentDependentFormSchema = z.object({
  enrollmentId: hrBenefitsEntityIdSchema,
  dependentName: z.string().trim().min(1).max(200),
  relationship: z.enum(HRM_BENEFIT_DEPENDENT_RELATIONSHIPS),
  dateOfBirth: hrBenefitsFormDateTimeInput.optional(),
  dependentReferenceId: z.string().trim().max(64).optional(),
  coverageStartDate: hrBenefitsFormDateTimeInput,
  coverageEndDate: hrBenefitsFormDateTimeInput.optional(),
});

export const verifyHrBenefitEnrollmentDependentsFormSchema = z.object({
  enrollmentId: hrBenefitsEntityIdSchema,
});

export type CreateHrBenefitEnrollmentFormInput = z.infer<
  typeof createHrBenefitEnrollmentFormSchema
>;

export const recordHrBenefitLifeEventFormSchema = z.object({
  employeeId: hrBenefitsEntityIdSchema,
  kind: z.enum(HRM_BENEFIT_LIFE_EVENT_KINDS),
  eventDate: hrBenefitsFormDateTimeInput,
  notes: z.string().trim().max(2000).optional(),
  approvalReference: z.string().trim().max(200).optional(),
});

export type RecordHrBenefitLifeEventFormInput = z.infer<
  typeof recordHrBenefitLifeEventFormSchema
>;

export const createNewHireBenefitEnrollmentFormSchema =
  createHrBenefitEnrollmentFormSchema.extend({
    enrollmentChannel: z.literal("new_hire"),
  });

export const createOpenEnrollmentBenefitEnrollmentFormSchema =
  createHrBenefitEnrollmentFormSchema.extend({
    enrollmentChannel: z.literal("open_enrollment"),
    openEnrollmentWindowId: hrBenefitsEntityIdSchema,
  });

export const createLifeEventBenefitEnrollmentFormSchema =
  createHrBenefitEnrollmentFormSchema.extend({
    enrollmentChannel: z.literal("life_event"),
    lifeEventId: hrBenefitsEntityIdSchema,
  });
