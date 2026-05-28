/** Stable area keys for HRM-UCB-001 … HRM-UCB-030 (see ARCHITECTURE.md). */
export const HRM_UCB_SPEC_MAP = {
  "HRM-UCB-001": "union-records",
  "HRM-UCB-002": "collective-agreements",
  "HRM-UCB-003": "agreement-lifecycle",
  "HRM-UCB-004": "bargaining-unit-assignment",
  "HRM-UCB-005": "membership-status",
  "HRM-UCB-006": "membership-dates",
  "HRM-UCB-007": "membership-access",
  "HRM-UCB-008": "cba-rule-references",
  "HRM-UCB-009": "payroll-rule-export",
  "HRM-UCB-010": "overtime-rule-export",
  "HRM-UCB-011": "leave-rule-export",
  "HRM-UCB-012": "scheduling-rule-export",
  "HRM-UCB-013": "seniority-date",
  "HRM-UCB-014": "seniority-ranking",
  "HRM-UCB-015": "seniority-use-cases",
  "HRM-UCB-016": "compliance-findings",
  "HRM-UCB-017": "dues-references",
  "HRM-UCB-018": "payroll-dues-export",
  "HRM-UCB-019": "grievance-create",
  "HRM-UCB-020": "grievance-classification",
  "HRM-UCB-021": "grievance-steps",
  "HRM-UCB-022": "grievance-status",
  "HRM-UCB-023": "dispute-refs",
  "HRM-UCB-024": "representatives",
  "HRM-UCB-025": "lr-meetings",
  "HRM-UCB-026": "cba-renewal",
  "HRM-UCB-027": "alerts",
  "HRM-UCB-028": "reports",
  "HRM-UCB-029": "permissions",
  "HRM-UCB-030": "audit-trail",
} as const

export type HrmUcbSpecCode = keyof typeof HRM_UCB_SPEC_MAP

export type HrmUcbSpecArea = (typeof HRM_UCB_SPEC_MAP)[HrmUcbSpecCode]

export function listHrmUcbSpecCodes(): readonly HrmUcbSpecCode[] {
  return Object.keys(HRM_UCB_SPEC_MAP) as HrmUcbSpecCode[]
}
