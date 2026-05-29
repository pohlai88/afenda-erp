export const FRM_LIST_SURFACE_IDS = {
  worksites: "hrm:field-workforce:worksites",
  assignments: "hrm:field-workforce:assignments",
  exceptions: "hrm:field-workforce:exceptions",
  travel: "hrm:field-workforce:travel",
  perDiemReferences: "hrm:field-workforce:per-diem-references",
  managerTeam: "hrm:field-workforce:manager-team",
} as const

export type FrmListSurfaceId =
  (typeof FRM_LIST_SURFACE_IDS)[keyof typeof FRM_LIST_SURFACE_IDS]

export const FRM_STAT_SURFACE_KEY = "hrm:field-workforce:overview-kpis"
