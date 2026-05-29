import { z } from "zod"

/** HRM-ENG-002 survey types. */
export const HRM_ENGAGEMENT_SURVEY_TYPES = [
  "engagement",
  "pulse",
  "satisfaction",
  "wellbeing",
  "culture",
  "exit_feedback",
] as const

export type HrmEngagementSurveyType =
  (typeof HRM_ENGAGEMENT_SURVEY_TYPES)[number]

export const hrmEngagementSurveyTypeSchema = z.enum(HRM_ENGAGEMENT_SURVEY_TYPES)

/** HRM-ENG-004 question types. */
export const HRM_ENGAGEMENT_QUESTION_TYPES = [
  "rating",
  "multi_choice",
  "single_choice",
  "open_text",
  "yes_no",
  "comment",
] as const

export type HrmEngagementQuestionType =
  (typeof HRM_ENGAGEMENT_QUESTION_TYPES)[number]

export const hrmEngagementQuestionTypeSchema = z.enum(
  HRM_ENGAGEMENT_QUESTION_TYPES
)

/** HRM-ENG-005 categories. */
export const HRM_ENGAGEMENT_CATEGORIES = [
  "leadership",
  "culture",
  "wellbeing",
  "workload",
  "recognition",
  "communication",
  "inclusion",
  "retention",
] as const

export type HrmEngagementCategory = (typeof HRM_ENGAGEMENT_CATEGORIES)[number]

export const hrmEngagementCategorySchema = z.enum(HRM_ENGAGEMENT_CATEGORIES)

/** HRM-ENG-007 / HRM-ENG-010 anonymity modes. */
export const HRM_ENGAGEMENT_ANONYMITY_MODES = ["anonymous", "named"] as const

export type HrmEngagementAnonymityMode =
  (typeof HRM_ENGAGEMENT_ANONYMITY_MODES)[number]

export const hrmEngagementAnonymityModeSchema = z.enum(
  HRM_ENGAGEMENT_ANONYMITY_MODES
)

/** Published survey lifecycle (slice 1+). */
export const HRM_ENGAGEMENT_SURVEY_STATES = [
  "draft",
  "scheduled",
  "published",
  "closed",
] as const

export type HrmEngagementSurveyState =
  (typeof HRM_ENGAGEMENT_SURVEY_STATES)[number]

export const hrmEngagementSurveyStateSchema = z.enum(
  HRM_ENGAGEMENT_SURVEY_STATES
)

/** Template bank lifecycle. */
export const HRM_ENGAGEMENT_TEMPLATE_STATES = [
  "draft",
  "active",
  "archived",
] as const

export type HrmEngagementTemplateState =
  (typeof HRM_ENGAGEMENT_TEMPLATE_STATES)[number]

export const hrmEngagementTemplateStateSchema = z.enum(
  HRM_ENGAGEMENT_TEMPLATE_STATES
)

/** Invitation + response states (slice 3+). */
export const HRM_ENGAGEMENT_INVITATION_STATES = [
  "pending",
  "submitted",
  "expired",
] as const

export const HRM_ENGAGEMENT_RESPONSE_STATES = ["draft", "submitted"] as const

export const HRM_ENGAGEMENT_IMPROVEMENT_ACTION_STATES = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const
