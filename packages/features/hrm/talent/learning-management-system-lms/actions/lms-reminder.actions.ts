"use server"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { hrmActionFailure } from "../../../_core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import { dispatchLmsReminderFormSchema } from "../schemas/lms.schema"

export async function dispatchLmsReminderAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = dispatchLmsReminderFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    reminderId: formData.get("reminderId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid reminder dispatch payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.reminderDispatch,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_reminder",
      resourceId: parsed.data.reminderId,
      metadata: { channel: "in_app" },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: parsed.data.reminderId }
}

export async function submitDispatchLmsReminder(formData: FormData) {
  await dispatchLmsReminderAction(formData)
}
