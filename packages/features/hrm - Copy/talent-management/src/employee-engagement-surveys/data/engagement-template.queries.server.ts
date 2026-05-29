import "server-only"

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEngagementSurvey,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyTemplate,
} from "@afenda/platform/db/schema"

import type {
  HrmEngagementSurveyState,
  HrmEngagementSurveyType,
  HrmEngagementTemplateState,
} from "../schemas/engagement-workflow.shared"
import type {
  EngagementDraftSurveyListRow,
  EngagementTemplateListRow,
  EngagementTemplateOption,
  EngagementTemplateQuestionListRow,
} from "../schemas/engagement-query.shared"
import type {
  HrmEngagementCategory,
  HrmEngagementQuestionType,
} from "../schemas/engagement-workflow.shared"

export type {
  EngagementDraftSurveyListRow,
  EngagementTemplateListRow,
  EngagementTemplateOption,
  EngagementTemplateQuestionListRow,
}

export async function listEngagementTemplatesForOrganization(
  organizationId: string
): Promise<EngagementTemplateListRow[]> {
  const templates = await db
    .select({
      id: hrmEngagementSurveyTemplate.id,
      code: hrmEngagementSurveyTemplate.code,
      name: hrmEngagementSurveyTemplate.name,
      state: hrmEngagementSurveyTemplate.state,
      updatedAt: hrmEngagementSurveyTemplate.updatedAt,
    })
    .from(hrmEngagementSurveyTemplate)
    .where(eq(hrmEngagementSurveyTemplate.organizationId, organizationId))
    .orderBy(desc(hrmEngagementSurveyTemplate.updatedAt))

  if (templates.length === 0) return []

  const templateIds = templates.map((t) => t.id)
  const counts = await db
    .select({
      templateId: hrmEngagementSurveyQuestion.templateId,
      count: sql<number>`count(*)::int`,
    })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, organizationId),
        inArray(hrmEngagementSurveyQuestion.templateId, templateIds)
      )
    )
    .groupBy(hrmEngagementSurveyQuestion.templateId)

  const countByTemplate = new Map(
    counts.map((c) => [c.templateId, c.count] as const)
  )

  return templates.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    state: row.state as HrmEngagementTemplateState,
    questionCount: countByTemplate.get(row.id) ?? 0,
    updatedAt: row.updatedAt,
  }))
}

export async function listEngagementDraftSurveysForOrganization(
  organizationId: string
): Promise<EngagementDraftSurveyListRow[]> {
  const surveys = await db
    .select({
      id: hrmEngagementSurvey.id,
      title: hrmEngagementSurvey.title,
      surveyType: hrmEngagementSurvey.surveyType,
      state: hrmEngagementSurvey.state,
      templateId: hrmEngagementSurvey.templateId,
      updatedAt: hrmEngagementSurvey.updatedAt,
    })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, organizationId),
        eq(hrmEngagementSurvey.state, "draft")
      )
    )
    .orderBy(desc(hrmEngagementSurvey.updatedAt))

  if (surveys.length === 0) return []

  const surveyIds = surveys.map((s) => s.id)
  const questionCounts = await db
    .select({
      surveyId: hrmEngagementSurveyQuestion.surveyId,
      count: sql<number>`count(*)::int`,
    })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, organizationId),
        inArray(hrmEngagementSurveyQuestion.surveyId, surveyIds)
      )
    )
    .groupBy(hrmEngagementSurveyQuestion.surveyId)

  const countBySurvey = new Map(
    questionCounts.map((c) => [c.surveyId, c.count] as const)
  )

  const templateIds = [
    ...new Set(
      surveys.map((s) => s.templateId).filter((id): id is string => id != null)
    ),
  ]

  const templateCodeById = new Map<string, string>()
  if (templateIds.length > 0) {
    const templateRows = await db
      .select({
        id: hrmEngagementSurveyTemplate.id,
        code: hrmEngagementSurveyTemplate.code,
      })
      .from(hrmEngagementSurveyTemplate)
      .where(
        and(
          eq(hrmEngagementSurveyTemplate.organizationId, organizationId),
          inArray(hrmEngagementSurveyTemplate.id, templateIds)
        )
      )
    for (const t of templateRows) {
      templateCodeById.set(t.id, t.code)
    }
  }

  return surveys.map((row) => ({
    id: row.id,
    title: row.title,
    surveyType: row.surveyType as HrmEngagementSurveyType,
    state: row.state as HrmEngagementSurveyState,
    templateCode: row.templateId
      ? (templateCodeById.get(row.templateId) ?? null)
      : null,
    questionCount: countBySurvey.get(row.id) ?? 0,
    updatedAt: row.updatedAt,
  }))
}

