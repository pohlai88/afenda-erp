import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementImprovementAction,
  hrmEngagementSurveyQuestion,
} from "@afenda/platform/db/schema"

import {
  canTransitionEngagementImprovementStatus,
  parseEngagementImprovementDueDate,
  type HrmEngagementImprovementActionState,
} from "../schemas/engagement-improvement.shared"
import { assertEngagementSurveyAllowsImprovementActions } from "./engagement-improvement.queries.server"

type MutationFailure = { ok: true; message: string } | { actionId: string }

async function loadImprovementActionForMutation(input: {
  organizationId: string
  actionId: string
  surveyId: string
}) {
  const [row] = await db
    .select({
      id: hrmEngagementImprovementAction.id,
      status: hrmEngagementImprovementAction.status,
      surveyId: hrmEngagementImprovementAction.surveyId,
    })
    .from(hrmEngagementImprovementAction)
    .where(
      and(
        eq(hrmEngagementImprovementAction.organizationId, input.organizationId),
        eq(hrmEngagementImprovementAction.id, input.actionId),
        eq(hrmEngagementImprovementAction.surveyId, input.surveyId)
      )
    )
    .limit(1)

  return row ?? null
}

async function assertOwnerInOrganization(input: {
  organizationId: string
  ownerEmployeeId: string | undefined
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!input.ownerEmployeeId) return { ok: true }

  const [employee] = await db
    .select({ id: hrmEmployee.id })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.id, input.ownerEmployeeId),
        eq(hrmEmployee.employmentStatus, "active")
      )
    )
    .limit(1)

  if (!employee) {
    return {
      ok: false,
      message: "Owner must be an active employee in this organization.",
    }
  }
  return { ok: true }
}

async function assertQuestionBelongsToSurvey(input: {
  organizationId: string
  surveyId: string
  questionId: string | undefined
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!input.questionId) return { ok: true }

  const [question] = await db
    .select({ id: hrmEngagementSurveyQuestion.id })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, input.surveyId),
        eq(hrmEngagementSurveyQuestion.id, input.questionId)
      )
    )
    .limit(1)

  if (!question) {
    return { ok: false, message: "Question must belong to this survey." }
  }
  return { ok: true }
}

export async function createEngagementImprovementActionMutation(input: {
  organizationId: string
  actorUserId: string
  surveyId: string
  title: string
  ownerEmployeeId?: string
  dueDate?: string
  priority?: string
  category?: string
  questionId?: string
}): Promise<MutationFailure> {
  const surveyGate = await assertEngagementSurveyAllowsImprovementActions({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
  })
  if (!surveyGate.ok) return { ok: true, message: surveyGate.message }

  const ownerGate = await assertOwnerInOrganization({
    organizationId: input.organizationId,
    ownerEmployeeId: input.ownerEmployeeId,
  })
  if (!ownerGate.ok) return { ok: true, message: ownerGate.message }

  const questionGate = await assertQuestionBelongsToSurvey({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
    questionId: input.questionId,
  })
  if (!questionGate.ok) return { ok: true, message: questionGate.message }

  const dueDate: string | null = parseEngagementImprovementDueDate(
    input.dueDate
  )

  const [inserted] = await db
    .insert(hrmEngagementImprovementAction)
    .values({
      organizationId: input.organizationId,
      surveyId: input.surveyId,
      title: input.title,
      ownerEmployeeId: input.ownerEmployeeId ?? null,
      dueDate,
      priority: input.priority ?? null,
      category: input.category ?? null,
      questionId: input.questionId ?? null,
      status: "open",
      createdByUserId: input.actorUserId,
      updatedByUserId: input.actorUserId,
    })
    .returning({ id: hrmEngagementImprovementAction.id })

  if (!inserted) {
    return { ok: true, message: "Could not create improvement action." }
  }

  return { actionId: inserted.id }
}

export async function updateEngagementImprovementActionMutation(input: {
  organizationId: string
  actorUserId: string
  actionId: string
  surveyId: string
  nextStatus?: HrmEngagementImprovementActionState
  ownerEmployeeId?: string
  dueDate?: string
  priority?: string
}): Promise<MutationFailure> {
  const existing = await loadImprovementActionForMutation(input)
  if (!existing) return { ok: true, message: "Improvement action not found." }

  const currentStatus = existing.status as HrmEngagementImprovementActionState
  if (
    input.nextStatus &&
    !canTransitionEngagementImprovementStatus(currentStatus, input.nextStatus)
  ) {
    return {
      ok: true,
      message: `Cannot change status from ${currentStatus} to ${input.nextStatus}.`,
    }
  }

  const ownerGate = await assertOwnerInOrganization({
    organizationId: input.organizationId,
    ownerEmployeeId: input.ownerEmployeeId,
  })
  if (!ownerGate.ok) return { ok: true, message: ownerGate.message }

  const dueDate: string | null | undefined =
    input.dueDate === undefined
      ? undefined
      : parseEngagementImprovementDueDate(input.dueDate)

  await db
    .update(hrmEngagementImprovementAction)
    .set({
      ...(input.nextStatus ? { status: input.nextStatus } : {}),
      ...(input.ownerEmployeeId !== undefined
        ? { ownerEmployeeId: input.ownerEmployeeId || null }
        : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
      ...(input.priority !== undefined
        ? { priority: input.priority || null }
        : {}),
      updatedByUserId: input.actorUserId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmEngagementImprovementAction.organizationId, input.organizationId),
        eq(hrmEngagementImprovementAction.id, input.actionId)
      )
    )

  return { actionId: input.actionId }
}

export async function completeEngagementImprovementActionMutation(input: {
  organizationId: string
  actorUserId: string
  actionId: string
  surveyId: string
}): Promise<MutationFailure> {
  return updateEngagementImprovementActionMutation({
    ...input,
    nextStatus: "completed",
  })
}
