"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateRwsCoverageSlotFormState } from "../../../_core/shared"
import { createRwsCoverageSlot } from "../data/rws-coverage.server"
import { createRwsCoverageSlotFormSchema } from "../schemas/rws.schema"

async function requireRwsManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "retail_schedule",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage retail scheduling.",
    })
  }
  return null
}

export async function createRwsCoverageSlotAction(
  _prev: CreateRwsCoverageSlotFormState | undefined,
  formData: FormData
): Promise<CreateRwsCoverageSlotFormState> {
  const session = await requireOrgSession()
  const denied = await requireRwsManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createRwsCoverageSlotFormSchema.safeParse({
    schedulePeriodId: formData.get("schedulePeriodId"),
    storeId: formData.get("storeId"),
    slotDate: formData.get("slotDate"),
    hourOfDay: formData.get("hourOfDay"),
    retailRole: formData.get("retailRole"),
    requiredHeadcount: formData.get("requiredHeadcount"),
    departmentRef: formData.get("departmentRef") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createRwsCoverageSlot({
    organizationId: session.organizationId,
    userId: session.userId,
    schedulePeriodId: parsed.data.schedulePeriodId,
    storeId: parsed.data.storeId,
    slotDate: parsed.data.slotDate,
    hourOfDay: parsed.data.hourOfDay,
    retailRole: parsed.data.retailRole,
    requiredHeadcount: parsed.data.requiredHeadcount,
    departmentRef: parsed.data.departmentRef ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, coverageSlotId: result.coverageSlotId }
}
