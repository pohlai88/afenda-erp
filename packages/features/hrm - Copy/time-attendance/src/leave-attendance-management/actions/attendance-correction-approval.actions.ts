"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireOrgSession } from "@afenda/platform/auth"
import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { approveAttendanceCorrectionApproval } from "../data/attendance-correction-approval.server"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { AttendanceCorrectionFormState } from "@afenda/feature-hrm-core/shared"

const decisionSchema = z.object({
  approvalId: z.string().uuid(),
})

function revalidateAttendance() {
  revalidatePath(toLocaleOrgAppsRevalidatePattern("/hrm/attendance"), "layout")
}

export async function approveAttendanceCorrectionAction(
  _prev: AttendanceCorrectionFormState | undefined,
  formData: FormData
): Promise<AttendanceCorrectionFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: { module: "hrm", object: "attendance", function: "update" },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "HRM attendance update permission required.",
    })
  }

  const parsed = decisionSchema.safeParse({
    approvalId: formData.get("approvalId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await approveAttendanceCorrectionApproval({
    organizationId,
    userId,
    sessionId,
    approvalId: parsed.data.approvalId,
  })

  if (result.ok) {
    revalidateAttendance()
  }

  return result
}
