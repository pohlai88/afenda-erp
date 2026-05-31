import { z } from "zod";

import {
  HR_DEVELOPMENT_LEARNING_ACTION_STATUSES,
  HR_DEVELOPMENT_SESSION_KINDS,
  HR_DEVELOPMENT_STRETCH_ASSIGNMENT_KINDS,
} from "./hr.talent.career-pathing-constants.shared";

export const hrCareerPathRecommendLearningActionsSchema = z.object({
  planId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  targetRoleId: z.string().trim().min(1).optional(),
  dueDate: z.coerce.date().optional(),
});

export const hrCareerPathLearningActionCreateSchema = z.object({
  planId: z.string().trim().min(1),
  goalId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional(),
  trainingCourseId: z.string().trim().max(64).optional(),
  externalTrainingRef: z.string().trim().max(160).optional(),
  dueDate: z.coerce.date().optional(),
});

export const hrCareerPathLearningActionLinkSchema = z.object({
  learningActionId: z.string().trim().min(1),
  goalId: z.string().trim().min(1).optional(),
  trainingCourseId: z.string().trim().max(64).optional(),
  externalTrainingRef: z.string().trim().max(160).optional(),
  learningActionStatus: z.enum(HR_DEVELOPMENT_LEARNING_ACTION_STATUSES).optional(),
});

export const hrCareerPathMentorAssignSchema = z.object({
  planId: z.string().trim().min(1),
  mentorEmployeeId: z.string().trim().min(1),
  notes: z.string().trim().max(2000).optional(),
});

export const hrCareerPathCoachAssignSchema = z.object({
  planId: z.string().trim().min(1),
  coachEmployeeId: z.string().trim().min(1),
  coachingObjective: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const hrCareerPathSessionLogSchema = z.object({
  planId: z.string().trim().min(1),
  sessionKind: z.enum(HR_DEVELOPMENT_SESSION_KINDS),
  sessionDate: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(1).max(480).optional(),
  notes: z.string().trim().max(4000).optional(),
  actions: z.string().trim().max(4000).optional(),
  outcome: z.string().trim().max(4000).optional(),
});

export const hrCareerPathStretchAssignmentCreateSchema = z.object({
  planId: z.string().trim().min(1),
  assignmentKind: z.enum(HR_DEVELOPMENT_STRETCH_ASSIGNMENT_KINDS),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional(),
  departmentId: z.string().trim().min(1).optional(),
  positionId: z.string().trim().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const hrCareerPathEmployeeProgressUpdateSchema = z.object({
  goalId: z.string().trim().min(1),
  goalStatus: z.enum([
    "not_started",
    "in_progress",
    "completed",
    "overdue",
    "blocked",
    "cancelled",
    "deferred",
  ]),
  progressPercent: z.coerce.number().int().min(0).max(100).optional(),
  evidenceNotes: z.string().trim().max(4000).optional(),
});

export const hrCareerPathManagerReviewSchema = z.object({
  planId: z.string().trim().min(1),
  managerReviewNotes: z.string().trim().max(4000),
});

const careerDiscussionParticipantSchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  role: z.string().trim().max(64).optional(),
  displayName: z.string().trim().max(160).optional(),
});

const careerAgreedActionSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  ownerEmployeeId: z.string().trim().min(1).optional(),
  dueDate: z.string().trim().max(32).optional(),
  completed: z.coerce.boolean().optional(),
});

export const hrCareerPathDiscussionCreateSchema = z.object({
  employeeId: z.string().trim().min(1),
  planId: z.string().trim().min(1).optional(),
  discussionDate: z.coerce.date(),
  participants: z.array(careerDiscussionParticipantSchema).default([]),
  notes: z.string().trim().max(8000).optional(),
  agreedActions: z.array(careerAgreedActionSchema).default([]),
  nextReviewDate: z.coerce.date().optional(),
});

export const hrCareerPathDiscussionUpdateSchema = hrCareerPathDiscussionCreateSchema
  .extend({
    discussionId: z.string().trim().min(1),
  })
  .omit({ employeeId: true });

export type HrCareerPathRecommendLearningActionsInput = z.infer<
  typeof hrCareerPathRecommendLearningActionsSchema
>;
export type HrCareerPathLearningActionCreateInput = z.infer<
  typeof hrCareerPathLearningActionCreateSchema
>;
export type HrCareerPathLearningActionLinkInput = z.infer<
  typeof hrCareerPathLearningActionLinkSchema
>;
export type HrCareerPathMentorAssignInput = z.infer<typeof hrCareerPathMentorAssignSchema>;
export type HrCareerPathCoachAssignInput = z.infer<typeof hrCareerPathCoachAssignSchema>;
export type HrCareerPathSessionLogInput = z.infer<typeof hrCareerPathSessionLogSchema>;
export type HrCareerPathStretchAssignmentCreateInput = z.infer<
  typeof hrCareerPathStretchAssignmentCreateSchema
>;
export type HrCareerPathEmployeeProgressUpdateInput = z.infer<
  typeof hrCareerPathEmployeeProgressUpdateSchema
>;
export type HrCareerPathManagerReviewInput = z.infer<typeof hrCareerPathManagerReviewSchema>;
export type HrCareerPathDiscussionCreateInput = z.infer<
  typeof hrCareerPathDiscussionCreateSchema
>;
export type HrCareerPathDiscussionUpdateInput = z.infer<
  typeof hrCareerPathDiscussionUpdateSchema
>;
