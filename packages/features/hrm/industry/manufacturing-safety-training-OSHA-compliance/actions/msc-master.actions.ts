"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  CreateMscMachineFormState,
  CreateMscSiteFormState,
} from "../data/msc-form-state.shared"
import { createMscMachine, createMscSite } from "../data/msc-masters.server"
import {
  createMscMachineFormSchema,
  createMscSiteFormSchema,
} from "../schemas/msc.schema"

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return null
  return raw
}

async function requireMscUpdatePermission(input: {
  organizationId: string
  userId: string
  errorMessage: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: input.errorMessage })
  }
  return null
}

export async function createMscSiteAction(
  _prev: CreateMscSiteFormState | undefined,
  formData: FormData
): Promise<CreateMscSiteFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to manage manufacturing safety sites.",
  })
  if (denied) return denied

  const parsed = createMscSiteFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    countryCode: formData.get("countryCode") || null,
    oshaRecordkeepingEnabled: formData.get("oshaRecordkeepingEnabled") === "on",
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createMscSite({
    organizationId,
    userId,
    code: parsed.data.code,
    name: parsed.data.name,
    countryCode: parsed.data.countryCode,
    oshaRecordkeepingEnabled: parsed.data.oshaRecordkeepingEnabled,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, siteId: result.siteId }
}

export async function createMscMachineAction(
  _prev: CreateMscMachineFormState | undefined,
  formData: FormData
): Promise<CreateMscMachineFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to manage manufacturing safety machines.",
  })
  if (denied) return denied

  const parsed = createMscMachineFormSchema.safeParse({
    siteId: parseOptionalUuid(formData.get("siteId")),
    code: formData.get("code"),
    name: formData.get("name"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createMscMachine({
    organizationId,
    userId,
    siteId: parsed.data.siteId ?? null,
    code: parsed.data.code,
    name: parsed.data.name,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, machineId: result.machineId }
}
