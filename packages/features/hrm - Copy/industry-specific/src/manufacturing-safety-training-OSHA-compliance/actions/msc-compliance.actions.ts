"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  createMscRegulatoryReference,
  createMscWorkRestriction,
} from "../data/msc-compliance-records.server"
import type {
  CreateMscRegulatoryReferenceFormState,
  CreateMscWorkRestrictionFormState,
} from "../data/msc-form-state.shared"
import {
  createMscRegulatoryReferenceFormSchema,
  createMscWorkRestrictionFormSchema,
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

export async function createMscRegulatoryReferenceAction(
  _prev: CreateMscRegulatoryReferenceFormState | undefined,
  formData: FormData
): Promise<CreateMscRegulatoryReferenceFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to manage manufacturing safety regulatory references.",
  })
  if (denied) return denied

  const parsed = createMscRegulatoryReferenceFormSchema.safeParse({
    framework: formData.get("framework"),
    referenceCode: formData.get("referenceCode") || null,
    referenceLabel: formData.get("referenceLabel") || null,
    notes: formData.get("notes") || null,
    siteId: parseOptionalUuid(formData.get("siteId")),
    requirementRuleId: parseOptionalUuid(formData.get("requirementRuleId")),
  })
  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message ?? "Invalid regulatory reference.",
    })
  }

  const result = await createMscRegulatoryReference({
    organizationId,
    userId,
    framework: parsed.data.framework,
    referenceCode: parsed.data.referenceCode ?? null,
    referenceLabel: parsed.data.referenceLabel ?? null,
    notes: parsed.data.notes ?? null,
    siteId: parsed.data.siteId ?? null,
    requirementRuleId: parsed.data.requirementRuleId ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, referenceId: result.referenceId }
}

export async function createMscWorkRestrictionAction(
  _prev: CreateMscWorkRestrictionFormState | undefined,
  formData: FormData
): Promise<CreateMscWorkRestrictionFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to manage manufacturing safety work restrictions.",
  })
  if (denied) return denied

  const parsed = createMscWorkRestrictionFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    obligationId: parseOptionalUuid(formData.get("obligationId")),
    machineId: parseOptionalUuid(formData.get("machineId")),
    restrictionScope: formData.get("restrictionScope"),
    effectiveFrom: formData.get("effectiveFrom"),
    effectiveTo: formData.get("effectiveTo") || null,
    reason: formData.get("reason") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message ?? "Invalid work restriction.",
    })
  }

  const result = await createMscWorkRestriction({
    organizationId,
    userId,
    employeeId: parsed.data.employeeId,
    obligationId: parsed.data.obligationId ?? null,
    machineId: parsed.data.machineId ?? null,
    restrictionScope: parsed.data.restrictionScope,
    effectiveFrom: parsed.data.effectiveFrom,
    effectiveTo: parsed.data.effectiveTo ?? null,
    reason: parsed.data.reason ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, restrictionId: result.restrictionId }
}
