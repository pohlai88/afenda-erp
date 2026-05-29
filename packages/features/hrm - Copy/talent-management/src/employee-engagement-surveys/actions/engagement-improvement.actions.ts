"use server"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { writeEngagementIamAuditAfterCommit } from "../data/engagement-audit.server"
import {
  completeEngagementImprovementActionMutation,
  createEngagementImprovementActionMutation,
  updateEngagementImprovementActionMutation,
} from "../data/engagement-improvement.mutations.server"
import {
  revalidateEmployeeEngagementSurveyDetail,
  revalidateEmployeeEngagementSurfaces,
} from "../data/engagement-revalidate.server"
import {
  completeEngagementImprovementActionFormSchema,
  createEngagementImprovementActionFormSchema,
  updateEngagementImprovementActionFormSchema,
} from "../schemas/engagement-improvement-action.schema"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

function revalidateAfterImprovementChange(surveyId: string) {
  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(surveyId)
}

export async function createEngagementImprovementActionAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "create",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = createEngagementImprovementActionFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
    title: formData.get("title"),
    ownerEmployeeId: formData.get("ownerEmployeeId"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    category: formData.get("category"),
    questionId: formData.get("questionId"),
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      title: fieldErrors.title?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await createEngagementImprovementActionMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    ...parsed.data,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.create,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_improvement_action",
    resourceId: result.actionId,
    metadata: { surveyId: parsed.data.surveyId },
  })

  revalidateAfterImprovementChange(parsed.data.surveyId)
  return { ok: true }
}

export async function updateEngagementImprovementActionAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = updateEngagementImprovementActionFormSchema.safeParse({
    actionId: formData.get("actionId"),
    surveyId: formData.get("surveyId"),
    nextStatus: formData.get("nextStatus") || undefined,
    ownerEmployeeId: formData.get("ownerEmployeeId"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await updateEngagementImprovementActionMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    actionId: parsed.data.actionId,
    surveyId: parsed.data.surveyId,
    nextStatus: parsed.data.nextStatus,
    ownerEmployeeId: parsed.data.ownerEmployeeId,
    dueDate: parsed.data.dueDate,
    priority: parsed.data.priority,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_improvement_action",
    resourceId: result.actionId,
    metadata: {
      surveyId: parsed.data.surveyId,
      nextStatus: parsed.data.nextStatus,
    },
  })

  revalidateAfterImprovementChange(parsed.data.surveyId)
  return { ok: true }
}

export async function completeEngagementImprovementActionAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = completeEngagementImprovementActionFormSchema.safeParse({
    actionId: formData.get("actionId"),
    surveyId: formData.get("surveyId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await completeEngagementImprovementActionMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    actionId: parsed.data.actionId,
    surveyId: parsed.data.surveyId,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.complete,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_improvement_action",
    resourceId: result.actionId,
    metadata: { surveyId: parsed.data.surveyId },
  })

  revalidateAfterImprovementChange(parsed.data.surveyId)
  return { ok: true }
}
