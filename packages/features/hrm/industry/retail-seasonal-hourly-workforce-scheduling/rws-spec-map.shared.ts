/** Stable area keys for HRM-RWS-001 … HRM-RWS-034 (see ARCHITECTURE.md). */
export const HRM_RWS_SPEC_MAP = {
  "HRM-RWS-001": "workforce-schedules",
  "HRM-RWS-002": "org-scope",
  "HRM-RWS-003": "period-kinds",
  "HRM-RWS-004": "draft-schedules",
  "HRM-RWS-005": "schedule-publication",
  "HRM-RWS-006": "availability-preferences",
  "HRM-RWS-007": "blocked-dates",
  "HRM-RWS-008": "availability-validation",
  "HRM-RWS-009": "coverage-requirements",
  "HRM-RWS-010": "staffing-compare",
  "HRM-RWS-011": "role-coverage",
  "HRM-RWS-012": "skill-validation",
  "HRM-RWS-013": "open-shifts",
  "HRM-RWS-014": "open-shift-approval",
  "HRM-RWS-015": "shift-swaps",
  "HRM-RWS-016": "swap-eligibility",
  "HRM-RWS-017": "swap-workflow",
  "HRM-RWS-018": "swap-manager-actions",
  "HRM-RWS-019": "swap-reason",
  "HRM-RWS-020": "labor-demand-references",
  "HRM-RWS-021": "scheduled-labor-hours",
  "HRM-RWS-022": "scheduled-labor-cost",
  "HRM-RWS-023": "labor-budget-compare",
  "HRM-RWS-024": "budget-warnings",
  "HRM-RWS-025": "overtime-risk",
  "HRM-RWS-026": "work-hour-compliance",
  "HRM-RWS-027": "restricted-worker-rules",
  "HRM-RWS-028": "peak-season-rules",
  "HRM-RWS-029": "employee-notifications",
  "HRM-RWS-030": "attendance-compare",
  "HRM-RWS-031": "payroll-references",
  "HRM-RWS-032": "reports",
  "HRM-RWS-033": "permissions",
  "HRM-RWS-034": "audit-trail",
} as const

export type HrmRwsSpecCode = keyof typeof HRM_RWS_SPEC_MAP

export type HrmRwsSpecArea = (typeof HRM_RWS_SPEC_MAP)[HrmRwsSpecCode]

export function listHrmRwsSpecCodes(): readonly HrmRwsSpecCode[] {
  return Object.keys(HRM_RWS_SPEC_MAP) as HrmRwsSpecCode[]
}
