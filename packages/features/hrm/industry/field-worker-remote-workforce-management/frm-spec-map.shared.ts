/**
 * Stable area keys for HRM-FRM-001 … HRM-FRM-031 (see ARCHITECTURE.md).
 */
export const HRM_FRM_SPEC_MAP = {
  "HRM-FRM-001": "field-assignments",
  "HRM-FRM-002": "worksites",
  "HRM-FRM-003": "assignment-metadata",
  "HRM-FRM-004": "assignment-types",
  "HRM-FRM-005": "mobile-clock-in",
  "HRM-FRM-006": "mobile-break",
  "HRM-FRM-007": "gps-validation-reference",
  "HRM-FRM-008": "worksite-validation",
  "HRM-FRM-009": "attendance-exceptions",
  "HRM-FRM-010": "offline-capture",
  "HRM-FRM-011": "offline-reconcile",
  "HRM-FRM-012": "schedule-references",
  "HRM-FRM-013": "travel-status",
  "HRM-FRM-014": "travel-classification",
  "HRM-FRM-015": "per-diem-eligibility",
  "HRM-FRM-016": "per-diem-rates",
  "HRM-FRM-017": "per-diem-components",
  "HRM-FRM-018": "per-diem-export",
  "HRM-FRM-019": "travel-approval-reference",
  "HRM-FRM-020": "travel-compliance-checklist",
  "HRM-FRM-021": "travel-non-compliance",
  "HRM-FRM-022": "safety-checkin",
  "HRM-FRM-023": "manager-overview",
  "HRM-FRM-024": "notifications",
  "HRM-FRM-025": "leave-attendance-export",
  "HRM-FRM-026": "overtime-export",
  "HRM-FRM-027": "payroll-export",
  "HRM-FRM-028": "reports",
  "HRM-FRM-029": "permissions",
  "HRM-FRM-030": "no-background-location",
  "HRM-FRM-031": "audit-trail",
} as const

export type HrmFrmSpecCode = keyof typeof HRM_FRM_SPEC_MAP

export type HrmFrmSpecArea = (typeof HRM_FRM_SPEC_MAP)[HrmFrmSpecCode]

export function listHrmFrmSpecCodes(): readonly HrmFrmSpecCode[] {
  return Object.keys(HRM_FRM_SPEC_MAP) as HrmFrmSpecCode[]
}
