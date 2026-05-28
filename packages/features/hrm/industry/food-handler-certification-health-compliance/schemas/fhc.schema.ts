import { z } from "zod"

export const submitFhcPermitFormSchema = z.object({
  obligationId: z.string().uuid(),
  permitNumber: z.string().min(1).max(120),
  issuingAuthority: z.string().max(200).nullable().optional(),
  issueDate: z.string().max(32).nullable().optional(),
  expiryDate: z.string().max(32).nullable().optional(),
})

export const recordFhcTrainingFormSchema = z.object({
  obligationId: z.string().uuid(),
  trainingType: z.enum(["hygiene", "allergen"]),
  completedAt: z.string().min(1).max(32),
})

export const recordFhcHealthFormSchema = z.object({
  obligationId: z.string().uuid(),
  certificateRef: z.string().max(200).nullable().optional(),
  issuedAt: z.string().max(32).nullable().optional(),
  expiresAt: z.string().max(32).nullable().optional(),
})

export const createFhcOutletFormSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  countryCode: z.string().max(8).nullable().optional(),
})

export const verifyFhcVerificationFormSchema = z.object({
  reviewId: z.string().uuid(),
  obligationId: z.string().uuid().nullable().optional(),
})

export const rejectFhcVerificationFormSchema = z.object({
  reviewId: z.string().uuid(),
  obligationId: z.string().uuid().nullable().optional(),
  rejectedReason: z.string().min(1).max(500),
})

export const createFhcDutyRestrictionFormSchema = z.object({
  obligationId: z.string().uuid(),
  restrictionScope: z.enum([
    "food_handling",
    "kitchen",
    "service_floor",
    "all_food_duties",
  ]),
  effectiveFrom: z.string().min(1).max(32),
  effectiveTo: z.string().max(32).nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
})

export const linkFhcEvidenceFormSchema = z.object({
  obligationId: z.string().uuid(),
  subjectKind: z.enum(["permit", "health_certificate"]),
  documentId: z.string().min(1).max(200),
})

export const submitFhcPermitRenewalFormSchema = z.object({
  obligationId: z.string().uuid(),
  permitNumber: z.string().min(1).max(120),
  issuingAuthority: z.string().max(200).nullable().optional(),
  issueDate: z.string().max(32).nullable().optional(),
  expiryDate: z.string().max(32).nullable().optional(),
})

export const submitFhcHealthRenewalFormSchema = z.object({
  obligationId: z.string().uuid(),
  certificateRef: z.string().max(200).nullable().optional(),
  issuedAt: z.string().max(32).nullable().optional(),
  expiresAt: z.string().max(32).nullable().optional(),
})

export const createFhcRequirementRuleFormSchema = z.object({
  outletId: z.string().uuid().nullable().optional(),
  countryCode: z.string().max(8).nullable().optional(),
  legalEntityRef: z.string().max(120).nullable().optional(),
  roleRef: z.string().max(120).nullable().optional(),
  departmentRef: z.string().max(120).nullable().optional(),
  employeeCategoryRef: z.string().max(120).nullable().optional(),
  requiresPermit: z.boolean().optional(),
  requiresHygieneTraining: z.boolean().optional(),
  requiresAllergenTraining: z.boolean().optional(),
  requiresHealthCertificate: z.boolean().optional(),
})
