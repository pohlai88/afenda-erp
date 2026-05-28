import { z } from "zod"

import {
  HRM_GPG_ADJUSTMENT_TYPES,
  HRM_GPG_APPOINTMENT_TYPES,
  HRM_GPG_CLASSIFICATION_SCHEMES,
  HRM_GPG_LOCALITY_TYPES,
} from "./gpg-workflow-state.shared"

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")

export const createGpgClassificationFormSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  scheme: z.enum(HRM_GPG_CLASSIFICATION_SCHEMES),
  effectiveDate: isoDate,
  occupationalGroup: z.string().max(120).optional().nullable(),
  jobSeries: z.string().max(120).optional().nullable(),
  jobFamily: z.string().max(120).optional().nullable(),
  agencyRef: z.string().max(120).optional().nullable(),
  departmentRef: z.string().max(120).optional().nullable(),
  positionRef: z.string().max(120).optional().nullable(),
})

export const createGpgPayGradeFormSchema = z.object({
  classificationId: z.string().uuid(),
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  effectiveDate: isoDate,
  gsEquivalent: z.string().max(32).optional().nullable(),
  sesEquivalent: z.string().max(32).optional().nullable(),
  civilServiceGradeRef: z.string().max(120).optional().nullable(),
  rankEquivalent: z.string().max(120).optional().nullable(),
})

export const createGpgPayBandFormSchema = z.object({
  payGradeId: z.string().uuid(),
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  effectiveDate: isoDate,
  minRate: z.string().max(32).optional().nullable(),
  maxRate: z.string().max(32).optional().nullable(),
  currencyCode: z.string().max(8).optional().nullable(),
})

export const createGpgSalaryTableVersionFormSchema = z.object({
  code: z.string().min(1).max(32),
  effectiveDate: isoDate,
})

export const createGpgSalaryTableRowFormSchema = z.object({
  tableVersionId: z.string().uuid(),
  payGradeId: z.string().uuid(),
  step: z.coerce.number().int().min(1).max(99),
  baseRate: z.string().min(1).max(32),
  minRate: z.string().max(32).optional().nullable(),
  maxRate: z.string().max(32).optional().nullable(),
  currencyCode: z.string().max(8).optional().nullable(),
})

export const publishGpgSalaryTableVersionFormSchema = z.object({
  tableVersionId: z.string().uuid(),
})

export const createGpgEmployeeAssignmentFormSchema = z.object({
  employeeId: z.string().uuid(),
  classificationId: z.string().uuid(),
  payGradeId: z.string().uuid(),
  payBandId: z.string().uuid().optional().nullable(),
  salaryTableVersionId: z.string().uuid(),
  step: z.coerce.number().int().min(1).max(99),
  appointmentType: z.enum(HRM_GPG_APPOINTMENT_TYPES),
  effectiveFrom: isoDate,
  positionId: z.string().max(120).optional().nullable(),
})

export const createGpgLocalityRuleFormSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  localityType: z.enum(HRM_GPG_LOCALITY_TYPES),
  effectiveDate: isoDate,
  adjustmentPercent: z.string().max(32).optional().nullable(),
  areaRef: z.string().max(120).optional().nullable(),
  regionCode: z.string().max(32).optional().nullable(),
  countryCode: z.string().max(8).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  dutyStationRef: z.string().max(120).optional().nullable(),
})

export const createGpgAdjustmentReferenceFormSchema = z.object({
  employeeId: z.string().uuid(),
  adjustmentType: z.enum(HRM_GPG_ADJUSTMENT_TYPES),
  effectiveDate: isoDate,
  localityRuleId: z.string().uuid().optional().nullable(),
  amount: z.string().max(32).optional().nullable(),
  percent: z.string().max(32).optional().nullable(),
  currencyCode: z.string().max(8).optional().nullable(),
})

export const createGpgStepIncreaseRuleFormSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  waitingPeriodMonths: z.coerce.number().int().min(1).max(120),
  requiresApproval: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  minManagerRating: z
    .union([z.literal(""), z.coerce.number().min(0).max(10)])
    .optional()
    .transform((value) => (value === "" || value == null ? null : value)),
})

export const decideGpgReclassificationRequestFormSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
})

export const applyGpgGradeMovementDraftFormSchema = z.object({
  movementId: z.string().uuid(),
})

export const createGpgStepIncreaseEventFormSchema = z.object({
  assignmentId: z.string().uuid(),
  ruleId: z.string().uuid(),
})

export const decideGpgStepIncreaseEventFormSchema = z.object({
  eventId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
})

export const processGpgStepIncreaseAutoBatchFormSchema = z.object({
  confirm: z.literal("yes"),
})

const gpgWizardMovementTypes = [
  "promotion",
  "reclassification",
  "demotion",
  "pay_retention",
  "acting_higher_duty",
] as const

export const createGpgReclassificationRequestFormSchema = z.object({
  employeeId: z.string().uuid(),
  fromClassificationId: z.string().uuid().optional().nullable(),
  toClassificationId: z.string().uuid(),
  reason: z.string().max(500).optional().nullable(),
})

export const createGpgGradeMovementFormSchema = z.object({
  employeeId: z.string().uuid(),
  movementType: z.enum(gpgWizardMovementTypes),
  classificationId: z.string().uuid(),
  toPayGradeId: z.string().uuid(),
  toStep: z.coerce.number().int().min(1).max(99),
  salaryTableVersionId: z.string().uuid(),
  payBandId: z.string().uuid().optional().nullable(),
  effectiveDate: isoDate,
  reason: z.string().max(500).optional().nullable(),
  retentionAmount: z.string().max(32).optional().nullable(),
})
