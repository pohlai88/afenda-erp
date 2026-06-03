import { z } from "zod";

import {
  HR_TALENT_RSS_ACCOUNT_STATUSES,
  HR_TALENT_RSS_APPLICATION_STATUSES,
  HR_TALENT_RSS_APPROVAL_STATUSES,
  HR_TALENT_RSS_APPROVAL_TYPES,
  HR_TALENT_RSS_ASSESSMENT_STATUSES,
  HR_TALENT_RSS_CONSENT_STATUSES,
  HR_TALENT_RSS_INTERVIEW_STATUSES,
  HR_TALENT_RSS_NOTIFICATION_EVENTS,
  HR_TALENT_RSS_NOTIFICATION_STATUSES,
  HR_TALENT_RSS_OFFER_STATUSES,
  HR_TALENT_RSS_PORTAL_ROLES,
  HR_TALENT_RSS_POSTING_STATUSES,
  HR_TALENT_RSS_POSTING_VISIBILITIES,
  HR_TALENT_RSS_PRIVACY_TIERS,
  HR_TALENT_RSS_PROFILE_STATUSES,
  HR_TALENT_RSS_RETENTION_STATUSES,
  HR_TALENT_RSS_SCORECARD_STATUSES,
  HR_TALENT_RSS_TASK_STATUSES,
  HR_TALENT_RSS_TASK_TYPES,
} from "./hr.talent.rss-constants.shared";

const isoDateTime = z.string().datetime();
const optionalIsoDateTime = isoDateTime.optional();

export const hrTalentRssCandidateProfileSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  candidateRef: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().email(),
  phoneMasked: z.string().min(1),
  role: z.enum(HR_TALENT_RSS_PORTAL_ROLES),
  accountStatus: z.enum(HR_TALENT_RSS_ACCOUNT_STATUSES),
  profileStatus: z.enum(HR_TALENT_RSS_PROFILE_STATUSES),
  privacyTier: z.enum(HR_TALENT_RSS_PRIVACY_TIERS),
  consentStatus: z.enum(HR_TALENT_RSS_CONSENT_STATUSES),
  retentionStatus: z.enum(HR_TALENT_RSS_RETENTION_STATUSES),
  profileUpdatedAt: isoDateTime,
  lastPortalAccessAt: optionalIsoDateTime,
  permittedUpdateUntil: optionalIsoDateTime,
});

export const hrTalentRssJobPostingSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  postingRef: z.string().min(1),
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  visibility: z.enum(HR_TALENT_RSS_POSTING_VISIBILITIES),
  status: z.enum(HR_TALENT_RSS_POSTING_STATUSES),
  requisitionRef: z.string().min(1),
  applicationsCount: z.number().int().nonnegative(),
  closingAt: optionalIsoDateTime,
});

export const hrTalentRssApplicationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  applicationRef: z.string().min(1),
  candidateId: z.string().min(1),
  candidateDisplayName: z.string().min(1),
  postingId: z.string().min(1),
  postingTitle: z.string().min(1),
  internalApplication: z.boolean(),
  source: z.enum(["career_site", "internal_portal", "referral", "recruiter"]),
  status: z.enum(HR_TALENT_RSS_APPLICATION_STATUSES),
  currentStage: z.string().min(1),
  submittedAt: isoDateTime,
  withdrawnAt: optionalIsoDateTime,
  ownerUserId: z.string().min(1),
  hiringManagerUserId: z.string().min(1),
  interviewerUserIds: z.array(z.string().min(1)),
});

export const hrTalentRssDocumentSubmissionSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  candidateId: z.string().min(1),
  applicationId: z.string().min(1).optional(),
  documentType: z.enum([
    "resume",
    "cover_letter",
    "certificate",
    "portfolio",
    "identity_reference",
    "work_eligibility",
    "medical_declaration",
    "reference_detail",
  ]),
  title: z.string().min(1),
  status: z.enum(["submitted", "verified", "rejected", "expired"]),
  privacyTier: z.enum(HR_TALENT_RSS_PRIVACY_TIERS),
  submittedAt: isoDateTime,
  verifiedAt: optionalIsoDateTime,
});

