import { z } from "zod";

import {
  HR_TALENT_ENG_ANONYMITY_MODES,
  HR_TALENT_ENG_AUDIENCE_DIMENSIONS,
  HR_TALENT_ENG_CATEGORIES,
  HR_TALENT_ENG_COMMENT_TAGS,
  HR_TALENT_ENG_IMPROVEMENT_STATUSES,
  HR_TALENT_ENG_INVITATION_STATUSES,
  HR_TALENT_ENG_PRIORITIES,
  HR_TALENT_ENG_QUESTION_TYPES,
  HR_TALENT_ENG_RESPONSE_STATUSES,
  HR_TALENT_ENG_SURVEY_STATUSES,
  HR_TALENT_ENG_SURVEY_TYPES,
  HR_TALENT_ENG_TEMPLATE_STATUSES,
} from "./hr.talent.eng-constants.shared";

const isoDateTime = z.string().datetime();
const optionalIsoDateTime = isoDateTime.optional();
const score = z.number().min(0).max(5);
const percent = z.number().min(0).max(100);

export const hrTalentEngAudienceMemberSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeNumber: z.string().min(1),
  displayName: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  managerUserId: z.string().min(1),
  managerName: z.string().min(1),
  legalEntity: z.string().min(1),
  grade: z.string().min(1),
  tenureBand: z.string().min(1),
  employmentType: z.string().min(1),
  employeeCategory: z.string().min(1),
});

export const hrTalentEngSurveyTemplateSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  templateRef: z.string().min(1),
  title: z.string().min(1),
  surveyType: z.enum(HR_TALENT_ENG_SURVEY_TYPES),
  status: z.enum(HR_TALENT_ENG_TEMPLATE_STATUSES),
  categories: z.array(z.enum(HR_TALENT_ENG_CATEGORIES)).min(1),
  questionBankSize: z.number().int().nonnegative(),
  ownerUserId: z.string().min(1),
  updatedAt: isoDateTime,
});

export const hrTalentEngSurveyQuestionSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  templateId: z.string().min(1),
  questionRef: z.string().min(1),
  label: z.string().min(1),
  questionType: z.enum(HR_TALENT_ENG_QUESTION_TYPES),
  category: z.enum(HR_TALENT_ENG_CATEGORIES),
  required: z.boolean(),
  allowComment: z.boolean(),
  scaleMin: z.number().int().optional(),
  scaleMax: z.number().int().optional(),
  options: z.array(z.string().min(1)).default([]),
  scoringWeight: z.number().positive(),
});

export const hrTalentEngSurveySchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyRef: z.string().min(1),
  title: z.string().min(1),
  surveyType: z.enum(HR_TALENT_ENG_SURVEY_TYPES),
  templateId: z.string().min(1),
  status: z.enum(HR_TALENT_ENG_SURVEY_STATUSES),
  anonymityMode: z.enum(HR_TALENT_ENG_ANONYMITY_MODES),
  minResponseThreshold: z.number().int().min(3),
  audienceSummary: z.string().min(1),
  openAt: isoDateTime,
  closeAt: isoDateTime,
  responseDeadlineAt: isoDateTime,
  reminderSchedule: z.array(isoDateTime).default([]),
  allowDraftResponses: z.boolean(),
  enableOpenText: z.boolean(),
  enableEngagementIndex: z.boolean(),
  enableEnps: z.boolean(),
  benchmarkLabel: z.string().min(1).optional(),
  period: z.string().min(1),
  invitedCount: z.number().int().nonnegative(),
  responseCount: z.number().int().nonnegative(),
  responseRate: percent,
  engagementIndex: percent.optional(),
  enps: z.number().min(-100).max(100).optional(),
  previousEngagementIndex: percent.optional(),
  createdByUserId: z.string().min(1),
  publishedByUserId: z.string().min(1).optional(),
  analyticsGeneratedAt: optionalIsoDateTime,
});

export const hrTalentEngAudienceSegmentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  dimension: z.enum(HR_TALENT_ENG_AUDIENCE_DIMENSIONS),
  value: z.string().min(1),
  eligibleCount: z.number().int().nonnegative(),
  invitedCount: z.number().int().nonnegative(),
  responseCount: z.number().int().nonnegative(),
  minThreshold: z.number().int().min(3),
});

export const hrTalentEngInvitationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  status: z.enum(HR_TALENT_ENG_INVITATION_STATUSES),
  sentAt: optionalIsoDateTime,
  reminderAt: optionalIsoDateTime,
  responseDeadlineAt: isoDateTime,
  submittedAt: optionalIsoDateTime,
});

export const hrTalentEngSurveyResponseSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  invitationId: z.string().min(1),
  employeeId: z.string().min(1),
  status: z.enum(HR_TALENT_ENG_RESPONSE_STATUSES),
  anonymous: z.boolean(),
  scoreAverage: score.optional(),
  enpsScore: z.number().int().min(0).max(10).optional(),
  commentCount: z.number().int().nonnegative(),
  draftSavedAt: optionalIsoDateTime,
  submittedAt: optionalIsoDateTime,
});

export const hrTalentEngQuestionScoreSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  questionId: z.string().min(1),
  questionLabel: z.string().min(1),
  category: z.enum(HR_TALENT_ENG_CATEGORIES),
  averageScore: score,
  responseCount: z.number().int().nonnegative(),
  previousScore: score.optional(),
  trend: z.number(),
});

export const hrTalentEngCategoryScoreSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  category: z.enum(HR_TALENT_ENG_CATEGORIES),
  averageScore: score,
  responseCount: z.number().int().nonnegative(),
  benchmarkScore: score.optional(),
  previousScore: score.optional(),
  lowScoring: z.boolean(),
  trend: z.number(),
});

export const hrTalentEngSegmentScoreSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  dimension: z.enum(HR_TALENT_ENG_AUDIENCE_DIMENSIONS),
  value: z.string().min(1),
  averageScore: score,
  responseCount: z.number().int().nonnegative(),
  minThreshold: z.number().int().min(3),
  highRisk: z.boolean(),
});

export const hrTalentEngOpenTextCommentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  category: z.enum(HR_TALENT_ENG_CATEGORIES),
  tag: z.enum(HR_TALENT_ENG_COMMENT_TAGS),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  excerpt: z.string().min(1),
  responseCount: z.number().int().nonnegative(),
  minThreshold: z.number().int().min(3),
  reviewedByUserId: z.string().min(1).optional(),
  taggedAt: optionalIsoDateTime,
});

export const hrTalentEngBenchmarkSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  benchmarkType: z.enum(["internal", "external"]),
  label: z.string().min(1),
  period: z.string().min(1),
  engagementIndex: percent,
  enps: z.number().min(-100).max(100),
  averageScore: score,
});

export const hrTalentEngSurveyCycleSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  cycleRef: z.string().min(1),
  period: z.string().min(1),
  status: z.enum(HR_TALENT_ENG_SURVEY_STATUSES),
  engagementIndex: percent,
  enps: z.number().min(-100).max(100),
  responseRate: percent,
  closedAt: optionalIsoDateTime,
  trendFromPrevious: z.number(),
});

export const hrTalentEngImprovementActionSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1),
  actionRef: z.string().min(1),
  title: z.string().min(1),
  sourceCategory: z.enum(HR_TALENT_ENG_CATEGORIES),
  sourceSegment: z.string().min(1).optional(),
  ownerUserId: z.string().min(1),
  ownerName: z.string().min(1),
  dueAt: isoDateTime,
  priority: z.enum(HR_TALENT_ENG_PRIORITIES),
  status: z.enum(HR_TALENT_ENG_IMPROVEMENT_STATUSES),
  progressPercent: percent,
  createdAt: isoDateTime,
  completedAt: optionalIsoDateTime,
});

export const hrTalentEngNotificationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  surveyId: z.string().min(1).optional(),
  actionId: z.string().min(1).optional(),
  recipientUserId: z.string().min(1),
  event: z.enum(["survey_invitation", "survey_reminder", "action_overdue"]),
  channel: z.enum(["portal", "email"]),
  status: z.enum(["queued", "sent", "read"]),
  message: z.string().min(1),
  sentAt: optionalIsoDateTime,
});

export const hrTalentEngListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrTalentEngAudienceMemberInput = z.infer<
  typeof hrTalentEngAudienceMemberSchema
>;
export type HrTalentEngSurveyTemplateInput = z.infer<
  typeof hrTalentEngSurveyTemplateSchema
>;
export type HrTalentEngSurveyQuestionInput = z.infer<
  typeof hrTalentEngSurveyQuestionSchema
>;
export type HrTalentEngSurveyInput = z.infer<typeof hrTalentEngSurveySchema>;
export type HrTalentEngAudienceSegmentInput = z.infer<
  typeof hrTalentEngAudienceSegmentSchema
>;
export type HrTalentEngInvitationInput = z.infer<
  typeof hrTalentEngInvitationSchema
>;
export type HrTalentEngSurveyResponseInput = z.infer<
  typeof hrTalentEngSurveyResponseSchema
>;
export type HrTalentEngQuestionScoreInput = z.infer<
  typeof hrTalentEngQuestionScoreSchema
>;
export type HrTalentEngCategoryScoreInput = z.infer<
  typeof hrTalentEngCategoryScoreSchema
>;
export type HrTalentEngSegmentScoreInput = z.infer<
  typeof hrTalentEngSegmentScoreSchema
>;
export type HrTalentEngOpenTextCommentInput = z.infer<
  typeof hrTalentEngOpenTextCommentSchema
>;
export type HrTalentEngBenchmarkInput = z.infer<
  typeof hrTalentEngBenchmarkSchema
>;
export type HrTalentEngSurveyCycleInput = z.infer<
  typeof hrTalentEngSurveyCycleSchema
>;
export type HrTalentEngImprovementActionInput = z.infer<
  typeof hrTalentEngImprovementActionSchema
>;
export type HrTalentEngNotificationInput = z.infer<
  typeof hrTalentEngNotificationSchema
>;
export type HrTalentEngListRowInput = z.infer<
  typeof hrTalentEngListRowSchema
>;