export async function listEngagementTemplateOptionsForOrganization(
  organizationId: string
): Promise<EngagementTemplateOption[]> {
  const rows = await db
    .select({
      id: hrmEngagementSurveyTemplate.id,
      code: hrmEngagementSurveyTemplate.code,
      name: hrmEngagementSurveyTemplate.name,
    })
    .from(hrmEngagementSurveyTemplate)
    .where(
      and(
        eq(hrmEngagementSurveyTemplate.organizationId, organizationId),
        inArray(hrmEngagementSurveyTemplate.state, ["draft", "active"])
      )
    )
    .orderBy(asc(hrmEngagementSurveyTemplate.code))

  return rows
}

export async function listEngagementTemplateQuestionsForOrganization(
  organizationId: string
): Promise<EngagementTemplateQuestionListRow[]> {
  const rows = await db
    .select({
      id: hrmEngagementSurveyQuestion.id,
      templateId: hrmEngagementSurveyQuestion.templateId,
      templateCode: hrmEngagementSurveyTemplate.code,
      templateName: hrmEngagementSurveyTemplate.name,
      sortOrder: hrmEngagementSurveyQuestion.sortOrder,
      questionType: hrmEngagementSurveyQuestion.questionType,
      category: hrmEngagementSurveyQuestion.category,
      prompt: hrmEngagementSurveyQuestion.prompt,
    })
    .from(hrmEngagementSurveyQuestion)
    .innerJoin(
      hrmEngagementSurveyTemplate,
      eq(hrmEngagementSurveyQuestion.templateId, hrmEngagementSurveyTemplate.id)
    )
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, organizationId),
        eq(hrmEngagementSurveyTemplate.organizationId, organizationId)
      )
    )
    .orderBy(
      asc(hrmEngagementSurveyTemplate.code),
      asc(hrmEngagementSurveyQuestion.sortOrder),
      asc(hrmEngagementSurveyQuestion.createdAt)
    )

  return rows.map((row) => ({
    id: row.id,
    templateId: row.templateId!,
    templateCode: row.templateCode,
    templateName: row.templateName,
    sortOrder: row.sortOrder,
    questionType: row.questionType as HrmEngagementQuestionType,
    category: row.category as HrmEngagementCategory,
    prompt: row.prompt,
  }))
}

export async function listEngagementTemplateQuestions(
  organizationId: string,
  templateId: string
) {
  return db
    .select({
      id: hrmEngagementSurveyQuestion.id,
      sortOrder: hrmEngagementSurveyQuestion.sortOrder,
      questionType: hrmEngagementSurveyQuestion.questionType,
      category: hrmEngagementSurveyQuestion.category,
      prompt: hrmEngagementSurveyQuestion.prompt,
      config: hrmEngagementSurveyQuestion.config,
    })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, organizationId),
        eq(hrmEngagementSurveyQuestion.templateId, templateId)
      )
    )
    .orderBy(
      asc(hrmEngagementSurveyQuestion.sortOrder),
      asc(hrmEngagementSurveyQuestion.createdAt)
    )
}
