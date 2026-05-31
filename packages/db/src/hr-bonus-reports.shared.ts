/** HRM-BON-028 report kinds — bonus, commission, incentive, variance, eligibility. */
export const HR_BONUS_REPORT_KINDS = [
  "bonus",
  "commission",
  "incentive",
  "payout_variance",
  "eligibility",
] as const;

export type HrBonusReportKind = (typeof HR_BONUS_REPORT_KINDS)[number];

export const HR_BONUS_REPORT_EXPORT_ROW_CAP = 5000;

export const HR_BONUS_COMMISSION_PLAN_TYPES = ["sales_commission"] as const;

export const HR_BONUS_INCENTIVE_PLAN_TYPES = [
  "project_incentive",
  "productivity_incentive",
  "retention_incentive",
  "referral_incentive",
] as const;

export const HR_BONUS_BONUS_PLAN_TYPES = [
  "annual_bonus",
  "performance_bonus",
  "discretionary_bonus",
  "contractual_bonus",
] as const;
