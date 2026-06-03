import {
  assignBonusPlanParticipantSchema,
  archiveBonusPlanSchema,
  upsertBonusCycleSchema,
  upsertBonusEligibilityRuleSchema,
  upsertBonusPlanSchema,
  upsertBonusTargetSchema,
} from "./hr.payroll.bonus-foundation.schema";

function readFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (value === null || value === undefined) return undefined;
  return String(value);
}

function readOptionalDate(formData: FormData, key: string): Date | undefined {
  const value = readFormString(formData, key);
  if (!value?.trim()) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function parseUpsertBonusPlanForm(formData: FormData) {
  return upsertBonusPlanSchema.safeParse({
    code: readFormString(formData, "code"),
    name: readFormString(formData, "name"),
    planType: readFormString(formData, "planType"),
    description: readFormString(formData, "description"),
    currencyCode: readFormString(formData, "currencyCode"),
    requiresApproval: readFormString(formData, "requiresApproval") === "true",
  });
}

export function parseArchiveBonusPlanForm(formData: FormData) {
  return archiveBonusPlanSchema.safeParse({
    planId: readFormString(formData, "planId"),
  });
}

export function parseUpsertBonusEligibilityRuleForm(formData: FormData) {
  return upsertBonusEligibilityRuleSchema.safeParse({
    planId: readFormString(formData, "planId"),
    ruleId: readFormString(formData, "ruleId"),
    legalEntityCode: readFormString(formData, "legalEntityCode"),
    departmentId: readFormString(formData, "departmentId"),
    grade: readFormString(formData, "grade"),
    jobRole: readFormString(formData, "jobRole"),
    employmentType: readFormString(formData, "employmentType"),
    minTenureMonths: readFormString(formData, "minTenureMonths"),
    maxTenureMonths: readFormString(formData, "maxTenureMonths"),
    performanceRating: readFormString(formData, "performanceRating"),
    salesTeamCode: readFormString(formData, "salesTeamCode"),
    employeeStatus: readFormString(formData, "employeeStatus"),
  });
}

export function parseAssignBonusPlanParticipantForm(formData: FormData) {
  return assignBonusPlanParticipantSchema.safeParse({
    planId: readFormString(formData, "planId"),
    employeeId: readFormString(formData, "employeeId"),
  });
}

export function parseUpsertBonusCycleForm(formData: FormData) {
  const periodStartAt = readOptionalDate(formData, "periodStartAt");
  const periodEndAt = readOptionalDate(formData, "periodEndAt");
  if (!periodStartAt || !periodEndAt) {
    return upsertBonusCycleSchema.safeParse({});
  }

  return upsertBonusCycleSchema.safeParse({
    planId: readFormString(formData, "planId"),
    code: readFormString(formData, "code"),
    name: readFormString(formData, "name"),
    periodStartAt,
    periodEndAt,
    cutoffAt: readOptionalDate(formData, "cutoffAt"),
    approvalAt: readOptionalDate(formData, "approvalAt"),
    payoutAt: readOptionalDate(formData, "payoutAt"),
  });
}

export function parseUpsertBonusTargetForm(formData: FormData) {
  return upsertBonusTargetSchema.safeParse({
    planId: readFormString(formData, "planId"),
    cycleId: readFormString(formData, "cycleId"),
    targetId: readFormString(formData, "targetId"),
    targetKind: readFormString(formData, "targetKind"),
    targetValue: readFormString(formData, "targetValue"),
    label: readFormString(formData, "label"),
    employeeId: readFormString(formData, "employeeId"),
    departmentId: readFormString(formData, "departmentId"),
    teamRef: readFormString(formData, "teamRef"),
    projectRef: readFormString(formData, "projectRef"),
    currencyCode: readFormString(formData, "currencyCode"),
  });
}
