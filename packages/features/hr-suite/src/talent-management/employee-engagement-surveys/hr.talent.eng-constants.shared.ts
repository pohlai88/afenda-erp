import type { AppCapability } from "@afenda/kernel";

export const HR_TALENT_ENG_READ_CAPABILITY =
  "hr.eng.read" satisfies AppCapability;
export const HR_TALENT_ENG_WRITE_CAPABILITY =
  "hr.eng.write" satisfies AppCapability;
export const HR_TALENT_ENG_APPROVE_CAPABILITY =
  "hr.eng.approve" satisfies AppCapability;
export const HR_TALENT_ENG_AUDIT_READ_CAPABILITY =
  "hr.eng.audit.read" satisfies AppCapability;
export const HR_TALENT_ENG_RESTRICTED_READ_CAPABILITY =
  "hr.eng.restricted.read" satisfies AppCapability;
export const HR_TALENT_ENG_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.eng.integration.expose" satisfies AppCapability;

export const HR_TALENT_ENG_SURVEY_TYPES = [
  "engagement",
  "pulse",
  "satisfaction",
  "wellbeing",
  "culture",
  "exit_feedback",
] as const;

export const HR_TALENT_ENG_QUESTION_TYPES = [
  "rating_scale",
  "multiple_choice",
  "single_choice",
  "open_text",
  "yes_no",
  "comment",
] as const;

export const HR_TALENT_ENG_CATEGORIES = [
  "leadership",
  "culture",
  "wellbeing",
  "workload",
  "recognition",
  "communication",
  "inclusion",
  "retention",
] as const;

export const HR_TALENT_ENG_AUDIENCE_DIMENSIONS = [
  "legal_entity",
  "department",
  "location",
  "manager",
  "grade",
  "tenure",
  "employment_type",
  "employee_category",
] as const;

export const HR_TALENT_ENG_ANONYMITY_MODES = [
  "anonymous",
  "named",
] as const;

export const HR_TALENT_ENG_TEMPLATE_STATUSES = [
  "active",
  "deprecated",
] as const;

export const HR_TALENT_ENG_SURVEY_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "closed",
  "analyzed",
  "archived",
] as const;

export const HR_TALENT_ENG_INVITATION_STATUSES = [
  "queued",
  "sent",
  "reminded",
  "opened",
  "submitted",
  "expired",
] as const;

export const HR_TALENT_ENG_RESPONSE_STATUSES = [
  "draft",
  "submitted",
] as const;

export const HR_TALENT_ENG_IMPROVEMENT_STATUSES = [
  "open",
  "in_progress",
  "blocked",
  "completed",
  "overdue",
] as const;

export const HR_TALENT_ENG_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const HR_TALENT_ENG_COMMENT_TAGS = [
  "leadership",
  "workload",
  "wellbeing",
  "recognition",
  "retention_risk",
  "culture",
  "communication",
  "inclusion",
  "unclassified",
] as const;

export const HR_TALENT_ENG_REPORT_GROUP_BY = [
  "survey",
  "category",
  "department",
  "location",
  "manager",
  "period",
] as const;

export const HR_TALENT_ENG_STATUS_FILTERS = [
  "all",
  "draft",
  "scheduled",
  "published",
  "closed",
  "analyzed",
  "archived",
  "queued",
  "sent",
  "reminded",
  "opened",
  "submitted",
  "expired",
  "open",
  "in_progress",
  "blocked",
  "completed",
  "overdue",
] as const;

export const HR_TALENT_ENG_SEGMENT_DIMENSION_FILTERS = [
  "all",
  ...HR_TALENT_ENG_AUDIENCE_DIMENSIONS,
] as const;

export type HrTalentEngSurveyType =
  (typeof HR_TALENT_ENG_SURVEY_TYPES)[number];
export type HrTalentEngQuestionType =
  (typeof HR_TALENT_ENG_QUESTION_TYPES)[number];
export type HrTalentEngCategory =
  (typeof HR_TALENT_ENG_CATEGORIES)[number];
export type HrTalentEngAudienceDimension =
  (typeof HR_TALENT_ENG_AUDIENCE_DIMENSIONS)[number];
export type HrTalentEngAnonymityMode =
  (typeof HR_TALENT_ENG_ANONYMITY_MODES)[number];
export type HrTalentEngTemplateStatus =
  (typeof HR_TALENT_ENG_TEMPLATE_STATUSES)[number];
export type HrTalentEngSurveyStatus =
  (typeof HR_TALENT_ENG_SURVEY_STATUSES)[number];
export type HrTalentEngInvitationStatus =
  (typeof HR_TALENT_ENG_INVITATION_STATUSES)[number];
export type HrTalentEngResponseStatus =
  (typeof HR_TALENT_ENG_RESPONSE_STATUSES)[number];
export type HrTalentEngImprovementStatus =
  (typeof HR_TALENT_ENG_IMPROVEMENT_STATUSES)[number];
export type HrTalentEngPriority =
  (typeof HR_TALENT_ENG_PRIORITIES)[number];
export type HrTalentEngCommentTag =
  (typeof HR_TALENT_ENG_COMMENT_TAGS)[number];
export type HrTalentEngReportGroupBy =
  (typeof HR_TALENT_ENG_REPORT_GROUP_BY)[number];
export type HrTalentEngStatusFilter =
  (typeof HR_TALENT_ENG_STATUS_FILTERS)[number];
export type HrTalentEngSegmentDimensionFilter =
  (typeof HR_TALENT_ENG_SEGMENT_DIMENSION_FILTERS)[number];
