export const HR_CSF_ASSESSMENT_TYPES = [
  "self",
  "manager",
  "hr_validation",
] as const;

export type HrCsfAssessmentType = (typeof HR_CSF_ASSESSMENT_TYPES)[number];

export const HR_CSF_ASSESSMENT_TARGETS = ["competency", "skill"] as const;

export type HrCsfAssessmentTarget = (typeof HR_CSF_ASSESSMENT_TARGETS)[number];

export const HR_CSF_ASSESSMENT_STATUSES = [
  "draft",
  "submitted",
  "validated",
  "superseded",
] as const;

export type HrCsfAssessmentStatus = (typeof HR_CSF_ASSESSMENT_STATUSES)[number];

export const HR_CSF_PROFILE_STATUSES = ["active", "inactive"] as const;

export type HrCsfProfileStatus = (typeof HR_CSF_PROFILE_STATUSES)[number];

export const HR_CSF_CONFIDENCE_LEVELS = [1, 2, 3, 4, 5] as const;

export type HrCsfConfidenceLevel = (typeof HR_CSF_CONFIDENCE_LEVELS)[number];

export const HR_CSF_READ_CAPABILITY = "hr.csf.read" as const;
export const HR_CSF_WRITE_CAPABILITY = "hr.csf.write" as const;
export const HR_CSF_ASSESS_SELF_CAPABILITY = "hr.csf.assess.self" as const;
export const HR_CSF_ASSESS_MANAGER_CAPABILITY = "hr.csf.assess.manager" as const;
export const HR_CSF_ASSESS_VALIDATE_CAPABILITY = "hr.csf.assess.validate" as const;

/** CSF-003 competency library categories. */
export const HR_CSF_COMPETENCY_CATEGORIES = [
  "core",
  "leadership",
  "technical",
  "behavioral",
  "functional",
  "safety",
  "compliance",
] as const;

export type HrCsfCompetencyCategory = (typeof HR_CSF_COMPETENCY_CATEGORIES)[number];

/** CSF-004 skill library categories. */
export const HR_CSF_SKILL_CATEGORIES = [
  "job_family",
  "department",
  "function",
  "role",
  "capability_domain",
] as const;

export type HrCsfSkillCategory = (typeof HR_CSF_SKILL_CATEGORIES)[number];

export const HR_CSF_LIBRARY_STATUSES = [
  "draft",
  "active",
  "inactive",
  "archived",
] as const;

export type HrCsfLibraryStatus = (typeof HR_CSF_LIBRARY_STATUSES)[number];

/** CSF-007/008 requirement mapping scopes. */
export const HR_CSF_REQUIREMENT_SCOPES = [
  "job_role",
  "job_family",
  "grade",
  "position",
  "department",
  "legal_entity",
] as const;

export type HrCsfRequirementScope = (typeof HR_CSF_REQUIREMENT_SCOPES)[number];

/** CSF-009 skill requirement classes (schema enum alias). */
export const HR_CSF_SKILL_REQUIREMENT_CLASSES = [
  "mandatory",
  "preferred",
  "critical",
  "optional",
] as const;

export type HrCsfSkillRequirementClass =
  (typeof HR_CSF_SKILL_REQUIREMENT_CLASSES)[number];

/** HRM-CSF-005 proficiency scale labels. */
export const HR_CSF_PROFICIENCY_LEVELS = [
  "beginner",
  "working",
  "competent",
  "advanced",
  "expert",
] as const;

export type HrCsfProficiencyLevel = (typeof HR_CSF_PROFICIENCY_LEVELS)[number];

/** HRM-CSF-009 skill requirement classification. */
export const HR_CSF_SKILL_REQUIREMENT_KINDS = [
  "mandatory",
  "preferred",
  "critical",
  "optional",
] as const;

export type HrCsfSkillRequirementKind =
  (typeof HR_CSF_SKILL_REQUIREMENT_KINDS)[number];

/** HRM-CSF-020 gap classification. */
export const HR_CSF_GAP_SEVERITIES = [
  "low",
  "moderate",
  "high",
  "critical",
] as const;

export type HrCsfGapSeverity = (typeof HR_CSF_GAP_SEVERITIES)[number];

export const HR_CSF_REPORT_GROUP_BY = [
  "employee",
  "role",
  "department",
  "job_family",
  "grade",
  "proficiency",
] as const;

export type HrCsfReportGroupBy = (typeof HR_CSF_REPORT_GROUP_BY)[number];

export const HR_CSF_MATCH_TARGET_KINDS = [
  "role",
  "project",
  "critical_position",
] as const;

export type HrCsfMatchTargetKind = (typeof HR_CSF_MATCH_TARGET_KINDS)[number];
