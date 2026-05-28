"use server"

import { requireOrgSession } from "@afenda/platform/auth"

import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { writeEngagementIamAuditAfterCommit } from "../data/engagement-audit.server"
import {
  saveEngagementResponseDraftMutation,
  submitEngagementResponseMutation,
} from "../data/engagement-response.mutations.server"
import {
  loadEngagementRespondPageData,
  resolveEngagementEmployeeIdForUser,
} from "../data/engagement-response.queries.server"
import {
  revalidateEmployeeEngagementRespond,
  revalidateEmployeeEngagementSurveyDetail,
  revalidateEmployeeEngagementSurfaces,
} from "../data/engagement-revalidate.server"
import { hrmActionFailure } from "../../../_core/governance"
import {
  saveEngagementResponseDraftFormSchema,
  submitEngagementResponseFormSchema,
} from "../schemas/engagement-response-action.schema"
import { parseEngagementAnswersFromFormData } from "../schemas/engagement-response.shared"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

export async function saveEngagementResponseDraftAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const session = await requireOrgSession()
  const parsed = saveEngagementResponseDraftFormSchema.safeParse({
    invitationId: formData.get("invitationId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const employeeId = await resolveEngagementEmployeeIdForUser({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (!employeeId) {
    return hrmActionFailure({
      form: "Your account is not linked to an active employee record.",
    })
  }

  const page = await loadEngagementRespondPageData({
    organizationId: session.organizationId,
    employeeId,
    invitationId: parsed.data.invitationId,
  })
  if (!page) {
    return hrmActionFailure({ form: "Invitation not found." })
  }

  const answers = parseEngagementAnswersFromFormData(
    formData,
    page.questions.map((q) => q.id)
  )

  const result = await saveEngagementResponseDraftMutation({
    organizationId: session.organizationId,
    employeeId,
    invitationId: parsed.data.invitationId,
    answers,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.response.draft,
    actorUserId: session.userId,
    actorSessionId: session.sessionId,
    organizationId: session.organizationId,
    resourceType: "employee_engagement_response",
    resourceId: result.invitationId,
    metadata: { draft: true, answerCount: answers.length },
  })

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(page.surveyId)
  revalidateEmployeeEngagementRespond(parsed.data.invitationId)
  return { ok: true }
}

export async function submitEngagementResponseAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const session = await requireOrgSession()
  const parsed = submitEngagementResponseFormSchema.safeParse({
    invitationId: formData.get("invitationId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const employeeId = await resolveEngagementEmployeeIdForUser({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (!employeeId) {
    return hrmActionFailure({
      form: "Your account is not linked to an active employee record.",
    })
  }

  const page = await loadEngagementRespondPageData({
    organizationId: session.organizationId,
    employeeId,
    invitationId: parsed.data.invitationId,
  })
  if (!page) {
    return hrmActionFailure({ form: "Invitation not found." })
  }

  const answers = parseEngagementAnswersFromFormData(
    formData,
    page.questions.map((q) => q.id)
  )

  const result = await submitEngagementResponseMutation({
    organizationId: session.organizationId,
    employeeId,
    invitationId: parsed.data.invitationId,
    answers,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.response.submit,
    actorUserId: session.userId,
    actorSessionId: session.sessionId,
    organizationId: session.organizationId,
    resourceType: "employee_engagement_response",
    resourceId: result.invitationId,
    metadata: { submitted: true, answerCount: answers.length },
  })

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(page.surveyId)
  revalidateEmployeeEngagementRespond(parsed.data.invitationId)
  return { ok: true }
}

export async function engagementResponseFormAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const intent = formData.get("intent")
  if (intent === "draft") {
    return saveEngagementResponseDraftAction(_prev, formData)
  }
  return submitEngagementResponseAction(_prev, formData)
}