export const hrTalentRssInterviewSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  applicationId: z.string().min(1),
  candidateId: z.string().min(1),
  candidateDisplayName: z.string().min(1),
  interviewType: z.enum(["phone", "video", "onsite", "panel", "technical"]),
  scheduledAt: isoDateTime,
  status: z.enum(HR_TALENT_RSS_INTERVIEW_STATUSES),
  rescheduleEnabled: z.boolean(),
  instructions: z.string().min(1),
  interviewerUserIds: z.array(z.string().min(1)),
});

export const hrTalentRssAssessmentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  applicationId: z.string().min(1),
  candidateId: z.string().min(1),
  assessmentName: z.string().min(1),
  accessRef: z.string().min(1),
  status: z.enum(HR_TALENT_RSS_ASSESSMENT_STATUSES),
  assignedAt: isoDateTime,
  submittedAt: optionalIsoDateTime,
  expiresAt: optionalIsoDateTime,
});

export const hrTalentRssOfferSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  applicationId: z.string().min(1),
  candidateId: z.string().min(1),
  offerRef: z.string().min(1),
  status: z.enum(HR_TALENT_RSS_OFFER_STATUSES),
  documentAcknowledged: z.boolean(),
  candidateRespondedAt: optionalIsoDateTime,
  approverUserId: z.string().min(1),
});

export const hrTalentRssPreEmploymentFormSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  applicationId: z.string().min(1),
  candidateId: z.string().min(1),
  formType: z.enum([
    "candidate_information",
    "right_to_work",
    "reference_details",
    "medical_declaration",
  ]),
  status: z.enum(["pending", "submitted", "reviewed", "waived"]),
  submittedAt: optionalIsoDateTime,
  reviewedAt: optionalIsoDateTime,
});

export const hrTalentRssScorecardSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  interviewId: z.string().min(1),
  applicationId: z.string().min(1),
  reviewerUserId: z.string().min(1),
  reviewerRole: z.enum(["hiring_manager", "interviewer"]),
  status: z.enum(HR_TALENT_RSS_SCORECARD_STATUSES),
  rating: z.number().min(0).max(5).optional(),
  recommendation: z.enum(["strong_hire", "hire", "hold", "reject"]).optional(),
  comments: z.string().optional(),
  submittedAt: optionalIsoDateTime,
});

export const hrTalentRssRequisitionRequestSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  requestRef: z.string().min(1),
  hiringManagerUserId: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(HR_TALENT_RSS_APPROVAL_STATUSES),
  submittedAt: isoDateTime,
  decidedAt: optionalIsoDateTime,
});

export const hrTalentRssCandidateReviewSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  applicationId: z.string().min(1),
  candidateId: z.string().min(1),
  reviewerUserId: z.string().min(1),
  reviewerRole: z.enum(["hiring_manager", "recruiter"]),
  decision: z.enum(["shortlist", "reject", "comment", "hold"]),
  comment: z.string().min(1),
  reviewedAt: isoDateTime,
});

export const hrTalentRssApprovalSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  approvalType: z.enum(HR_TALENT_RSS_APPROVAL_TYPES),
  targetId: z.string().min(1),
  approverUserId: z.string().min(1),
  status: z.enum(HR_TALENT_RSS_APPROVAL_STATUSES),
  decisionComment: z.string().optional(),
  requestedAt: isoDateTime,
  decidedAt: optionalIsoDateTime,
});

export const hrTalentRssTaskSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  taskType: z.enum(HR_TALENT_RSS_TASK_TYPES),
  ownerRole: z.enum(HR_TALENT_RSS_PORTAL_ROLES),
  ownerUserId: z.string().min(1).optional(),
  candidateId: z.string().min(1).optional(),
  applicationId: z.string().min(1).optional(),
  title: z.string().min(1),
  status: z.enum(HR_TALENT_RSS_TASK_STATUSES),
  dueAt: optionalIsoDateTime,
});

