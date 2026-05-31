import { z } from "zod";

import {
  HR_BONUS_PLAN_TYPES,
  HR_BONUS_TARGET_KINDS,
} from "./hr.payroll.bonus-constants.shared";

export const upsertBonusPlanSchema = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  planType: z.enum(HR_BONUS_PLAN_TYPES),
  description: z.string().trim().max(2000).optional(),
  currencyCode: z.string().trim().min(3).max(3).optional(),
  requiresApproval: z.coerce.boolean().optional(),
});

export const archiveBonusPlanSchema = z.object({
  planId: z.string().trim().min(1),
});

export const upsertBonusEligibilityRuleSchema = z.object({
  planId: z.string().trim().min(1),
  ruleId: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().max(64).optional(),
  departmentId: z.string().trim().min(1).optional(),
  grade: z.string().trim().max(64).optional(),
  jobRole: z.string().trim().max(128).optional(),
  employmentType: z.string().trim().max(64).optional(),
  minTenureMonths: z.coerce.number().int().min(0).optional(),
  maxTenureMonths: z.coerce.number().int().min(0).optional(),
  performanceRating: z.string().trim().max(64).optional(),
  salesTeamCode: z.string().trim().max(64).optional(),
  employeeStatus: z.string().trim().max(64).optional(),
});

export const assignBonusPlanParticipantSchema = z.object({
  planId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
});

export const upsertBonusCycleSchema = z.object({
  planId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  periodStartAt: z.coerce.date(),
  periodEndAt: z.coerce.date(),
  cutoffAt: z.coerce.date().optional(),
  approvalAt: z.coerce.date().optional(),
  payoutAt: z.coerce.date().optional(),
});

export const upsertBonusTargetSchema = z.object({
  planId: z.string().trim().min(1),
  cycleId: z.string().trim().min(1),
  targetId: z.string().trim().min(1).optional(),
  targetKind: z.enum(HR_BONUS_TARGET_KINDS),
  targetValue: z.string().trim().min(1),
  label: z.string().trim().max(256).optional(),
  employeeId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  teamRef: z.string().trim().max(128).optional(),
  projectRef: z.string().trim().max(128).optional(),
  currencyCode: z.string().trim().min(3).max(3).optional(),
});
