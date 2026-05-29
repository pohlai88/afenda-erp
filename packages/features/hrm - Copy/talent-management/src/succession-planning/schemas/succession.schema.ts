import { z } from "zod"

import {
  HRM_SUCCESSION_BUSINESS_IMPACTS,
  HRM_SUCCESSION_CALIBRATION_OUTCOMES,
  HRM_SUCCESSION_CALIBRATION_SESSION_STATUSES,
  HRM_SUCCESSION_POOL_KINDS,
  HRM_SUCCESSION_READINESS_LEVELS,
  HRM_SUCCESSION_REPLACEMENT_KINDS,
  HRM_SUCCESSION_REVIEW_CYCLE_STATES,
  HRM_SUCCESSION_RISK_LEVELS,
  HRM_SUCCESSION_SUCCESSOR_TYPES,
  HRM_SUCCESSION_VACANCY_RISKS,
} from "./succession-workflow-state.shared"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .optional()
  .nullable()

export const hrmSuccessionBusinessImpactSchema = z.enum(HRM_SUCCESSION_BUSINESS_IMPACTS)
export const hrmSuccessionVacancyRiskSchema = z.enum(HRM_SUCCESSION_VACANCY_RISKS)
export const hrmSuccessionSuccessorTypeSchema = z.enum(HRM_SUCCESSION_SUCCESSOR_TYPES)
export const hrmSuccessionReadinessLevelSchema = z.enum(HRM_SUCCESSION_READINESS_LEVELS)
export const hrmSuccessionPoolKindSchema = z.enum(HRM_SUCCESSION_POOL_KINDS)
export const hrmSuccessionReplacementKindSchema = z.enum(HRM_SUCCESSION_REPLACEMENT_KINDS)
export const hrmSuccessionReviewCycleStateSchema = z.enum(
  HRM_SUCCESSION_REVIEW_CYCLE_STATES
)
export const hrmSuccessionCalibrationSessionStatusSchema = z.enum(
  HRM_SUCCESSION_CALIBRATION_SESSION_STATUSES
)
export const hrmSuccessionCalibrationOutcomeSchema = z.enum(
  HRM_SUCCESSION_CALIBRATION_OUTCOMES
)
export const hrmSuccessionRiskLevelSchema = z.enum(HRM_SUCCESSION_RISK_LEVELS)

export function normalizeSuccessionCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "_")
}

type SuccessionNullableCoerced<T extends object, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: Exclude<T[P], undefined> | null
}

/** Coerce Zod optional fields to explicit null for server mutation inputs. */
export function withSuccessionNullableFields<
  T extends object,
  const K extends readonly (keyof T)[],
>(data: T, keys: K): SuccessionNullableCoerced<T, K[number]> {
  const result = { ...data } as SuccessionNullableCoerced<T, K[number]>
  for (const key of keys) {
    if (data[key] === undefined) {
      ;(result as Record<string, unknown>)[key as string] = null
    }
  }
  return result
}

export const createCriticalRoleFormSchema = z.object({
  code: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(128),
  businessImpact: hrmSuccessionBusinessImpactSchema,
  leadershipLevel: z.string().trim().min(1).max(64),
  vacancyRisk: hrmSuccessionVacancyRiskSchema,
  replacementDifficulty: z.string().trim().min(1).max(64),
  orgUnitId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  jobFamilyRef: z.string().trim().max(128).optional().nullable(),
  gradeRef: z.string().trim().max(128).optional().nullable(),
  incumbentEmployeeId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const updateCriticalRoleFormSchema = createCriticalRoleFormSchema.extend({
  criticalRoleId: z.string().uuid(),
})

export const createNominationFormSchema = z.object({
  criticalRoleId: z.string().uuid(),
  candidateEmployeeId: z.string().uuid(),
  successorType: hrmSuccessionSuccessorTypeSchema,
  readinessLevel: hrmSuccessionReadinessLevelSchema,
  potentialRating: z.string().trim().max(64).optional().nullable(),
  performancePotentialGrid: z.string().trim().max(32).optional().nullable(),
  nominationReason: z.string().trim().max(2000).optional().nullable(),
})

export const updateNominationReadinessFormSchema = z.object({
  nominationId: z.string().uuid(),
  readinessLevel: hrmSuccessionReadinessLevelSchema,
  potentialRating: z.string().trim().max(64).optional().nullable(),
  performancePotentialGrid: z.string().trim().max(32).optional().nullable(),
})

export const createDevelopmentLinkFormSchema = z.object({
  nominationId: z.string().uuid(),
  developmentPlanId: z.string().uuid(),
})

export const createTalentPoolFormSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(128),
  poolKind: hrmSuccessionPoolKindSchema,
  description: z.string().trim().max(2000).optional().nullable(),
})

export const addPoolMemberFormSchema = z.object({
  poolId: z.string().uuid(),
  employeeId: z.string().uuid(),
})

export const createCalibrationSessionFormSchema = z.object({
  title: z.string().trim().min(1).max(128),
  sessionDate: isoDate,
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const updateCalibrationEntryFormSchema = z.object({
  entryId: z.string().uuid(),
  outcome: hrmSuccessionCalibrationOutcomeSchema,
  comments: z.string().trim().max(2000).optional().nullable(),
  decisionRef: z.string().trim().max(128).optional().nullable(),
  gridCell: z.string().trim().max(32).optional().nullable(),
})

export const createReplacementPlanFormSchema = z.object({
  criticalRoleId: z.string().uuid(),
  planKind: hrmSuccessionReplacementKindSchema,
  primaryNominationId: z.string().uuid().optional().nullable(),
  interimEmployeeId: z.string().uuid().optional().nullable(),
  effectiveFrom: isoDate,
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const createReviewCycleFormSchema = z.object({
  title: z.string().trim().min(1).max(128),
  dueDate: isoDate,
})

export const closeReviewCycleFormSchema = z.object({
  reviewCycleId: z.string().uuid(),
})

export const exportSuccessionReportFormSchema = z.object({
  reportKind: z.enum([
    "critical_roles",
    "nominations",
    "bench_strength",
    "risk_flags",
  ]),
})

export type SuccessionMutationFormState =
  | { ok: true; id?: string }
  | { ok: false; errors: { form?: string } }

export type ExportSuccessionReportFormState =
  | { ok: true; csv: string; filename: string; rowCount: number }
  | { ok: false; errors: { form?: string } }
