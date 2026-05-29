/**
 * Stable area keys for HRM-LMS-001 … HRM-LMS-030 (see ARCHITECTURE.md).
 */
export const HRM_LMS_SPEC_MAP = {
  "HRM-LMS-001": "course-catalog",
  "HRM-LMS-002": "course-types",
  "HRM-LMS-003": "course-metadata",
  "HRM-LMS-004": "content-references",
  "HRM-LMS-005": "scorm-xapi-refs",
  "HRM-LMS-006": "learning-paths",
  "HRM-LMS-007": "path-types",
  "HRM-LMS-008": "assignment",
  "HRM-LMS-009": "mandatory-classification",
  "HRM-LMS-010": "self-enrollment",
  "HRM-LMS-011": "enrollment-approval",
  "HRM-LMS-012": "progress-status",
  "HRM-LMS-013": "lesson-progress",
  "HRM-LMS-014": "assessments",
  "HRM-LMS-015": "assessment-scores",
  "HRM-LMS-016": "attempt-limits",
  "HRM-LMS-017": "certificates",
  "HRM-LMS-018": "certification-lifecycle",
  "HRM-LMS-019": "reminders",
  "HRM-LMS-020": "compliance-assignment",
  "HRM-LMS-021": "compliance-export",
  "HRM-LMS-022": "onboarding-export",
  "HRM-LMS-023": "training-development-export",
  "HRM-LMS-024": "overview-employee",
  "HRM-LMS-025": "overview-manager",
  "HRM-LMS-026": "overview-hr",
  "HRM-LMS-027": "reports",
  "HRM-LMS-028": "permissions",
  "HRM-LMS-029": "learning-history",
  "HRM-LMS-030": "audit-trail",
} as const

export type HrmLmsSpecCode = keyof typeof HRM_LMS_SPEC_MAP

export type HrmLmsSpecArea = (typeof HRM_LMS_SPEC_MAP)[HrmLmsSpecCode]

export function listHrmLmsSpecCodes(): readonly HrmLmsSpecCode[] {
  return Object.keys(HRM_LMS_SPEC_MAP) as HrmLmsSpecCode[]
}
