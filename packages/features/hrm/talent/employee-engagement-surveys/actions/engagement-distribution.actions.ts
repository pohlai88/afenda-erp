"use server"

import { after } from "next/server"

import { requireHrmPermission } from "../../../_core/governance"
import { hrmActionFailure } from "../../../_core/governance"
import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { writeEngagementIamAuditAfterCommit } from "../data/engagement-audit.server"
import { deliverEngagementSurveyInvitationNotices } from "../data/engagement-invitation-notify.server"
import {
  closeEngagementSurveyMutation,
  publishEngagementSurveyMutation,
  resendEngagementInvitationMutation,
} from "../data/engagement-distribution.mutations.server"
import { deliverEngagementInvitationResendNotice } from "../data/engagement-invitation-notify.server"
import {
  revalidateEmployeeEngagementSurveyDetail,
  revalidateEmployeeEngagementSurfaces,
} from "../data/engagement-revalidate.server"
import {
  closeEngagementSurveyFormSchema,
  publishEngagementSurveyFormSchema,
  resendEngagementInvitationFormSchema,
} from "../schemas/engagement-distribution-action.schema"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

export async function publishEngagementSurveyAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = publishEngagementSurveyFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await publishEngagementSurveyMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    surveyId: parsed.data.surveyId,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.publish,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.surveyId,
    metadata: { published: true, invitationBatch: true },
  })

  after(() =>
    deliverEngagementSurveyInvitationNotices({
      organizationId: gate.session.organizationId,
      surveyId: result.surveyId,
    })
  )

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(result.surveyId)
  return { ok: true }
}

export async function closeEngagementSurveyAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = closeEngagementSurveyFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await closeEngagementSurveyMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    surveyId: parsed.data.surveyId,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.close,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.surveyId,
    metadata: { closed: true },
  })

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(result.surveyId)
  return { ok: true }
}

export async function resendEngagementInvitationAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = resendEngagementInvitationFormSchema.safeParse({
    invitationId: formData.get("invitationId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await resendEngagementInvitationMutation({
    organizationId: gate.session.organizationId,
    invitationId: parsed.data.invitationId,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  await deliverEngagementInvitationResendNotice({
    organizationId: gate.session.organizationId,
    invitationId: result.invitationId,
  })

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.remind,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_invitation",
    resourceId: result.invitationId,
    metadata: { resent: true },
  })

  revalidateEmployeeEngagementSurfaces()
  return { ok: true }
}
