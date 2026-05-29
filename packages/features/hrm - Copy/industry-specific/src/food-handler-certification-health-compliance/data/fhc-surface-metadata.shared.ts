/** Governed list / KPI surface keys for Food Handler Compliance (ADR-0026). */
export const FHC_LIST_SURFACE_IDS = {
  requirementRules: "hrm:food-handler:requirement-rules",
  obligations: "hrm:food-handler:obligations",
  verificationQueue: "hrm:food-handler:verification-queue",
  overview: "hrm:food-handler:overview",
  reports: "hrm:food-handler:reports",
  expiryAlerts: "hrm:food-handler:expiry-alerts",
  dutyRestrictions: "hrm:food-handler:duty-restrictions",
  healthRecords: "hrm:food-handler:health-records",
} as const

export const FHC_STAT_SURFACE_KEY = "hrm:food-handler:compliance-kpi" as const

export type FhcListSurfaceId =
  (typeof FHC_LIST_SURFACE_IDS)[keyof typeof FHC_LIST_SURFACE_IDS]
