/** Governed list / KPI surface keys for Manufacturing Safety (ADR-0026). */
export const MSC_LIST_SURFACE_IDS = {
  requirements: "hrm:msc:requirements",
  certifications: "hrm:msc:certifications",
  obligations: "hrm:msc:obligations",
  hazardAssessments: "hrm:msc:hazard-assessments",
  incidents: "hrm:msc:incidents",
  correctiveActions: "hrm:msc:corrective-actions",
  overview: "hrm:msc:overview",
  reports: "hrm:msc:reports",
  workRestrictions: "hrm:msc:work-restrictions",
  masters: "hrm:msc:masters",
  regulatoryReferences: "hrm:msc:regulatory-references",
  evidence: "hrm:msc:evidence",
  sites: "hrm:msc:sites",
  machines: "hrm:msc:machines",
} as const

export const MSC_STAT_SURFACE_KEY = "hrm:msc:overview" as const

export type MscListSurfaceId =
  (typeof MSC_LIST_SURFACE_IDS)[keyof typeof MSC_LIST_SURFACE_IDS]
