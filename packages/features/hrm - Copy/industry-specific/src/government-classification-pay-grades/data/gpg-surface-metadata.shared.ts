export const GPG_LIST_SURFACE_IDS = {
  classifications: "hrm:gpg:classifications",
  payGrades: "hrm:gpg:pay-grades",
  payBands: "hrm:gpg:pay-bands",
  salaryTables: "hrm:gpg:salary-tables",
  salaryTableRows: "hrm:gpg:salary-table-rows",
  assignments: "hrm:gpg:assignments",
  localityRules: "hrm:gpg:locality-rules",
  adjustmentReferences: "hrm:gpg:adjustment-references",
  stepIncreaseRules: "hrm:gpg:step-increase-rules",
  stepEligible: "hrm:gpg:step-eligible",
  stepIncreaseEvents: "hrm:gpg:step-increase-events",
  gradeMovements: "hrm:gpg:grade-movements",
  assignmentHistory: "hrm:gpg:assignment-history",
  reclassificationRequests: "hrm:gpg:reclassification-requests",
  reports: "hrm:gpg:reports",
} as const

export type GpgListSurfaceId =
  (typeof GPG_LIST_SURFACE_IDS)[keyof typeof GPG_LIST_SURFACE_IDS]

export const GPG_STAT_SURFACE_KEY = "hrm:gpg:overview" as const
