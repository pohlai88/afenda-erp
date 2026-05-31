import {
  calculateBonusPayoutSchema,
  recordBonusTargetAchievementSchema,
  replaceBonusCommissionTiersSchema,
  upsertBonusAcceleratorRuleSchema,
  upsertBonusPayoutFormulaSchema,
} from "./hr.payroll.bonus-mutation.schema";

function readFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (value === null || value === undefined) return undefined;
  return String(value);
}

function readTierRows(formData: FormData) {
  const tierCount = Number(readFormString(formData, "tierCount") ?? "0");
  const tiers = [];

  for (let index = 0; index < tierCount; index += 1) {
    const prefix = `tiers.${index}.`;
    const minThreshold = readFormString(formData, `${prefix}minThreshold`);
    const ratePercent = readFormString(formData, `${prefix}ratePercent`);
    if (!minThreshold || !ratePercent) continue;

    tiers.push({
      tierOrder: Number(readFormString(formData, `${prefix}tierOrder`) ?? index),
      minThreshold,
      maxThreshold: readFormString(formData, `${prefix}maxThreshold`),
      ratePercent,
    });
  }

  return tiers;
}

export function parseRecordBonusTargetAchievementForm(formData: FormData) {
  return recordBonusTargetAchievementSchema.safeParse({
    targetId: readFormString(formData, "targetId"),
    actualValue: readFormString(formData, "actualValue"),
    notes: readFormString(formData, "notes"),
  });
}

export function parseUpsertBonusPayoutFormulaForm(formData: FormData) {
  return upsertBonusPayoutFormulaSchema.safeParse({
    planId: readFormString(formData, "planId"),
    formulaKind: readFormString(formData, "formulaKind"),
    fixedAmount: readFormString(formData, "fixedAmount"),
    percentageRate: readFormString(formData, "percentageRate"),
    performanceRatingWeight: readFormString(formData, "performanceRatingWeight"),
    payoutFloor: readFormString(formData, "payoutFloor"),
    payoutCap: readFormString(formData, "payoutCap"),
    currencyCode: readFormString(formData, "currencyCode"),
  });
}

export function parseReplaceBonusCommissionTiersForm(formData: FormData) {
  return replaceBonusCommissionTiersSchema.safeParse({
    planId: readFormString(formData, "planId"),
    tiers: readTierRows(formData),
  });
}

export function parseUpsertBonusAcceleratorRuleForm(formData: FormData) {
  return upsertBonusAcceleratorRuleSchema.safeParse({
    planId: readFormString(formData, "planId"),
    thresholdPercent: readFormString(formData, "thresholdPercent"),
    acceleratorRate: readFormString(formData, "acceleratorRate"),
  });
}

export function parseCalculateBonusPayoutForm(formData: FormData) {
  return calculateBonusPayoutSchema.safeParse({
    planId: readFormString(formData, "planId"),
    baseSalary: readFormString(formData, "baseSalary"),
    salesAmount: readFormString(formData, "salesAmount"),
    revenueAmount: readFormString(formData, "revenueAmount"),
    marginAmount: readFormString(formData, "marginAmount"),
    kpiScore: readFormString(formData, "kpiScore"),
    performanceRating: readFormString(formData, "performanceRating"),
    achievementPercent: readFormString(formData, "achievementPercent"),
  });
}

export * from "./hr.payroll.bonus-constants.shared";
export * from "./hr.payroll.bonus-mutation.schema";