export const hrTalentRssNotificationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  event: z.enum(HR_TALENT_RSS_NOTIFICATION_EVENTS),
  recipientRole: z.enum(HR_TALENT_RSS_PORTAL_ROLES),
  recipientRef: z.string().min(1),
  channel: z.enum(["email", "portal", "sms"]),
  status: z.enum(HR_TALENT_RSS_NOTIFICATION_STATUSES),
  sentAt: optionalIsoDateTime,
});

export const hrTalentRssPrivacyRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  candidateId: z.string().min(1),
  privacyTier: z.enum(HR_TALENT_RSS_PRIVACY_TIERS),
  consentStatus: z.enum(HR_TALENT_RSS_CONSENT_STATUSES),
  consentCapturedAt: optionalIsoDateTime,
  retentionStatus: z.enum(HR_TALENT_RSS_RETENTION_STATUSES),
  retentionPolicyRef: z.string().min(1),
  accountClosureRequestedAt: optionalIsoDateTime,
});

export const hrTalentRssAccessLogSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  actorUserId: z.string().min(1),
  actorRole: z.enum(HR_TALENT_RSS_PORTAL_ROLES),
  targetType: z.enum([
    "candidate_profile",
    "application",
    "document",
    "interview",
    "scorecard",
    "offer",
    "approval",
  ]),
  targetId: z.string().min(1),
  privacyTier: z.enum(HR_TALENT_RSS_PRIVACY_TIERS),
  accessReason: z.string().min(1),
  accessedAt: isoDateTime,
});

export const hrTalentRssRetentionActionSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  candidateId: z.string().min(1),
  action: z.enum([
    "closure_requested",
    "retention_reviewed",
    "data_closed",
    "legal_hold_applied",
  ]),
  policyRef: z.string().min(1),
  status: z.enum(HR_TALENT_RSS_RETENTION_STATUSES),
  performedByUserId: z.string().min(1),
  performedAt: isoDateTime,
});

export const hrTalentRssListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrTalentRssCandidateProfileInput = z.infer<
  typeof hrTalentRssCandidateProfileSchema
>;
export type HrTalentRssJobPostingInput = z.infer<
  typeof hrTalentRssJobPostingSchema
>;
export type HrTalentRssApplicationInput = z.infer<
  typeof hrTalentRssApplicationSchema
>;
export type HrTalentRssDocumentSubmissionInput = z.infer<
  typeof hrTalentRssDocumentSubmissionSchema
>;
export type HrTalentRssInterviewInput = z.infer<
  typeof hrTalentRssInterviewSchema
>;
export type HrTalentRssAssessmentInput = z.infer<
  typeof hrTalentRssAssessmentSchema
>;
export type HrTalentRssOfferInput = z.infer<typeof hrTalentRssOfferSchema>;
export type HrTalentRssPreEmploymentFormInput = z.infer<
  typeof hrTalentRssPreEmploymentFormSchema
>;
export type HrTalentRssScorecardInput = z.infer<
  typeof hrTalentRssScorecardSchema
>;
export type HrTalentRssRequisitionRequestInput = z.infer<
  typeof hrTalentRssRequisitionRequestSchema
>;
export type HrTalentRssApprovalInput = z.infer<
  typeof hrTalentRssApprovalSchema
>;
export type HrTalentRssCandidateReviewInput = z.infer<
  typeof hrTalentRssCandidateReviewSchema
>;
export type HrTalentRssTaskInput = z.infer<typeof hrTalentRssTaskSchema>;
export type HrTalentRssNotificationInput = z.infer<
  typeof hrTalentRssNotificationSchema
>;
export type HrTalentRssPrivacyRecordInput = z.infer<
  typeof hrTalentRssPrivacyRecordSchema
>;
export type HrTalentRssAccessLogInput = z.infer<
  typeof hrTalentRssAccessLogSchema
>;
export type HrTalentRssRetentionActionInput = z.infer<
  typeof hrTalentRssRetentionActionSchema
>;
export type HrTalentRssListRowInput = z.infer<
  typeof hrTalentRssListRowSchema
>;
