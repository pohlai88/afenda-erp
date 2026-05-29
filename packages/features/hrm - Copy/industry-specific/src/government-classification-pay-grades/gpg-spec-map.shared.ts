/**
 * Stable area keys for HRM-GPG-001 … HRM-GPG-031 (see ARCHITECTURE.md).
 */
export const HRM_GPG_SPEC_MAP = {
  "HRM-GPG-001": "classification-structures",
  "HRM-GPG-002": "classification-dimensions",
  "HRM-GPG-003": "pay-grades",
  "HRM-GPG-004": "pay-bands",
  "HRM-GPG-005": "salary-tables",
  "HRM-GPG-006": "salary-table-versioning",
  "HRM-GPG-007": "grade-step-values",
  "HRM-GPG-008": "gs-ses-references",
  "HRM-GPG-009": "employee-assignment",
  "HRM-GPG-010": "locality-rules",
  "HRM-GPG-011": "locality-adjusted-pay",
  "HRM-GPG-012": "adjustment-references",
  "HRM-GPG-013": "step-increase-rules",
  "HRM-GPG-014": "step-eligibility-date",
  "HRM-GPG-015": "eligible-employees",
  "HRM-GPG-016": "step-increase-processing",
  "HRM-GPG-017": "promotion-movement",
  "HRM-GPG-018": "reclassification",
  "HRM-GPG-019": "demotion",
  "HRM-GPG-020": "pay-retention",
  "HRM-GPG-021": "acting-grade",
  "HRM-GPG-022": "eligibility-validation",
  "HRM-GPG-023": "invalid-assignment-block",
  "HRM-GPG-024": "effective-dated-changes",
  "HRM-GPG-025": "assignment-history",
  "HRM-GPG-026": "payroll-export",
  "HRM-GPG-027": "lifecycle-export",
  "HRM-GPG-028": "reclassification-request",
  "HRM-GPG-029": "reports",
  "HRM-GPG-030": "permissions",
  "HRM-GPG-031": "audit-trail",
} as const

export type HrmGpgSpecCode = keyof typeof HRM_GPG_SPEC_MAP

export type HrmGpgSpecArea = (typeof HRM_GPG_SPEC_MAP)[HrmGpgSpecCode]

export function listHrmGpgSpecCodes(): readonly HrmGpgSpecCode[] {
  return Object.keys(HRM_GPG_SPEC_MAP) as HrmGpgSpecCode[]
}
