export const RWS_LIST_SURFACE_IDS = {
  stores: "hrm:rws:stores",
  periods: "hrm:rws:periods",
  coverageSlots: "hrm:rws:coverage-slots",
  coverageGaps: "hrm:rws:coverage-gaps",
  openShifts: "hrm:rws:open-shifts",
  demandReferences: "hrm:rws:demand-references",
  budgetSnapshots: "hrm:rws:budget-snapshots",
  attendanceCompare: "hrm:rws:attendance-compare",
  payrollReferences: "hrm:rws:payroll-references",
  reports: "hrm:rws:reports",
} as const

export type RwsListSurfaceId =
  (typeof RWS_LIST_SURFACE_IDS)[keyof typeof RWS_LIST_SURFACE_IDS]

export const RWS_STAT_SURFACE_KEY = "hrm:rws:overview" as const
