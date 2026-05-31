import {
  assignHrmDevelopmentCoach,
  assignHrmDevelopmentMentor,
  createHrmCareerDiscussion,
  createHrmDevelopmentLearningAction,
  createHrmDevelopmentSession,
  createHrmDevelopmentStretchAssignment,
  recommendHrmLearningActionsFromGaps,
  updateHrmCareerDiscussion,
  updateHrmDevelopmentGoalStatus,
  updateHrmDevelopmentLearningAction,
  updateHrmDevelopmentPlanStatus,
} from "@afenda/db";

import { hrTalentCareerPathAuditActions } from "../events/hr.talent.career-pathing.event";
import type {
  HrCareerPathCoachAssignInput,
  HrCareerPathDiscussionCreateInput,
  HrCareerPathDiscussionUpdateInput,
  HrCareerPathEmployeeProgressUpdateInput,
  HrCareerPathLearningActionCreateInput,
  HrCareerPathLearningActionLinkInput,
  HrCareerPathManagerReviewInput,
  HrCareerPathMentorAssignInput,
  HrCareerPathRecommendLearningActionsInput,
  HrCareerPathSessionLogInput,
  HrCareerPathStretchAssignmentCreateInput,
} from "../schemas/hr.talent.career-pathing-development-actions.schema";
import { emitHrCareerPathingAuditEvent } from "./hr.talent.career-pathing-audit.server";
import {
  loadHrmDevelopmentCoachAssignmentForPlan,
  loadHrmDevelopmentMentorAssignmentForPlan,
} from "./hr.talent.career-pathing-queries.server";

/** HRM-CAR-013 — recommend and persist learning actions from skill/competency gaps. */
export async function recommendHrCareerPathLearningActions(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathRecommendLearningActionsInput;
}) {
  const result = await recommendHrmLearningActionsFromGaps({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    employeeId: input.payload.employeeId,
    targetRoleId: input.payload.targetRoleId,
    dueDate: input.payload.dueDate ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    employeeId: input.payload.employeeId,
    action: hrTalentCareerPathAuditActions.learning.recommend,
    summary: `Recommended ${result.learningActionIds.length} learning actions from gaps`,
    metadata: {
      learningActionIds: result.learningActionIds,
      skillGapCount: result.gapSummary.skillGaps.filter((row) => row.gap).length,
      competencyGapCount: result.gapSummary.competencyGaps.filter((row) => row.gap)
        .length,
    },
  });

  return result;
}

/** HRM-CAR-014 — create learning action linked to course or external training. */
export async function createHrCareerPathLearningAction(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathLearningActionCreateInput;
}) {
  const result = await createHrmDevelopmentLearningAction({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    goalId: input.payload.goalId ?? null,
    title: input.payload.title,
    description: input.payload.description ?? null,
    trainingCourseId: input.payload.trainingCourseId ?? null,
    externalTrainingRef: input.payload.externalTrainingRef ?? null,
    dueDate: input.payload.dueDate ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    action: hrTalentCareerPathAuditActions.learning.create,
    summary: "Created development learning action",
    metadata: { learningActionId: result.learningActionId },
  });

  return result;
}

/** HRM-CAR-014 — link existing learning action to goal/course/external ref. */
export async function linkHrCareerPathLearningAction(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathLearningActionLinkInput;
}) {
  const result = await updateHrmDevelopmentLearningAction({
    organizationId: input.organizationId,
    learningActionId: input.payload.learningActionId,
    goalId: input.payload.goalId ?? null,
    trainingCourseId: input.payload.trainingCourseId ?? null,
    externalTrainingRef: input.payload.externalTrainingRef ?? null,
    learningActionStatus: input.payload.learningActionStatus,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTalentCareerPathAuditActions.learning.link,
    summary: "Linked development learning action",
    metadata: { learningActionId: result.learningActionId },
  });

  return result;
}

/** HRM-CAR-015 — assign mentor to development plan. */
export async function assignHrCareerPathMentor(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathMentorAssignInput;
}) {
  const result = await assignHrmDevelopmentMentor({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    mentorEmployeeId: input.payload.mentorEmployeeId,
    assignedByUserId: input.actorAuthUserId,
    notes: input.payload.notes ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    action: hrTalentCareerPathAuditActions.mentor.assign,
    summary: "Assigned development mentor",
    metadata: { mentorAssignmentId: result.mentorAssignmentId },
  });

  return result;
}

/** HRM-CAR-016 — assign coach to development plan. */
export async function assignHrCareerPathCoach(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathCoachAssignInput;
}) {
  const result = await assignHrmDevelopmentCoach({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    coachEmployeeId: input.payload.coachEmployeeId,
    coachingObjective: input.payload.coachingObjective ?? null,
    assignedByUserId: input.actorAuthUserId,
    notes: input.payload.notes ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    action: hrTalentCareerPathAuditActions.coach.assign,
    summary: "Assigned development coach",
    metadata: { coachAssignmentId: result.coachAssignmentId },
  });

  return result;
}

