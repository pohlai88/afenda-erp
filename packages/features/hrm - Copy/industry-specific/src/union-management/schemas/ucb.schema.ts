import { z } from "zod"

import {
  HRM_UCB_CBA_STATUSES,
  HRM_UCB_DUES_APPROVAL_STATES,
  HRM_UCB_GRIEVANCE_SEVERITIES,
  HRM_UCB_GRIEVANCE_STATUSES,
  HRM_UCB_MEMBERSHIP_STATUSES,
  HRM_UCB_NEGOTIATION_STATUSES,
  HRM_UCB_REPRESENTATIVE_ROLES,
  HRM_UCB_RULE_DOMAINS,
  HRM_UCB_SENIORITY_USE_CASES,
  HRM_UCB_UNION_STATUSES,
} from "./ucb-workflow-state.shared"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .optional()
  .nullable()

export const hrmUcbUnionStatusSchema = z.enum(HRM_UCB_UNION_STATUSES)
export const hrmUcbCbaStatusSchema = z.enum(HRM_UCB_CBA_STATUSES)
export const hrmUcbNegotiationStatusSchema = z.enum(HRM_UCB_NEGOTIATION_STATUSES)
export const hrmUcbMembershipStatusSchema = z.enum(HRM_UCB_MEMBERSHIP_STATUSES)
export const hrmUcbRuleDomainSchema = z.enum(HRM_UCB_RULE_DOMAINS)
export const hrmUcbSeniorityUseCaseSchema = z.enum(HRM_UCB_SENIORITY_USE_CASES)
export const hrmUcbDuesApprovalStateSchema = z.enum(HRM_UCB_DUES_APPROVAL_STATES)
export const hrmUcbGrievanceStatusSchema = z.enum(HRM_UCB_GRIEVANCE_STATUSES)
export const hrmUcbGrievanceSeveritySchema = z.enum(HRM_UCB_GRIEVANCE_SEVERITIES)
export const hrmUcbRepresentativeRoleSchema = z.enum(HRM_UCB_REPRESENTATIVE_ROLES)

type UcbNullableCoerced<T extends object, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: Exclude<T[P], undefined> | null
}

export function withUcbNullableFields<
  T extends object,
  const K extends readonly (keyof T)[],
>(data: T, keys: K): UcbNullableCoerced<T, K[number]> {
  const result = { ...data } as UcbNullableCoerced<T, K[number]>
  for (const key of keys) {
    if (data[key] === undefined) {
      ;(result as Record<string, unknown>)[key as string] = null
    }
  }
  return result
}

export const createUnionFormSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(128),
  status: hrmUcbUnionStatusSchema,
  representativeRef: z.string().trim().max(128).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const updateUnionFormSchema = createUnionFormSchema.extend({
  unionId: z.string().uuid(),
})

export const createCbaFormSchema = z.object({
  unionId: z.string().uuid(),
  bargainingUnitId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1).max(256),
  versionLabel: z.string().trim().min(1).max(32),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  status: hrmUcbCbaStatusSchema,
  negotiationStatus: hrmUcbNegotiationStatusSchema,
})

export const updateCbaFormSchema = createCbaFormSchema.extend({
  collectiveAgreementId: z.string().uuid(),
})

export const createMembershipFormSchema = z.object({
  employeeId: z.string().uuid(),
  unionId: z.string().uuid(),
  bargainingUnitId: z.string().uuid().optional().nullable(),
  status: hrmUcbMembershipStatusSchema,
  membershipStartDate: isoDate,
  membershipEndDate: isoDate,
})

export const updateMembershipFormSchema = createMembershipFormSchema.extend({
  membershipId: z.string().uuid(),
})

export const createCbaRuleFormSchema = z.object({
  collectiveAgreementId: z.string().uuid(),
  ruleDomain: hrmUcbRuleDomainSchema,
  externalRuleCode: z.string().trim().min(1).max(64),
  summary: z.string().trim().min(1).max(512),
})

export const updateCbaRuleFormSchema = createCbaRuleFormSchema.extend({
  cbaRuleId: z.string().uuid(),
  active: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "on"),
})

export const upsertSeniorityFormSchema = z.object({
  membershipId: z.string().uuid(),
  seniorityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
})

export const createDuesReferenceFormSchema = z.object({
  membershipId: z.string().uuid(),
  amountRef: z.string().trim().min(1).max(64),
  currencyCode: z.string().trim().length(3).default("USD"),
  effectiveFrom: isoDate,
})

export const updateDuesApprovalFormSchema = z.object({
  duesReferenceId: z.string().uuid(),
  approvalState: hrmUcbDuesApprovalStateSchema,
})

export const createGrievanceFormSchema = z.object({
  employeeId: z.string().uuid(),
  collectiveAgreementId: z.string().uuid().optional().nullable(),
  category: z.string().trim().min(1).max(64),
  clauseCode: z.string().trim().max(64).optional().nullable(),
  severity: hrmUcbGrievanceSeveritySchema,
  summary: z.string().trim().min(1).max(2000),
  departmentRef: z.string().trim().max(128).optional().nullable(),
  locationRef: z.string().trim().max(128).optional().nullable(),
})

export const updateGrievanceStatusFormSchema = z.object({
  grievanceId: z.string().uuid(),
  status: hrmUcbGrievanceStatusSchema,
  mediationRef: z.string().trim().max(128).optional().nullable(),
  arbitrationRef: z.string().trim().max(128).optional().nullable(),
  legalMatterRef: z.string().trim().max(128).optional().nullable(),
})

export const createGrievanceStepFormSchema = z.object({
  grievanceId: z.string().uuid(),
  stepLevel: z.coerce.number().int().min(1).max(10),
  deadlineAt: z.string().optional().nullable(),
  meetingAt: z.string().optional().nullable(),
  decision: z.string().trim().max(512).optional().nullable(),
  escalationLevel: z.string().trim().max(64).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const createRepresentativeFormSchema = z.object({
  unionId: z.string().uuid(),
  employeeId: z.string().uuid().optional().nullable(),
  roleKind: hrmUcbRepresentativeRoleSchema,
  departmentRef: z.string().trim().max(128).optional().nullable(),
  siteRef: z.string().trim().max(128).optional().nullable(),
})

export const createLrMeetingFormSchema = z.object({
  title: z.string().trim().min(1).max(256),
  scheduledAt: z.string().optional().nullable(),
})

export const exportUcbReportFormSchema = z.object({
  reportKind: z.enum([
    "membership",
    "grievances",
    "compliance",
    "dues",
    "agreements",
  ]),
})

export type UcbMutationFormState =
  | { ok: true; id?: string }
  | { ok: false; errors: { form?: string } }

export type ExportUcbReportFormState =
  | { ok: true; csv: string; filename: string; rowCount: number }
  | { ok: false; errors: { form?: string } }
