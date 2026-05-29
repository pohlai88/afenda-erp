"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  ClaimRwsOpenShiftFormState,
  CreateRwsOpenShiftOfferFormState,
} from "@afenda/feature-hrm-core/shared"
import {
  claimRwsOpenShiftOffer,
  createRwsOpenShiftOffer,
} from "../data/rws-open-shift.server"
import {
  claimRwsOpenShiftFormSchema,
  createRwsOpenShiftOfferFormSchema,
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

async function requireRwsClaimPermission(input: {
  organizationId: string
  userId: string
}) {
  const [canUpdate, canRead] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "retail_schedule",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "retail_schedule",
        function: "read",
      },
    }),
  ])
  if (!canUpdate && !canRead) {
    return hrmActionFailure({
      form: "You are not authorized to claim open shifts.",
    })
  }
  return null
}

export async function createRwsOpenShiftOfferAction(
  _prev: CreateRwsOpenShiftOfferFormState | undefined,
  formData: FormData
): Promise<CreateRwsOpenShiftOfferFormState> {
  const session = await requireOrgSession()
  const denied = await requireRwsManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createRwsOpenShiftOfferFormSchema.safeParse({
    schedulePeriodId: formData.get("schedulePeriodId"),
    storeId: formData.get("storeId"),
    slotDate: formData.get("slotDate"),
    retailRole: formData.get("retailRole"),
    claimMode: formData.get("claimMode"),
    coverageSlotId: formData.get("coverageSlotId") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createRwsOpenShiftOffer({
    organizationId: session.organizationId,
    userId: session.userId,
    schedulePeriodId: parsed.data.schedulePeriodId,
    storeId: parsed.data.storeId,
    slotDate: parsed.data.slotDate,
    retailRole: parsed.data.retailRole,
    claimMode: parsed.data.claimMode,
    coverageSlotId: parsed.data.coverageSlotId ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, openShiftOfferId: result.openShiftOfferId }
}

export async function claimRwsOpenShiftAction(
  _prev: ClaimRwsOpenShiftFormState | undefined,
  formData: FormData
): Promise<ClaimRwsOpenShiftFormState> {
  const session = await requireOrgSession()
  const denied = await requireRwsClaimPermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = claimRwsOpenShiftFormSchema.safeParse({
    openShiftOfferId: formData.get("openShiftOfferId"),
    employeeId: formData.get("employeeId"),
    shiftTemplateId: formData.get("shiftTemplateId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await claimRwsOpenShiftOffer({
    organizationId: session.organizationId,
    userId: session.userId,
    ...parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
