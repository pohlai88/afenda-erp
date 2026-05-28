export const HRM_SUCCESSION_SPEC_MAP = {
  "HRM-SUC-001": "critical-roles",
  "HRM-SUC-002": "role-classification",
  "HRM-SUC-003": "role-org-links",
  "HRM-SUC-004": "successor-nomination",
  "HRM-SUC-005": "multiple-successors",
  "HRM-SUC-006": "successor-types",
  "HRM-SUC-007": "readiness-assessment",
  "HRM-SUC-008": "readiness-levels",
  "HRM-SUC-009": "performance-references",
  "HRM-SUC-010": "potential-assessment",
  "HRM-SUC-011": "performance-potential-grid",
  "HRM-SUC-012": "competency-gaps",
  "HRM-SUC-013": "development-plan-link",
  "HRM-SUC-014": "development-actions",
  "HRM-SUC-015": "development-progress",
  "HRM-SUC-016": "talent-pools",
  "HRM-SUC-017": "calibration-sessions",
  "HRM-SUC-018": "calibration-outcomes",
  "HRM-SUC-019": "bench-strength",
  "HRM-SUC-020": "no-ready-successor-flag",
  "HRM-SUC-021": "weak-coverage-flag",
  "HRM-SUC-022": "succession-risk",
  "HRM-SUC-023": "emergency-replacement",
  "HRM-SUC-024": "planned-replacement",
  "HRM-SUC-025": "review-cycles",
  "HRM-SUC-026": "notifications",
  "HRM-SUC-027": "lifecycle-export",
  "HRM-SUC-028": "reports",
  "HRM-SUC-029": "permissions",
  "HRM-SUC-030": "audit-trail",
} as const

export type HrmSuccessionSpecCode = keyof typeof HRM_SUCCESSION_SPEC_MAP

export type HrmSuccessionSpecArea =
  (typeof HRM_SUCCESSION_SPEC_MAP)[HrmSuccessionSpecCode]

export function listHrmSuccessionSpecCodes(): readonly HrmSuccessionSpecCode[] {
  return Object.keys(HRM_SUCCESSION_SPEC_MAP) as HrmSuccessionSpecCode[]
}
