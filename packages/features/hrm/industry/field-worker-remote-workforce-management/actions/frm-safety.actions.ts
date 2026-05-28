"use server"

import { and, eq } from "drizzle-orm"

import { requireOrgSession } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmFrmFieldAssignment } from "@afenda/platform/db/schema"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateFrmSafetyCheckinFormState } from "../../../_core/shared"
import { createFrmSafetyCheckin } from "../data/frm-travel.server"
import { createFrmSafetyCheckinFormSchema } from "../schemas/frm.schema"

export async function createFrmSafetyCheckinAction(
  _prev: CreateFrmSafetyCheckinFormState | undefined,
  formData: FormData
): Promise<CreateFrmSafetyCheckinFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "field_workforce",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to record field safety check-ins.",
    })
  }

  const parsed = createFrmSafetyCheckinFormSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    eventType: formData.get("eventType"),
    latitude: formData.get("latitude") || null,
    longitude: formData.get("longitude") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const assignment = await db.query.hrmFrmFieldAssignment.findFirst({
    where: and(
      eq(hrmFrmFieldAssignment.id, parsed.data.assignmentId),
      eq(hrmFrmFieldAssignment.organizationId, organizationId),
      eq(hrmFrmFieldAssignment.state, "active")
    ),
    columns: { id: true, employeeId: true },
  })
  if (!assignment) {
    return hrmActionFailure({ form: "Active field assignment not found." })
  }

  const result = await createFrmSafetyCheckin({
    organizationId,
    userId,
    assignmentId: parsed.data.assignmentId,
    employeeId: assignment.employeeId,
    eventType: parsed.data.eventType,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true }
}
