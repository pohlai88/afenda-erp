/**
 * Stable area keys for HRM-FHC-001 … HRM-FHC-025 (see ARCHITECTURE.md).
 * Area slugs are implementation tags — not acceptance-criteria status.
 *
 * Reserved for future ARCHITECTURE expansion: HRM-FHC-026 … HRM-FHC-035 — add
 * rows here only after ARCHITECTURE.md defines them.
 */
export const HRM_FHC_SPEC_MAP = {
  "HRM-FHC-001": "requirement-rules",
  "HRM-FHC-002": "employee-identification",
  "HRM-FHC-003": "food-handler-permit",
  "HRM-FHC-004": "hygiene-training",
  "HRM-FHC-005": "allergen-training",
  "HRM-FHC-006": "health-certificate",
  "HRM-FHC-007": "evidence-link",
  "HRM-FHC-008": "compliance-status",
  "HRM-FHC-009": "food-handling-eligibility",
  "HRM-FHC-010": "role-without-cert-flag",
  "HRM-FHC-011": "expired-permit-flag",
  "HRM-FHC-012": "missing-health-flag",
  "HRM-FHC-013": "overdue-training-flag",
  "HRM-FHC-014": "pre-expiry-alerts",
  "HRM-FHC-015": "renewal-tracking",
  "HRM-FHC-016": "verification-workflow",
  "HRM-FHC-017": "rejection-reason",
  "HRM-FHC-018": "duty-restriction",
  "HRM-FHC-019": "scheduling-export",
  "HRM-FHC-020": "compliance-export",
  "HRM-FHC-021": "learning-requirements",
  "HRM-FHC-022": "compliance-overview",
  "HRM-FHC-023": "compliance-reports",
  "HRM-FHC-024": "health-record-access",
  "HRM-FHC-025": "audit-trail",
} as const

export type HrmFhcSpecCode = keyof typeof HRM_FHC_SPEC_MAP

export type HrmFhcSpecArea = (typeof HRM_FHC_SPEC_MAP)[HrmFhcSpecCode]

export function listHrmFhcSpecCodes(): readonly HrmFhcSpecCode[] {
  return Object.keys(HRM_FHC_SPEC_MAP) as HrmFhcSpecCode[]
}
