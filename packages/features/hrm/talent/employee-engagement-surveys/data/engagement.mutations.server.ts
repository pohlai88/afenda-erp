import "server-only"

import { and, eq, max } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEngagementSurvey,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyTemplate,
} from "@afenda/platform/db/schema"

import type { z } from "zod"

import { listEngagementTemplateQuestions } from "./engagement-template.queries.server"
import type {
  addEngagementTemplateQuestionFormSchema,
  archiveEngagementTemplateFormSchema,
  cloneEngagementTemplateFormSchema,
  createEngagementSurveyDraftFormSchema,
  createEngagementTemplateFormSchema,
  deleteEngagementSurveyDraftFormSchema,
  updateEngagementSurveyDraftFormSchema,
  updateEngagementTemplateFormSchema,
} from "../schemas/engagement-action.schema"
import {
  engagementQuestionConfigSchema,
  type EngagementQuestionConfig,
} from "../schemas/engagement-question-config.shared"

function buildQuestionConfigForMutation(
  questionType: AddQuestionInput["questionType"],
  choicesRaw?: string
): EngagementQuestionConfig | null {
  if (questionType !== "single_choice" && questionType !== "multi_choice") {
    return null
  }
  const lines = (choicesRaw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  const parsed = engagementQuestionConfigSchema.safeParse({ choices: lines })
  return parsed.success ? parsed.data : null
}

type CreateTemplateInput = z.infer<typeof createEngagementTemplateFormSchema>
type CloneTemplateInput = z.infer<typeof cloneEngagementTemplateFormSchema>
type AddQuestionInput = z.infer<typeof addEngagementTemplateQuestionFormSchema>
type CreateSurveyDraftInput = z.infer<
  typeof createEngagementSurveyDraftFormSchema
>
type UpdateTemplateInput = z.infer<typeof updateEngagementTemplateFormSchema>
type ArchiveTemplateInput = z.infer<typeof archiveEngagementTemplateFormSchema>
type UpdateSurveyDraftInput = z.infer<
  typeof updateEngagementSurveyDraftFormSchema
>
type DeleteSurveyDraftInput = z.infer<
  typeof deleteEngagementSurveyDraftFormSchema
>

async function nextTemplateQuestionSortOrder(
  organizationId: string,
  templateId: string
): Promise<number> {
  const [row] = await db
    .select({ maxOrder: max(hrmEngagementSurveyQuestion.sortOrder) })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, organizationId),
        eq(hrmEngagementSurveyQuestion.templateId, templateId)
      )
    )
  return (row?.maxOrder ?? -1) + 1
}

async function copyTemplateQuestionsToSurvey(input: {
  organizationId: string
  templateId: string
  surveyId: string
}) {
  const sourceQuestions = await listEngagementTemplateQuestions(
    input.organizationId,
    input.templateId
  )
  if (sourceQuestions.length === 0) return

  await db.insert(hrmEngagementSurveyQuestion).values(
    sourceQuestions.map((q) => ({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      surveyId: input.surveyId,
      templateId: null,
      sortOrder: q.sortOrder,
      questionType: q.questionType,
      category: q.category,
      prompt: q.prompt,
      config: q.config,
    }))
  )
}

export async function createEngagementTemplateMutation(input: {
  organizationId: string
  actorUserId: string
  data: CreateTemplateInput
}): Promise<{ id: string } | { ok: false; code: "duplicate_code" }> {
  const existing = await db.query.hrmEngagementSurveyTemplate.findFirst({
    where: and(
      eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
      eq(hrmEngagementSurveyTemplate.code, input.data.code)
    ),
    columns: { id: true },
  })
  if (existing) return { ok: false, code: "duplicate_code" }

  const id = crypto.randomUUID()
  await db.insert(hrmEngagementSurveyTemplate).values({
    id,
    organizationId: input.organizationId,
    code: input.data.code,
    name: input.data.name,
    description: input.data.description,
    state: "draft",
    createdByUserId: input.actorUserId,
    updatedByUserId: input.actorUserId,
  })

  return { id }
}

export async function cloneEngagementTemplateMutation(input: {
  organizationId: string
  actorUserId: string
  data: CloneTemplateInput
}): Promise<
  { id: string } | { ok: false; code: "duplicate_code" | "source_missing" }
> {
  const source = await db.query.hrmEngagementSurveyTemplate.findFirst({
    where: and(
      eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
      eq(hrmEngagementSurveyTemplate.id, input.data.sourceTemplateId)
    ),
    columns: { id: true, description: true },
  })
  if (!source) return { ok: false, code: "source_missing" }

  const duplicate = await db.query.hrmEngagementSurveyTemplate.findFirst({
    where: and(
      eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
      eq(hrmEngagementSurveyTemplate.code, input.data.code)
    ),
    columns: { id: true },
  })
  if (duplicate) return { ok: false, code: "duplicate_code" }

  const newId = crypto.randomUUID()
  await db.insert(hrmEngagementSurveyTemplate).values({
    id: newId,
    organizationId: input.organizationId,
    code: input.data.code,
    name: input.data.name,
    description: source.description,
    state: "draft",
    createdByUserId: input.actorUserId,
    updatedByUserId: input.actorUserId,
  })

  const sourceQuestions = await listEngagementTemplateQuestions(
    input.organizationId,
    source.id
  )
  if (sourceQuestions.length > 0) {
    await db.insert(hrmEngagementSurveyQuestion).values(
      sourceQuestions.map((q) => ({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        templateId: newId,
        surveyId: null,
        sortOrder: q.sortOrder,
        questionType: q.questionType,
        category: q.category,
        prompt: q.prompt,
        config: q.config,
      }))
    )
  }

  return { id: newId }
}

