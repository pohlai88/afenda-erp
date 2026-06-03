import { z } from "zod";

import {
  HR_RON_ASSESSMENT_STATUSES,
  HR_RON_CANDIDATE_SOURCES,
  HR_RON_CANDIDATE_STATUSES,
  HR_RON_CHECK_TYPES,
  HR_RON_COMMUNICATION_EVENTS,
  HR_RON_HIRING_RECOMMENDATIONS,
  HR_RON_INTERVIEW_TYPES,
  HR_RON_ONBOARDING_OWNER_ROLES,
  HR_RON_ONBOARDING_TASK_STATUSES,
  HR_RON_PIPELINE_STAGES,
  HR_RON_POSTING_CHANNELS,
  HR_RON_POSTING_STATUSES,
  HR_RON_READINESS_DOMAINS,
  HR_RON_REPORT_GROUP_BY,
  HR_RON_REQUISITION_STATUSES,
  HR_RON_REQUISITION_TYPES,
  HR_RON_OFFER_STATUSES,
} from "./hr.talent.ron-constants.shared";

const nonEmptyString = z.string().trim().min(1);
const optionalStringValues = z.array(nonEmptyString).default([]);

export const hrRonRequisitionSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  title: nonEmptyString,
  requisitionType: z.enum(HR_RON_REQUISITION_TYPES),
  legalEntityCode: nonEmptyString,
  departmentId: nonEmptyString,
  departmentName: nonEmptyString,
  positionId: nonEmptyString,
  locationId: nonEmptyString,
  locationName: nonEmptyString,
  grade: nonEmptyString,
  hiringManagerEmployeeId: nonEmptyString,
  hiringManagerDisplayName: nonEmptyString,
  recruiterUserId: nonEmptyString,
  budgetReference: nonEmptyString,
  employmentType: nonEmptyString,
  headcount: z.number().int().min(1),
  approvalRequired: z.boolean().default(true),
  status: z.enum(HR_RON_REQUISITION_STATUSES).default("draft"),
  createdAt: z.iso.datetime(),
  approvedAt: z.iso.datetime().nullable().default(null),
});

export const hrRonJobPostingSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  requisitionId: nonEmptyString,
  channel: z.enum(HR_RON_POSTING_CHANNELS),
  title: nonEmptyString,
  description: nonEmptyString,
  requirements: nonEmptyString,
  status: z.enum(HR_RON_POSTING_STATUSES).default("draft"),
  integrationTarget: nonEmptyString.nullable().default(null),
  publishedAt: z.iso.datetime().nullable().default(null),
});

export const hrRonCandidateProfileSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  displayName: nonEmptyString,
  email: z.email(),
  phone: nonEmptyString,
  source: z.enum(HR_RON_CANDIDATE_SOURCES),
  skills: optionalStringValues,
  education: optionalStringValues,
  workHistory: optionalStringValues,
  certifications: optionalStringValues,
  resumeDocumentId: nonEmptyString.nullable().default(null),
});

export const hrRonApplicationSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  candidateId: nonEmptyString,
  requisitionId: nonEmptyString,
  postingId: nonEmptyString.nullable().default(null),
  source: z.enum(HR_RON_CANDIDATE_SOURCES),
  stage: z.enum(HR_RON_PIPELINE_STAGES).default("applied"),
  status: z.enum(HR_RON_CANDIDATE_STATUSES).default("applied"),
  submittedAt: z.iso.datetime(),
  recruiterUserId: nonEmptyString,
  hiringManagerEmployeeId: nonEmptyString,
});

export const hrRonScreeningQuestionSchema = z.object({
  id: nonEmptyString,
  requisitionId: nonEmptyString,
  prompt: nonEmptyString,
  knockout: z.boolean().default(false),
  expectedAnswer: nonEmptyString.optional(),
});

export const hrRonInterviewScheduleSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  applicationId: nonEmptyString,
  candidateId: nonEmptyString,
  interviewerUserIds: z.array(nonEmptyString).min(1),
  hiringManagerEmployeeId: nonEmptyString,
  scheduledAt: z.iso.datetime(),
  interviewType: z.enum(HR_RON_INTERVIEW_TYPES),
  confirmationSentAt: z.iso.datetime().nullable().default(null),
});

export const hrRonInterviewScorecardSchema = z.object({
  id: nonEmptyString,
  interviewId: nonEmptyString,
  interviewerUserId: nonEmptyString,
  rating: z.number().min(1).max(5),
  comments: nonEmptyString,
  recommendation: z.enum(HR_RON_HIRING_RECOMMENDATIONS),
  submittedAt: z.iso.datetime(),
});

