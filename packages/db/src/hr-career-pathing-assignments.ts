import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  listSkillGapsForEmployee,
  type HrCareerSkillGapCompareResult,
} from "./hr-career-pathing-foundation";
import { recommendHrmLearningActionsFromGaps } from "./hr-career-pathing-learning-recommendations.shared";
import {
  assertEmployeeInOrg,
  assertPlanInOrg,
  HrCareerPathingCommandError,
} from "./hr-career-pathing.shared";
import {
  hrmCareerDiscussions,
  hrmDevelopmentCoachAssignments,
  hrmDevelopmentLearningActions,
  hrmDevelopmentMentorAssignments,
  hrmDevelopmentSessions,
  hrmDevelopmentStretchAssignments,
  type HrmCareerAgreedAction,
  type HrmCareerDiscussionParticipant,
} from "./hr-career-pathing";

export async function createHrmDevelopmentLearningActionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    title: string;
    goalId?: string | null;
    description?: string | null;
    trainingCourseId?: string | null;
    externalTrainingRef?: string | null;
    dueDate?: Date | null;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);

  const id = createEntityId("car_lrn");
  await db.insert(hrmDevelopmentLearningActions).values({
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    goalId: input.goalId ?? null,
    title: input.title,
    description: input.description ?? null,
    trainingCourseId: input.trainingCourseId ?? null,
    externalTrainingRef: input.externalTrainingRef ?? null,
    dueDate: input.dueDate ?? null,
    learningActionStatus: "planned",
  });
  return { learningActionId: id };
}

export async function createHrmDevelopmentStretchAssignmentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    assignmentKind: (typeof hrmDevelopmentStretchAssignments.$inferInsert)["assignmentKind"];
    title: string;
    description?: string | null;
    departmentId?: string | null;
    positionId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);

  const id = createEntityId("car_str");
  await db.insert(hrmDevelopmentStretchAssignments).values({
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    assignmentKind: input.assignmentKind,
    title: input.title,
    description: input.description ?? null,
    departmentId: input.departmentId ?? null,
    positionId: input.positionId ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    assignmentStatus: "planned",
  });
  return { stretchAssignmentId: id };
}

export async function assignHrmDevelopmentMentorInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    mentorEmployeeId: string;
    assignedByUserId?: string | null;
    notes?: string | null;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);
  await assertEmployeeInOrg(db, input.organizationId, input.mentorEmployeeId);

  const [existing] = await db
    .select({ id: hrmDevelopmentMentorAssignments.id })
    .from(hrmDevelopmentMentorAssignments)
    .where(
      and(
        eq(hrmDevelopmentMentorAssignments.organizationId, input.organizationId),
        eq(hrmDevelopmentMentorAssignments.planId, input.planId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrmDevelopmentMentorAssignments)
      .set({
        mentorEmployeeId: input.mentorEmployeeId,
        assignmentStatus: "active",
        assignedByUserId: input.assignedByUserId ?? null,
        notes: input.notes ?? null,
        assignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hrmDevelopmentMentorAssignments.id, existing.id));
    return { mentorAssignmentId: existing.id };
  }

  const id = createEntityId("car_mnt");
  await db.insert(hrmDevelopmentMentorAssignments).values({
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    mentorEmployeeId: input.mentorEmployeeId,
    assignedByUserId: input.assignedByUserId ?? null,
    notes: input.notes ?? null,
    assignmentStatus: "active",
  });
  return { mentorAssignmentId: id };
}

export async function assignHrmDevelopmentCoachInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    coachEmployeeId: string;
    coachingObjective?: string | null;
    assignedByUserId?: string | null;
    notes?: string | null;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);
  await assertEmployeeInOrg(db, input.organizationId, input.coachEmployeeId);

  const [existing] = await db
    .select({ id: hrmDevelopmentCoachAssignments.id })
    .from(hrmDevelopmentCoachAssignments)
    .where(
      and(
        eq(hrmDevelopmentCoachAssignments.organizationId, input.organizationId),
        eq(hrmDevelopmentCoachAssignments.planId, input.planId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrmDevelopmentCoachAssignments)
      .set({
        coachEmployeeId: input.coachEmployeeId,
        coachingObjective: input.coachingObjective ?? null,
        assignmentStatus: "active",
        assignedByUserId: input.assignedByUserId ?? null,
        notes: input.notes ?? null,
        assignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hrmDevelopmentCoachAssignments.id, existing.id));
    return { coachAssignmentId: existing.id };
  }

  const id = createEntityId("car_cch");
  await db.insert(hrmDevelopmentCoachAssignments).values({
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    coachEmployeeId: input.coachEmployeeId,
    coachingObjective: input.coachingObjective ?? null,
    assignedByUserId: input.assignedByUserId ?? null,
    notes: input.notes ?? null,
    assignmentStatus: "active",
  });
  return { coachAssignmentId: id };
}

export async function createHrmDevelopmentSessionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    sessionKind: (typeof hrmDevelopmentSessions.$inferInsert)["sessionKind"];
    sessionDate: Date;
    mentorAssignmentId?: string | null;
    coachAssignmentId?: string | null;
    durationMinutes?: number | null;
    notes?: string | null;
    actions?: string | null;
    outcome?: string | null;
    loggedByUserId?: string | null;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);

  const id = createEntityId("car_ses");
  await db.insert(hrmDevelopmentSessions).values({
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    sessionKind: input.sessionKind,
    sessionDate: input.sessionDate,
    mentorAssignmentId: input.mentorAssignmentId ?? null,
    coachAssignmentId: input.coachAssignmentId ?? null,
    durationMinutes: input.durationMinutes ?? null,
    notes: input.notes ?? null,
    actions: input.actions ?? null,
    outcome: input.outcome ?? null,
    loggedByUserId: input.loggedByUserId ?? null,
  });
  return { sessionId: id };
}

export async function createHrmCareerDiscussionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    discussionDate: Date;
    planId?: string | null;
    participants?: readonly HrmCareerDiscussionParticipant[];
    notes?: string | null;
    agreedActions?: readonly HrmCareerAgreedAction[];
    nextReviewDate?: Date | null;
    recordedByUserId?: string | null;
  },
) {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const id = createEntityId("car_dis");
  await db.insert(hrmCareerDiscussions).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    planId: input.planId ?? null,
    discussionDate: input.discussionDate,
    participants: input.participants ?? [],
    notes: input.notes ?? null,
    agreedActions: input.agreedActions ?? [],
    nextReviewDate: input.nextReviewDate ?? null,
    recordedByUserId: input.recordedByUserId ?? null,
  });
  return { discussionId: id };
}

export async function updateHrmDevelopmentLearningActionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    learningActionId: string;
    title?: string;
    goalId?: string | null;
    trainingCourseId?: string | null;
    externalTrainingRef?: string | null;
    learningActionStatus?: (typeof hrmDevelopmentLearningActions.$inferInsert)["learningActionStatus"];
    dueDate?: Date | null;
  },
) {
  const [existing] = await db
    .select({ id: hrmDevelopmentLearningActions.id })
    .from(hrmDevelopmentLearningActions)
    .where(
      and(
        eq(hrmDevelopmentLearningActions.organizationId, input.organizationId),
        eq(hrmDevelopmentLearningActions.id, input.learningActionId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HrCareerPathingCommandError(
      "learning_action_not_found",
      "Development learning action not found.",
    );
  }

  await db
    .update(hrmDevelopmentLearningActions)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.goalId !== undefined ? { goalId: input.goalId } : {}),
      ...(input.trainingCourseId !== undefined
        ? { trainingCourseId: input.trainingCourseId }
        : {}),
      ...(input.externalTrainingRef !== undefined
        ? { externalTrainingRef: input.externalTrainingRef }
        : {}),
      ...(input.learningActionStatus !== undefined
        ? { learningActionStatus: input.learningActionStatus }
        : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      updatedAt: new Date(),
    })
    .where(eq(hrmDevelopmentLearningActions.id, input.learningActionId));

  return { learningActionId: input.learningActionId };
}

/** HRM-CAR-013 — persist recommended learning actions from employee gap analysis. */
export async function recommendHrmLearningActionsFromGapsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    employeeId: string;
    targetRoleId?: string;
    dueDate?: Date | null;
  },
): Promise<{ learningActionIds: readonly string[]; gapSummary: HrCareerSkillGapCompareResult }> {
  await assertPlanInOrg(db, input.organizationId, input.planId);

  const gapSummary = await listSkillGapsForEmployee(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId,
  });

  const drafts = recommendHrmLearningActionsFromGaps(gapSummary);
  const learningActionIds: string[] = [];

  for (const draft of drafts) {
    const created = await createHrmDevelopmentLearningActionInTx(db, {
      organizationId: input.organizationId,
      planId: input.planId,
      title: draft.title,
      description: draft.description,
      externalTrainingRef: draft.externalTrainingRef ?? null,
      dueDate: input.dueDate ?? null,
    });
    learningActionIds.push(created.learningActionId);
  }

  return { learningActionIds, gapSummary };
}

export async function updateHrmCareerDiscussionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    discussionId: string;
    discussionDate?: Date;
    participants?: readonly HrmCareerDiscussionParticipant[];
    notes?: string | null;
    agreedActions?: readonly HrmCareerAgreedAction[];
    nextReviewDate?: Date | null;
  },
) {
  const [existing] = await db
    .select({ id: hrmCareerDiscussions.id })
    .from(hrmCareerDiscussions)
    .where(
      and(
        eq(hrmCareerDiscussions.organizationId, input.organizationId),
        eq(hrmCareerDiscussions.id, input.discussionId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HrCareerPathingCommandError(
      "discussion_not_found",
      "Career discussion not found.",
    );
  }

  await db
    .update(hrmCareerDiscussions)
    .set({
      ...(input.discussionDate !== undefined ? { discussionDate: input.discussionDate } : {}),
      ...(input.participants !== undefined ? { participants: input.participants } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.agreedActions !== undefined ? { agreedActions: input.agreedActions } : {}),
      ...(input.nextReviewDate !== undefined ? { nextReviewDate: input.nextReviewDate } : {}),
      updatedAt: new Date(),
    })
    .where(eq(hrmCareerDiscussions.id, input.discussionId));

  return { discussionId: input.discussionId };
}
