/** BON-002 plan types. */
export const HR_BONUS_PLAN_TYPES = [
  "annual_bonus",
  "performance_bonus",
  "discretionary_bonus",
  "contractual_bonus",
  "sales_commission",
  "project_incentive",
  "productivity_incentive",
  "retention_incentive",
  "referral_incentive",
] as const;

export type HrBonusPlanType = (typeof HR_BONUS_PLAN_TYPES)[number];

/** BON-009 payout formula kinds. */
export const HR_BONUS_PAYOUT_FORMULA_KINDS = [
  "fixed_amount",
  "salary_percentage",
  "sales_percentage",
  "revenue_percentage",
  "margin_percentage",
  "kpi_score",
  "performance_rating",
] as const;

export type HrBonusPayoutFormulaKind =
  (typeof HR_BONUS_PAYOUT_FORMULA_KINDS)[number];

/** BON-006 target kinds (stub for achievement slice). */
export const HR_BONUS_TARGET_KINDS = [
  "individual",
  "team",
  "department",
  "company",
  "sales",
  "revenue",
  "profit",
  "project",
  "kpi",
] as const;

export type HrBonusTargetKind = (typeof HR_BONUS_TARGET_KINDS)[number];

export const HR_BONUS_READ_CAPABILITY = "hr.bonus.read" as const;
export const HR_BONUS_WRITE_CAPABILITY = "hr.bonus.write" as const;
export const HR_BONUS_SENSITIVE_READ_CAPABILITY =
  "hr.bonus.sensitive.read" as const;
export const HR_BONUS_FINANCE_READ_CAPABILITY = "hr.bonus.finance.read" as const;
export const HR_BONUS_AUDIT_READ_CAPABILITY = "hr.bonus.audit.read" as const;
export const HR_BONUS_APPROVE_CAPABILITY = "hr.bonus.approve" as const;
