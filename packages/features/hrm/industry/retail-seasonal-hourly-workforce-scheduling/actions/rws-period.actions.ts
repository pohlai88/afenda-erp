"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  CreateRwsSchedulePeriodFormState,
  PublishRwsSchedulePeriodFormState,
} from "../../../_core/shared"
import {
  createRwsSchedulePeriod,
  publishRetailSchedulePeriod,
} from "../data/rws-periods.server"
import {
  createRwsSchedulePeriodFormSchema,
  publishRwsSchedulePeriodFormSchema,
} from "../schemas/rws.schema"

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

export async function createRwsSchedulePeriodAction(
  _prev: CreateRwsSchedulePeriodFormState | undefined,
  formData: FormData
): Promise<CreateRwsSchedulePeriodFormState> {
  const session = await requireOrgSession()
  const denied = await requireRwsManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createRwsSchedulePeriodFormSchema.safeParse({
    storeId: formData.get("storeId"),
    code: formData.get("code"),
    name: formData.get("name"),
    periodKind: formData.get("periodKind"),
    periodStartDate: formData.get("periodStartDate"),
    periodEndDate: formData.get("periodEndDate"),
    campaignLabel: formData.get("campaignLabel") || null,
    teamRef: formData.get("teamRef") || null,
    roleRef: formData.get("roleRef") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createRwsSchedulePeriod({
    organizationId: session.organizationId,
    userId: session.userId,
    storeId: parsed.data.storeId,
    code: parsed.data.code,
    name: parsed.data.name,
    periodKind: parsed.data.periodKind,
    periodStartDate: parsed.data.periodStartDate,
    periodEndDate: parsed.data.periodEndDate,
    campaignLabel: parsed.data.campaignLabel ?? null,
    teamRef: parsed.data.teamRef ?? null,
    roleRef: parsed.data.roleRef ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, schedulePeriodId: result.schedulePeriodId }
}

export async function publishRwsSchedulePeriodAction(
  _prev: PublishRwsSchedulePeriodFormState | undefined,
  formData: FormData
): Promise<PublishRwsSchedulePeriodFormState> {
  const session = await requireOrgSession()
  const denied = await requireRwsManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = publishRwsSchedulePeriodFormSchema.safeParse({
    schedulePeriodId: formData.get("schedulePeriodId"),
    note: formData.get("note") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await publishRetailSchedulePeriod({
    organizationId: session.organizationId,
    userId: session.userId,
    schedulePeriodId: parsed.data.schedulePeriodId,
    note: parsed.data.note ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
