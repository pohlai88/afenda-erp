"use server"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { writeEngagementIamAuditAfterCommit } from "../data/engagement-audit.server"
import {
  addEngagementTemplateQuestionMutation,
  archiveEngagementTemplateMutation,
  cloneEngagementTemplateMutation,
  createEngagementSurveyDraftMutation,
  createEngagementTemplateMutation,
  deleteEngagementSurveyDraftMutation,
  updateEngagementSurveyDraftMutation,
  updateEngagementTemplateMutation,
} from "../data/engagement.mutations.server"
import { revalidateEmployeeEngagementSurfaces } from "../data/engagement-revalidate.server"
import {
  addEngagementTemplateQuestionFormSchema,
  archiveEngagementTemplateFormSchema,
  cloneEngagementTemplateFormSchema,
  createEngagementSurveyDraftFormSchema,
  createEngagementTemplateFormSchema,
  deleteEngagementSurveyDraftFormSchema,
  updateEngagementSurveyDraftFormSchema,
  updateEngagementTemplateFormSchema,
} from "../schemas/engagement-action.schema"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

export async function createEngagementTemplateAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "create",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = createEngagementTemplateFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description"),
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      code: fieldErrors.code?.[0],
      name: fieldErrors.name?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await createEngagementTemplateMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    data: parsed.data,
  })

  if ("ok" in result) {
    return hrmActionFailure({
      code: "A template with this code already exists.",
    })
  }

  const { id: templateId } = result

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.create,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_template",
    resourceId: templateId,
    metadata: { code: parsed.data.code },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function cloneEngagementTemplateAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "create",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = cloneEngagementTemplateFormSchema.safeParse({
    sourceTemplateId: formData.get("sourceTemplateId"),
    code: formData.get("code"),
    name: formData.get("name"),
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      code: fieldErrors.code?.[0],
      name: fieldErrors.name?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await cloneEngagementTemplateMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    data: parsed.data,
  })

  if ("ok" in result) {
    if (result.code === "duplicate_code") {
      return hrmActionFailure({
        code: "A template with this code already exists.",
      })
    }
    return hrmActionFailure({ form: "Source template was not found." })
  }

  const { id: clonedTemplateId } = result

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.create,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_template",
    resourceId: clonedTemplateId,
    metadata: {
      clonedFromTemplateId: parsed.data.sourceTemplateId,
      code: parsed.data.code,
    },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function addEngagementTemplateQuestionAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = addEngagementTemplateQuestionFormSchema.safeParse({
    templateId: formData.get("templateId"),
    prompt: formData.get("prompt"),
    questionType: formData.get("questionType"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
    choices: formData.get("choices"),
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      prompt: fieldErrors.prompt?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await addEngagementTemplateQuestionMutation({
    organizationId: gate.session.organizationId,
    data: parsed.data,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: "Template was not found." })
  }

  const { id: questionId } = result

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_template",
    resourceId: parsed.data.templateId,
    metadata: { questionId },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function createEngagementSurveyDraftAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "create",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = createEngagementSurveyDraftFormSchema.safeParse({
    title: formData.get("title"),
    surveyType: formData.get("surveyType"),
    templateId: formData.get("templateId"),
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      title: fieldErrors.title?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await createEngagementSurveyDraftMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    data: parsed.data,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: "Selected template was not found." })
  }

  const { id: surveyId } = result

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.create,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: surveyId,
    metadata: {
      surveyType: parsed.data.surveyType,
      templateId: parsed.data.templateId ?? null,
    },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function updateEngagementTemplateAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = updateEngagementTemplateFormSchema.safeParse({
    templateId: formData.get("templateId"),
    name: formData.get("name"),
    description: formData.get("description"),
    state: formData.get("state"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await updateEngagementTemplateMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    data: parsed.data,
  })
  if ("ok" in result) {
    return hrmActionFailure({ form: "Template was not found or is archived." })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_template",
    resourceId: result.id,
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function archiveEngagementTemplateAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = archiveEngagementTemplateFormSchema.safeParse({
    templateId: formData.get("templateId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await archiveEngagementTemplateMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    data: parsed.data,
  })
  if ("ok" in result) {
    return hrmActionFailure({ form: "Template was not found." })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.deprecate,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_template",
    resourceId: result.id,
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function updateEngagementSurveyDraftAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = updateEngagementSurveyDraftFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
    title: formData.get("title"),
    surveyType: formData.get("surveyType"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await updateEngagementSurveyDraftMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    data: parsed.data,
  })
  if ("ok" in result) {
    if (result.code === "not_draft") {
      return hrmActionFailure({
        form: "Only draft surveys can be updated in this slice.",
      })
    }
    return hrmActionFailure({ form: "Survey was not found." })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.id,
    metadata: { surveyType: parsed.data.surveyType },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}

export async function deleteEngagementSurveyDraftAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "delete",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = deleteEngagementSurveyDraftFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await deleteEngagementSurveyDraftMutation({
    organizationId: gate.session.organizationId,
    data: parsed.data,
  })
  if ("ok" in result) {
    if (result.code === "not_draft") {
      return hrmActionFailure({
        form: "Only draft surveys can be deleted in this slice.",
      })
    }
    return hrmActionFailure({ form: "Survey was not found." })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.id,
    metadata: { deleted: true },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}
