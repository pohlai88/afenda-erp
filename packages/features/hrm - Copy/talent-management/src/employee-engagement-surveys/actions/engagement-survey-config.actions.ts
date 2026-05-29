"use server"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { writeEngagementIamAuditAfterCommit } from "../data/engagement-audit.server"
import {
  revertEngagementSurveyToDraftMutation,
  saveEngagementSurveyConfigurationMutation,
  scheduleEngagementSurveyMutation,
} from "../data/engagement-survey-config.mutations.server"
import {
  revalidateEmployeeEngagementSurveyDetail,
  revalidateEmployeeEngagementSurfaces,
} from "../data/engagement-revalidate.server"
import { parseEngagementAudienceFilterFromFormData } from "../schemas/engagement-audience.shared"
import {
  revertEngagementSurveyToDraftFormSchema,
  saveEngagementSurveyConfigurationFormSchema,
  scheduleEngagementSurveyFormSchema,
} from "../schemas/engagement-config-action.schema"
import { parseEngagementReminderScheduleFromFormData } from "../schemas/engagement-reminder.shared"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

export async function saveEngagementSurveyConfigurationAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const allowDraftResponses = formData
    .getAll("allowDraftResponses")
    .includes("on")

  const parsed = saveEngagementSurveyConfigurationFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
    anonymityMode: formData.get("anonymityMode"),
    minSegmentResponses: formData.get("minSegmentResponses"),
    allowDraftResponses: allowDraftResponses ? "on" : "off",
    cycleId: formData.get("cycleId"),
    cycleKey: formData.get("cycleKey"),
    cycleLabel: formData.get("cycleLabel"),
    openAt: formData.get("openAt"),
    closeAt: formData.get("closeAt"),
  })
  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message,
    })
  }

  const audienceFilter = parseEngagementAudienceFilterFromFormData(formData)
  const reminderSchedule = parseEngagementReminderScheduleFromFormData(formData)

  const result = await saveEngagementSurveyConfigurationMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    surveyId: parsed.data.surveyId,
    anonymityMode: parsed.data.anonymityMode,
    minSegmentResponses: parsed.data.minSegmentResponses,
    audienceFilter,
    openAt: parsed.data.openAt,
    closeAt: parsed.data.closeAt,
    reminderSchedule,
    allowDraftResponses: parsed.data.allowDraftResponses,
    cycleId: parsed.data.cycleId,
    cycleKey: parsed.data.cycleKey ?? null,
    cycleLabel: parsed.data.cycleLabel ?? null,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.surveyId,
    metadata: {
      configured: true,
      anonymityMode: parsed.data.anonymityMode,
    },
  })

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(result.surveyId)
  return { ok: true }
}

export async function scheduleEngagementSurveyAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const allowDraftResponses = formData
    .getAll("allowDraftResponses")
    .includes("on")

  const parsed = scheduleEngagementSurveyFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
    anonymityMode: formData.get("anonymityMode"),
    minSegmentResponses: formData.get("minSegmentResponses"),
    allowDraftResponses: allowDraftResponses ? "on" : "off",
    cycleId: formData.get("cycleId"),
    cycleKey: formData.get("cycleKey"),
    cycleLabel: formData.get("cycleLabel"),
    openAt: formData.get("openAt"),
    closeAt: formData.get("closeAt"),
  })
  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message,
    })
  }

  const audienceFilter = parseEngagementAudienceFilterFromFormData(formData)
  const reminderSchedule = parseEngagementReminderScheduleFromFormData(formData)

  const result = await scheduleEngagementSurveyMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    surveyId: parsed.data.surveyId,
    anonymityMode: parsed.data.anonymityMode,
    minSegmentResponses: parsed.data.minSegmentResponses,
    audienceFilter,
    openAt: parsed.data.openAt,
    closeAt: parsed.data.closeAt,
    reminderSchedule,
    allowDraftResponses: parsed.data.allowDraftResponses,
    cycleId: parsed.data.cycleId,
    cycleKey: parsed.data.cycleKey ?? null,
    cycleLabel: parsed.data.cycleLabel ?? null,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.surveyId,
    metadata: { scheduled: true },
  })

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(result.surveyId)
  return { ok: true }
}

export async function revertEngagementSurveyToDraftAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = revertEngagementSurveyToDraftFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await revertEngagementSurveyToDraftMutation({
    organizationId: gate.session.organizationId,
    actorUserId: gate.session.userId,
    surveyId: parsed.data.surveyId,
  })

  if ("ok" in result) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.update,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_survey",
    resourceId: result.surveyId,
    metadata: { revertedToDraft: true },
  })

  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(result.surveyId)
  return { ok: true }
}
