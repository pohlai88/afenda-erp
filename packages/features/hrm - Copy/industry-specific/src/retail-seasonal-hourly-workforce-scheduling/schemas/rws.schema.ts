import { z } from "zod"

import {
  HRM_RWS_DEMAND_REFERENCE_KINDS,
  HRM_RWS_PERIOD_KINDS,
  HRM_RWS_RETAIL_ROLES,
  hrmRwsClaimModeSchema,
  hrmRwsDemandReferenceKindSchema,
  hrmRwsPeriodKindSchema,
  hrmRwsRetailRoleSchema,
} from "./rws-workflow-state.shared"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")

export const createRwsStoreFormSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(128),
  branchRef: z.string().trim().max(128).optional().nullable(),
  departmentRef: z.string().trim().max(128).optional().nullable(),
  legalEntityRef: z.string().trim().max(128).optional().nullable(),
  locationRef: z.string().trim().max(128).optional().nullable(),
})

export const createRwsSchedulePeriodFormSchema = z.object({
  storeId: z.string().uuid(),
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(128),
  periodKind: hrmRwsPeriodKindSchema,
  periodStartDate: isoDate,
  periodEndDate: isoDate,
  campaignLabel: z.string().trim().max(128).optional().nullable(),
  teamRef: z.string().trim().max(128).optional().nullable(),
  roleRef: z.string().trim().max(128).optional().nullable(),
})

export const publishRwsSchedulePeriodFormSchema = z.object({
  schedulePeriodId: z.string().uuid(),
  note: z.string().trim().max(512).optional().nullable(),
})

export const createRwsCoverageSlotFormSchema = z.object({
  schedulePeriodId: z.string().uuid(),
  storeId: z.string().uuid(),
  slotDate: isoDate,
  hourOfDay: z.coerce.number().int().min(0).max(23),
  retailRole: hrmRwsRetailRoleSchema,
  requiredHeadcount: z.coerce.number().int().min(1).max(99),
  departmentRef: z.string().trim().max(128).optional().nullable(),
})

export const createRwsDemandReferenceFormSchema = z.object({
  schedulePeriodId: z.string().uuid(),
  storeId: z.string().uuid(),
  referenceKind: hrmRwsDemandReferenceKindSchema,
  externalRef: z.string().trim().max(128).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const upsertRwsLaborBudgetFormSchema = z.object({
  schedulePeriodId: z.string().uuid(),
  storeId: z.string().uuid(),
  approvedBudgetAmount: z.string().trim().min(1).max(32),
  currencyCode: z.string().trim().max(8).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const createRwsOpenShiftOfferFormSchema = z.object({
  schedulePeriodId: z.string().uuid(),
  storeId: z.string().uuid(),
  slotDate: isoDate,
  retailRole: hrmRwsRetailRoleSchema,
  claimMode: hrmRwsClaimModeSchema,
  coverageSlotId: z.string().uuid().optional().nullable(),
})

export const claimRwsOpenShiftFormSchema = z.object({
  openShiftOfferId: z.string().uuid(),
  employeeId: z.string().uuid(),
  shiftTemplateId: z.string().uuid(),
})

export const updateRwsRetailPolicyFormSchema = z.object({
  maxDailyHours: z.coerce.number().int().min(1).max(24).optional().nullable(),
  maxWeeklyHours: z.coerce.number().int().min(1).max(168).optional().nullable(),
  minRestHours: z.coerce.number().int().min(0).max(48).optional().nullable(),
  mealBreakMinutes: z.coerce.number().int().min(0).max(240).optional().nullable(),
  restBreakMinutes: z.coerce.number().int().min(0).max(240).optional().nullable(),
  minorMaxDailyHours: z.coerce.number().int().min(0).max(24).optional().nullable(),
  minorMaxWeeklyHours: z.coerce.number().int().min(0).max(168).optional().nullable(),
  studentMaxWeeklyHours: z.coerce
    .number()
    .int()
    .min(0)
    .max(168)
    .optional()
    .nullable(),
  peakSeasonEnabled: z.enum(["true", "false"]).transform((v) => v === "true"),
  holidayRuleEnabled: z.enum(["true", "false"]).transform((v) => v === "true"),
  weekendRuleEnabled: z.enum(["true", "false"]).transform((v) => v === "true"),
  lateNightRuleEnabled: z.enum(["true", "false"]).transform((v) => v === "true"),
})

export const exportRwsReportFormSchema = z.object({
  reportKind: z.enum(["coverage", "periods", "open_shifts", "labor_summary"]),
})

export { HRM_RWS_PERIOD_KINDS, HRM_RWS_RETAIL_ROLES, HRM_RWS_DEMAND_REFERENCE_KINDS }
