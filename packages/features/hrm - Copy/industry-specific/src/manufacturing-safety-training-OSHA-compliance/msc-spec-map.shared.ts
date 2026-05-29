/**
 * Stable area keys for HRM-MSC-001 … HRM-MSC-031 (see ARCHITECTURE.md).
 *
 * Reserved for future ARCHITECTURE expansion: HRM-MSC-032 … HRM-MSC-040 — add
 * rows here only after ARCHITECTURE.md defines them.
 */
export const HRM_MSC_SPEC_MAP = {
  "HRM-MSC-001": "safety-requirement-rules",
  "HRM-MSC-002": "employee-identification",
  "HRM-MSC-003": "training-completion",
  "HRM-MSC-004": "regulatory-reference",
  "HRM-MSC-005": "machine-safety-training",
  "HRM-MSC-006": "ppe-training",
  "HRM-MSC-007": "hazard-training",
  "HRM-MSC-008": "safety-certification",
  "HRM-MSC-009": "missing-training-flag",
  "HRM-MSC-010": "expiring-cert-flag",
  "HRM-MSC-011": "work-restriction",
  "HRM-MSC-012": "workplace-hazard-assessment",
  "HRM-MSC-013": "ppe-hazard-assessment",
  "HRM-MSC-014": "job-hazard-analysis",
  "HRM-MSC-015": "hazard-assessment-status",
  "HRM-MSC-016": "incident-reporting",
  "HRM-MSC-017": "incident-types",
  "HRM-MSC-018": "incident-capture",
  "HRM-MSC-019": "osha-recordkeeping",
  "HRM-MSC-020": "incident-status",
  "HRM-MSC-021": "corrective-action-assignment",
  "HRM-MSC-022": "corrective-action-tracking",
  "HRM-MSC-023": "notifications",
  "HRM-MSC-024": "compliance-export",
  "HRM-MSC-025": "learning-requirements",
  "HRM-MSC-026": "scheduling-export",
  "HRM-MSC-027": "evidence-link",
  "HRM-MSC-028": "compliance-overview",
  "HRM-MSC-029": "compliance-reports",
  "HRM-MSC-030": "permission-matrix",
  "HRM-MSC-031": "audit-trail",
} as const

export type HrmMscSpecCode = keyof typeof HRM_MSC_SPEC_MAP

export type HrmMscSpecArea = (typeof HRM_MSC_SPEC_MAP)[HrmMscSpecCode]

export function listHrmMscSpecCodes(): readonly HrmMscSpecCode[] {
  return Object.keys(HRM_MSC_SPEC_MAP) as HrmMscSpecCode[]
}