export const hrRonAssessmentSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  applicationId: nonEmptyString,
  assessmentName: nonEmptyString,
  assignedAt: z.iso.datetime(),
  resultRecordedAt: z.iso.datetime().nullable().default(null),
  score: z.number().min(0).max(100).nullable().default(null),
  status: z.enum(HR_RON_ASSESSMENT_STATUSES).default("assigned"),
});

export const hrRonCommunicationSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  applicationId: nonEmptyString,
  candidateId: nonEmptyString,
  event: z.enum(HR_RON_COMMUNICATION_EVENTS),
  recipientEmail: z.email(),
  sentAt: z.iso.datetime(),
});

export const hrRonOfferSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  applicationId: nonEmptyString,
  candidateId: nonEmptyString,
  proposedRole: nonEmptyString,
  salaryAmount: z.number().min(0),
  salaryCurrency: nonEmptyString,
  startDate: z.iso.date(),
  employmentType: nonEmptyString,
  managerEmployeeId: nonEmptyString,
  locationId: nonEmptyString,
  conditions: optionalStringValues,
  approvalRequired: z.boolean().default(true),
  status: z.enum(HR_RON_OFFER_STATUSES).default("draft"),
  offerLetterDocumentId: nonEmptyString.nullable().default(null),
  approvedAt: z.iso.datetime().nullable().default(null),
  sentAt: z.iso.datetime().nullable().default(null),
  acceptedAt: z.iso.datetime().nullable().default(null),
});

export const hrRonPreEmploymentCheckSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  candidateId: nonEmptyString,
  offerId: nonEmptyString,
  checkType: z.enum(HR_RON_CHECK_TYPES),
  status: z.enum(["pending", "clear", "flagged", "waived"]),
  reference: nonEmptyString,
  recordedAt: z.iso.datetime(),
});

export const hrRonOnboardingTaskSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  onboardingCaseId: nonEmptyString,
  employeeReferenceId: nonEmptyString,
  title: nonEmptyString,
  ownerRole: z.enum(HR_RON_ONBOARDING_OWNER_ROLES),
  status: z.enum(HR_RON_ONBOARDING_TASK_STATUSES).default("pending"),
  mandatory: z.boolean().default(true),
  blocking: z.boolean().default(false),
  dueDate: z.iso.date(),
  completedAt: z.iso.datetime().nullable().default(null),
  documentReference: nonEmptyString.nullable().default(null),
  policyAcknowledgmentCode: nonEmptyString.nullable().default(null),
});

export const hrRonReadinessSnapshotSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  employeeReferenceId: nonEmptyString,
  domain: z.enum(HR_RON_READINESS_DOMAINS),
  status: z.enum(["missing", "completed", "blocked", "overdue"]),
  missingItems: optionalStringValues,
  updatedAt: z.iso.datetime(),
});

export const hrRonReportFilterSchema = z.object({
  groupBy: z.enum(HR_RON_REPORT_GROUP_BY).default("stage"),
  periodStart: z.iso.date().optional(),
  periodEnd: z.iso.date().optional(),
});

export type HrRonRequisitionInput = z.infer<typeof hrRonRequisitionSchema>;
export type HrRonJobPostingInput = z.infer<typeof hrRonJobPostingSchema>;
export type HrRonCandidateProfileInput = z.infer<
  typeof hrRonCandidateProfileSchema
>;
export type HrRonApplicationInput = z.infer<typeof hrRonApplicationSchema>;
export type HrRonScreeningQuestionInput = z.infer<
  typeof hrRonScreeningQuestionSchema
>;
export type HrRonInterviewScheduleInput = z.infer<
  typeof hrRonInterviewScheduleSchema
>;
export type HrRonInterviewScorecardInput = z.infer<
  typeof hrRonInterviewScorecardSchema
>;
export type HrRonAssessmentInput = z.infer<typeof hrRonAssessmentSchema>;
export type HrRonCommunicationInput = z.infer<typeof hrRonCommunicationSchema>;
export type HrRonOfferInput = z.infer<typeof hrRonOfferSchema>;
export type HrRonPreEmploymentCheckInput = z.infer<
  typeof hrRonPreEmploymentCheckSchema
>;
export type HrRonOnboardingTaskInput = z.infer<
  typeof hrRonOnboardingTaskSchema
>;
export type HrRonReadinessSnapshotInput = z.infer<
  typeof hrRonReadinessSnapshotSchema
>;
export type HrRonReportFilterInput = z.infer<typeof hrRonReportFilterSchema>;
