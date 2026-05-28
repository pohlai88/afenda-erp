/**
 * Stable area keys for HRM-ENG-001 … HRM-ENG-034 (see ARCHITECTURE.md).
 * Area slugs are implementation tags — not acceptance-criteria status.
 */
export const HRM_ENGAGEMENT_SPEC_MAP = {
  "HRM-ENG-001": "survey-management",
  "HRM-ENG-002": "survey-types",
  "HRM-ENG-003": "survey-templates",
  "HRM-ENG-004": "question-types",
  "HRM-ENG-005": "survey-categories",
  "HRM-ENG-006": "survey-audience",
  "HRM-ENG-007": "anonymous-mode",
  "HRM-ENG-008": "anonymity-threshold",
  "HRM-ENG-009": "anti-deanonymization",
  "HRM-ENG-010": "named-mode",
  "HRM-ENG-011": "survey-schedule",
  "HRM-ENG-012": "survey-invitations",
  "HRM-ENG-013": "employee-submit",
  "HRM-ENG-014": "duplicate-prevention",
  "HRM-ENG-015": "draft-responses",
  "HRM-ENG-016": "response-rate",
  "HRM-ENG-017": "completion-tracking",
  "HRM-ENG-018": "score-averages",
  "HRM-ENG-019": "engagement-index",
  "HRM-ENG-020": "employee-nps",
  "HRM-ENG-021": "trend-analysis",
  "HRM-ENG-022": "risk-segments",
  "HRM-ENG-023": "open-text-review",
  "HRM-ENG-024": "benchmark-comparison",
  "HRM-ENG-025": "improvement-actions",
  "HRM-ENG-026": "action-assignment",
  "HRM-ENG-027": "action-progress",
  "HRM-ENG-028": "overdue-notifications",
  "HRM-ENG-029": "engagement-analytics-overview",
  "HRM-ENG-030": "survey-reports",
  "HRM-ENG-031": "permission-gates",
  "HRM-ENG-032": "segment-suppression",
  "HRM-ENG-033": "cycle-history",
  "HRM-ENG-034": "audit-trail",
} as const

export type HrmEngagementSpecCode = keyof typeof HRM_ENGAGEMENT_SPEC_MAP

export type HrmEngagementSpecArea =
  (typeof HRM_ENGAGEMENT_SPEC_MAP)[HrmEngagementSpecCode]

export function listHrmEngagementSpecCodes(): readonly HrmEngagementSpecCode[] {
  return Object.keys(HRM_ENGAGEMENT_SPEC_MAP) as HrmEngagementSpecCode[]
}
