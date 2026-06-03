/** SBS-022 — benchmark version lifecycle statuses. */
export const HR_SBS_VERSION_STATUSES = [
  "draft",
  "active",
  "superseded",
  "archived",
] as const;

export type HrSbsVersionStatus = (typeof HR_SBS_VERSION_STATUSES)[number];

export const HR_SBS_READ_CAPABILITY = "hr.sbs.read" as const;
export const HR_SBS_WRITE_CAPABILITY = "hr.sbs.write" as const;
export const HR_SBS_APPROVE_CAPABILITY = "hr.sbs.approve" as const;

export const HR_SBS_EDITABLE_VERSION_STATUSES = ["draft"] as const;

export const HR_SBS_CURRENCY_RATE_SOURCES = [
  "manual",
  "ecb",
  "survey_provider",
  "internal",
] as const;

export type HrSbsCurrencyRateSource = (typeof HR_SBS_CURRENCY_RATE_SOURCES)[number];
