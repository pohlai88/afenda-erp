export const SUCCESSION_LIST_SURFACE_IDS = {
  criticalRoles: "hrm:succession:critical-roles",
  nominations: "hrm:succession:nominations",
  talentPools: "hrm:succession:talent-pools",
  calibrationSessions: "hrm:succession:calibration-sessions",
  benchStrength: "hrm:succession:bench-strength",
  riskFlags: "hrm:succession:risk-flags",
} as const

export const SUCCESSION_STAT_SURFACE_KEY = "hrm:succession:overview" as const

export type SuccessionListSurfaceId =
  (typeof SUCCESSION_LIST_SURFACE_IDS)[keyof typeof SUCCESSION_LIST_SURFACE_IDS]
