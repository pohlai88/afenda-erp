import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEngagementSurvey,
  hrmEngagementSurveyQuestion,
} from "@afenda/platform/db/schema"

import { buildEngagementAudienceSnapshotForSurvey } from "./engagement-audience.server"
import { resolveEngagementSurveyCycleId } from "./engagement-cycle.queries.server"
import type { EngagementAudienceFilter } from "../schemas/engagement-audience.shared"
import { validateMinSegmentResponsesForMode } from "../schemas/engagement-anonymity.shared"
import type { EngagementReminderSchedule } from "../schemas/engagement-reminder.shared"
import type { HrmEngagementAnonymityMode } from "../schemas/engagement-workflow.shared"

export type SaveEngagementSurveyConfigurationInput = {
  organizationId: string
  actorUserId: string
  surveyId: string
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number | null
  audienceFilter: EngagementAudienceFilter
  openAt: Date | null
  closeAt: Date | null
  reminderSchedule: EngagementReminderSchedule
  allowDraftResponses: boolean
  cycleId: string | null
  cycleKey: string | null
  cycleLabel: string | null
}

export type ScheduleEngagementSurveyInput = {
  organizationId: string
  actorUserId: string
  surveyId: string
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number | null
  audienceFilter: EngagementAudienceFilter
  openAt: Date
  closeAt: Date
  reminderSchedule: EngagementReminderSchedule
  allowDraftResponses: boolean
  cycleId: string | null
  cycleKey: string | null
  cycleLabel: string | null
}

type MutationFailure = { ok: true; message: string } | { surveyId: string }

async function resolveCycleIdForConfig(
  input: Pick<
    SaveEngagementSurveyConfigurationInput,
    "organizationId" | "cycleId" | "cycleKey" | "cycleLabel"
  >
): Promise<string | null> {
  return resolveEngagementSurveyCycleId({
    organizationId: input.organizationId,
    cycleId: input.cycleId,
    cycleKey: input.cycleKey,
    cycleLabel: input.cycleLabel,
  })
}

async function assertSurveyConfigurable(input: {
  organizationId: string
  surveyId: string
}): Promise<
  | { ok: false; message: string }
  | { ok: true; state: string; questionCount: number }
> {
  const [survey] = await db
    .select({
      state: hrmEngagementSurvey.state,
    })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) {
    return { ok: false, message: "Survey not found." }
  }
  if (survey.state !== "draft" && survey.state !== "scheduled") {
    return {
      ok: false,
      message: "Only draft or scheduled surveys can be configured.",
    }
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, input.surveyId)
      )
    )

  return {
    ok: true,
    state: survey.state,
    questionCount: countRow?.count ?? 0,
  }
}

function validateScheduleWindow(openAt: Date, closeAt: Date): string | null {
  if (closeAt.getTime() <= openAt.getTime()) {
    return "Close date must be after open date."
  }
  return null
}

export async function saveEngagementSurveyConfigurationMutation(
  input: SaveEngagementSurveyConfigurationInput
): Promise<MutationFailure> {
  const gate = await assertSurveyConfigurable({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
  })
  if (!gate.ok) return { ok: true, message: gate.message }

  const minCheck = validateMinSegmentResponsesForMode({
    anonymityMode: input.anonymityMode,
    minSegmentResponses: input.minSegmentResponses,
  })
  if (!minCheck.ok) return { ok: true, message: minCheck.message }

  if (
    input.openAt &&
    input.closeAt &&
    validateScheduleWindow(input.openAt, input.closeAt)
  ) {
    return {
      ok: true,
      message: validateScheduleWindow(input.openAt, input.closeAt)!,
    }
  }

  const snapshot = await buildEngagementAudienceSnapshotForSurvey({
    organizationId: input.organizationId,
    filter: input.audienceFilter,
    anonymityMode: input.anonymityMode,
    minSegmentResponses: minCheck.value,
  })

  const cycleId = await resolveCycleIdForConfig(input)

  await db
    .update(hrmEngagementSurvey)
    .set({
      anonymityMode: input.anonymityMode,
      minSegmentResponses: minCheck.value,
      audienceSnapshot: snapshot,
      openAt: input.openAt,
      closeAt: input.closeAt,
      reminderSchedule: input.reminderSchedule,
      allowDraftResponses: input.allowDraftResponses,
      cycleId,
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )

  return { surveyId: input.surveyId }
}

export async function scheduleEngagementSurveyMutation(
  input: ScheduleEngagementSurveyInput
): Promise<MutationFailure> {
  const gate = await assertSurveyConfigurable({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
  })
  if (!gate.ok) return { ok: true, message: gate.message }

  if (gate.state !== "draft") {
    return {
      ok: true,
      message:
        "Only draft surveys can be scheduled. Re-save configuration instead.",
    }
  }

  if (gate.questionCount < 1) {
    return {
      ok: true,
      message: "Add at least one question before scheduling.",
    }
  }

  const windowError = validateScheduleWindow(input.openAt, input.closeAt)
  if (windowError) return { ok: true, message: windowError }

  const minCheck = validateMinSegmentResponsesForMode({
    anonymityMode: input.anonymityMode,
    minSegmentResponses: input.minSegmentResponses,
  })
  if (!minCheck.ok) return { ok: true, message: minCheck.message }

  const snapshot = await buildEngagementAudienceSnapshotForSurvey({
    organizationId: input.organizationId,
    filter: input.audienceFilter,
    anonymityMode: input.anonymityMode,
    minSegmentResponses: minCheck.value,
  })

  if (snapshot.resolvedCount < 1) {
    return {
      ok: true,
      message: "Audience must include at least one active employee.",
    }
  }

  if (input.anonymityMode === "anonymous" && minCheck.value != null) {
    const visibleSegments = snapshot.segmentPreview.filter((s) => !s.suppressed)
    if (visibleSegments.length === 0 && snapshot.resolvedCount > 0) {
      return {
        ok: true,
        message:
          "Anonymous mode: at least one department segment must meet the minimum response threshold.",
      }
    }
  }

  const cycleId = await resolveCycleIdForConfig(input)

  await db
    .update(hrmEngagementSurvey)
    .set({
      state: "scheduled",
      anonymityMode: input.anonymityMode,
      minSegmentResponses: minCheck.value,
      audienceSnapshot: snapshot,
      openAt: input.openAt,
      closeAt: input.closeAt,
      reminderSchedule: input.reminderSchedule,
      allowDraftResponses: input.allowDraftResponses,
      cycleId,
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId),
        eq(hrmEngagementSurvey.state, "draft")
      )
    )

  return { surveyId: input.surveyId }
}

export async function revertEngagementSurveyToDraftMutation(input: {
  organizationId: string
  actorUserId: string
  surveyId: string
}): Promise<MutationFailure> {
  const [survey] = await db
    .select({ state: hrmEngagementSurvey.state })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) return { ok: true, message: "Survey not found." }
  if (survey.state !== "scheduled") {
    return { ok: true, message: "Only scheduled surveys can return to draft." }
  }

  await db
    .update(hrmEngagementSurvey)
    .set({
      state: "draft",
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )

  return { surveyId: input.surveyId }
}