/** HRM-CAR-017 — log mentor or coach session with notes, actions, outcome. */
export async function logHrCareerPathDevelopmentSession(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathSessionLogInput;
}) {
  const [mentorAssignment, coachAssignment] = await Promise.all([
    loadHrmDevelopmentMentorAssignmentForPlan({
      organizationId: input.organizationId,
      planId: input.payload.planId,
    }),
    loadHrmDevelopmentCoachAssignmentForPlan({
      organizationId: input.organizationId,
      planId: input.payload.planId,
    }),
  ]);

  const result = await createHrmDevelopmentSession({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    sessionKind: input.payload.sessionKind,
    sessionDate: input.payload.sessionDate,
    durationMinutes: input.payload.durationMinutes ?? null,
    notes: input.payload.notes ?? null,
    actions: input.payload.actions ?? null,
    outcome: input.payload.outcome ?? null,
    loggedByUserId: input.actorAuthUserId,
    mentorAssignmentId:
      input.payload.sessionKind === "mentor" ? mentorAssignment?.id ?? null : null,
    coachAssignmentId:
      input.payload.sessionKind === "coach" ? coachAssignment?.id ?? null : null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    action: hrTalentCareerPathAuditActions.session.log,
    summary: `Logged ${input.payload.sessionKind} development session`,
    metadata: { sessionId: result.sessionId },
  });

  return result;
}

/** HRM-CAR-018 — create stretch assignment on plan. */
export async function createHrCareerPathStretchAssignment(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathStretchAssignmentCreateInput;
}) {
  const result = await createHrmDevelopmentStretchAssignment({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    assignmentKind: input.payload.assignmentKind,
    title: input.payload.title,
    description: input.payload.description ?? null,
    departmentId: input.payload.departmentId ?? null,
    positionId: input.payload.positionId ?? null,
    startDate: input.payload.startDate ?? null,
    endDate: input.payload.endDate ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    action: hrTalentCareerPathAuditActions.stretch.assign,
    summary: "Created stretch assignment",
    metadata: {
      stretchAssignmentId: result.stretchAssignmentId,
      assignmentKind: input.payload.assignmentKind,
    },
  });

  return result;
}

/** HRM-CAR-019 — employee updates development goal progress. */
export async function updateHrCareerPathEmployeeProgress(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathEmployeeProgressUpdateInput;
}) {
  await updateHrmDevelopmentGoalStatus({
    organizationId: input.organizationId,
    goalId: input.payload.goalId,
    goalStatus: input.payload.goalStatus,
    progressPercent: input.payload.progressPercent,
    evidenceNotes: input.payload.evidenceNotes ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTalentCareerPathAuditActions.goal.progressUpdate,
    summary: "Employee updated development progress",
    metadata: {
      goalId: input.payload.goalId,
      goalStatus: input.payload.goalStatus,
      progressPercent: input.payload.progressPercent,
    },
  });

  return { goalId: input.payload.goalId };
}

/** HRM-CAR-020 — manager review and comment on development plan progress. */
export async function submitHrCareerPathManagerReview(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathManagerReviewInput;
}) {
  await updateHrmDevelopmentPlanStatus({
    organizationId: input.organizationId,
    planId: input.payload.planId,
    planStatus: "active",
    managerReviewNotes: input.payload.managerReviewNotes,
    managerReviewedByUserId: input.actorAuthUserId,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    planId: input.payload.planId,
    action: hrTalentCareerPathAuditActions.plan.managerReview,
    summary: "Manager reviewed development progress",
  });

  return { planId: input.payload.planId };
}

/** HRM-CAR-021/022 — schedule career development discussion record. */
export async function createHrCareerPathDiscussion(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathDiscussionCreateInput;
}) {
  const result = await createHrmCareerDiscussion({
    organizationId: input.organizationId,
    employeeId: input.payload.employeeId,
    planId: input.payload.planId ?? null,
    discussionDate: input.payload.discussionDate,
    participants: input.payload.participants,
    notes: input.payload.notes ?? null,
    agreedActions: input.payload.agreedActions,
    nextReviewDate: input.payload.nextReviewDate ?? null,
    recordedByUserId: input.actorAuthUserId,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    employeeId: input.payload.employeeId,
    planId: input.payload.planId ?? undefined,
    action: hrTalentCareerPathAuditActions.discussion.create,
    summary: "Recorded career development discussion",
    metadata: { discussionId: result.discussionId },
  });

  return result;
}

/** HRM-CAR-022 — update career discussion participants, notes, actions, next review. */
export async function updateHrCareerPathDiscussion(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrCareerPathDiscussionUpdateInput;
}) {
  const result = await updateHrmCareerDiscussion({
    organizationId: input.organizationId,
    discussionId: input.payload.discussionId,
    discussionDate: input.payload.discussionDate,
    participants: input.payload.participants,
    notes: input.payload.notes ?? null,
    agreedActions: input.payload.agreedActions,
    nextReviewDate: input.payload.nextReviewDate ?? null,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTalentCareerPathAuditActions.discussion.update,
    summary: "Updated career development discussion",
    metadata: { discussionId: result.discussionId },
  });

  return result;
}