export async function addEngagementTemplateQuestionMutation(input: {
  organizationId: string
  data: AddQuestionInput
}): Promise<{ id: string } | { ok: false; code: "template_missing" }> {
  const template = await db.query.hrmEngagementSurveyTemplate.findFirst({
    where: and(
      eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
      eq(hrmEngagementSurveyTemplate.id, input.data.templateId)
    ),
    columns: { id: true },
  })
  if (!template) return { ok: false, code: "template_missing" }

  const sortOrder =
    input.data.sortOrder ??
    (await nextTemplateQuestionSortOrder(
      input.organizationId,
      input.data.templateId
    ))

  const id = crypto.randomUUID()
  const questionConfig = buildQuestionConfigForMutation(
    input.data.questionType,
    input.data.choices
  )

  await db.insert(hrmEngagementSurveyQuestion).values({
    id,
    organizationId: input.organizationId,
    templateId: input.data.templateId,
    surveyId: null,
    sortOrder,
    questionType: input.data.questionType,
    category: input.data.category,
    prompt: input.data.prompt,
    config: questionConfig,
  })

  await db
    .update(hrmEngagementSurveyTemplate)
    .set({ updatedAt: new Date() })
    .where(eq(hrmEngagementSurveyTemplate.id, input.data.templateId))

  return { id }
}

export async function createEngagementSurveyDraftMutation(input: {
  organizationId: string
  actorUserId: string
  data: CreateSurveyDraftInput
}): Promise<{ id: string } | { ok: false; code: "template_missing" }> {
  if (input.data.templateId) {
    const template = await db.query.hrmEngagementSurveyTemplate.findFirst({
      where: and(
        eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
        eq(hrmEngagementSurveyTemplate.id, input.data.templateId)
      ),
      columns: { id: true },
    })
    if (!template) return { ok: false, code: "template_missing" }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmEngagementSurvey).values({
    id,
    organizationId: input.organizationId,
    templateId: input.data.templateId ?? null,
    title: input.data.title,
    surveyType: input.data.surveyType,
    state: "draft",
    anonymityMode: "anonymous",
    createdByUserId: input.actorUserId,
    updatedByUserId: input.actorUserId,
  })

  if (input.data.templateId) {
    await copyTemplateQuestionsToSurvey({
      organizationId: input.organizationId,
      templateId: input.data.templateId,
      surveyId: id,
    })
  }

  return { id }
}

export async function updateEngagementTemplateMutation(input: {
  organizationId: string
  actorUserId: string
  data: UpdateTemplateInput
}): Promise<{ id: string } | { ok: false; code: "template_missing" }> {
  const template = await db.query.hrmEngagementSurveyTemplate.findFirst({
    where: and(
      eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
      eq(hrmEngagementSurveyTemplate.id, input.data.templateId)
    ),
    columns: { id: true, state: true },
  })
  if (!template) return { ok: false, code: "template_missing" }
  if (template.state === "archived") {
    return { ok: false, code: "template_missing" }
  }

  await db
    .update(hrmEngagementSurveyTemplate)
    .set({
      name: input.data.name,
      description: input.data.description,
      state: input.data.state,
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(eq(hrmEngagementSurveyTemplate.id, input.data.templateId))

  return { id: input.data.templateId }
}

export async function archiveEngagementTemplateMutation(input: {
  organizationId: string
  actorUserId: string
  data: ArchiveTemplateInput
}): Promise<{ id: string } | { ok: false; code: "template_missing" }> {
  const template = await db.query.hrmEngagementSurveyTemplate.findFirst({
    where: and(
      eq(hrmEngagementSurveyTemplate.organizationId, input.organizationId),
      eq(hrmEngagementSurveyTemplate.id, input.data.templateId)
    ),
    columns: { id: true },
  })
  if (!template) return { ok: false, code: "template_missing" }

  await db
    .update(hrmEngagementSurveyTemplate)
    .set({
      state: "archived",
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(eq(hrmEngagementSurveyTemplate.id, input.data.templateId))

  return { id: input.data.templateId }
}

export async function updateEngagementSurveyDraftMutation(input: {
  organizationId: string
  actorUserId: string
  data: UpdateSurveyDraftInput
}): Promise<
  { id: string } | { ok: false; code: "survey_missing" | "not_draft" }
> {
  const survey = await db.query.hrmEngagementSurvey.findFirst({
    where: and(
      eq(hrmEngagementSurvey.organizationId, input.organizationId),
      eq(hrmEngagementSurvey.id, input.data.surveyId)
    ),
    columns: { id: true, state: true },
  })
  if (!survey) return { ok: false, code: "survey_missing" }
  if (survey.state !== "draft") return { ok: false, code: "not_draft" }

  await db
    .update(hrmEngagementSurvey)
    .set({
      title: input.data.title,
      surveyType: input.data.surveyType,
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(eq(hrmEngagementSurvey.id, input.data.surveyId))

  return { id: input.data.surveyId }
}

export async function deleteEngagementSurveyDraftMutation(input: {
  organizationId: string
  data: DeleteSurveyDraftInput
}): Promise<
  { id: string } | { ok: false; code: "survey_missing" | "not_draft" }
> {
  const survey = await db.query.hrmEngagementSurvey.findFirst({
    where: and(
      eq(hrmEngagementSurvey.organizationId, input.organizationId),
      eq(hrmEngagementSurvey.id, input.data.surveyId)
    ),
    columns: { id: true, state: true },
  })
  if (!survey) return { ok: false, code: "survey_missing" }
  if (survey.state !== "draft") return { ok: false, code: "not_draft" }

  await db
    .delete(hrmEngagementSurvey)
    .where(eq(hrmEngagementSurvey.id, input.data.surveyId))

  return { id: input.data.surveyId }
}
