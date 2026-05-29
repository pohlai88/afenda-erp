"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { createSuccessionCriticalRole, updateSuccessionCriticalRole } from "../data/succession-critical-roles.server"
import {
  createCriticalRoleFormSchema,
  normalizeSuccessionCode,
  updateCriticalRoleFormSchema,
  type SuccessionMutationFormState,
  withSuccessionNullableFields,
} from "../schemas/succession.schema"

async function requireSuccessionManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "succession",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage succession planning.",
    })
  }
  return null
}

export async function createSuccessionCriticalRoleAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createCriticalRoleFormSchema.safeParse({
    code: formData.get("code"),
    title: formData.get("title"),
    businessImpact: formData.get("businessImpact"),
    leadershipLevel: formData.get("leadershipLevel"),
    vacancyRisk: formData.get("vacancyRisk"),
    replacementDifficulty: formData.get("replacementDifficulty"),
    orgUnitId: formData.get("orgUnitId") || null,
    positionId: formData.get("positionId") || null,
    jobFamilyRef: formData.get("jobFamilyRef") || null,
    gradeRef: formData.get("gradeRef") || null,
    incumbentEmployeeId: formData.get("incumbentEmployeeId") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, [
    "orgUnitId",
    "positionId",
    "jobFamilyRef",
    "gradeRef",
    "incumbentEmployeeId",
    "notes",
  ])
  const result = await createSuccessionCriticalRole({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
    code: normalizeSuccessionCode(data.code),
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.criticalRoleId }
}

export async function updateSuccessionCriticalRoleAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateCriticalRoleFormSchema.safeParse({
    criticalRoleId: formData.get("criticalRoleId"),
    code: formData.get("code"),
    title: formData.get("title"),
    businessImpact: formData.get("businessImpact"),
    leadershipLevel: formData.get("leadershipLevel"),
    vacancyRisk: formData.get("vacancyRisk"),
    replacementDifficulty: formData.get("replacementDifficulty"),
    orgUnitId: formData.get("orgUnitId") || null,
    positionId: formData.get("positionId") || null,
    jobFamilyRef: formData.get("jobFamilyRef") || null,
    gradeRef: formData.get("gradeRef") || null,
    incumbentEmployeeId: formData.get("incumbentEmployeeId") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, [
    "orgUnitId",
    "positionId",
    "jobFamilyRef",
    "gradeRef",
    "incumbentEmployeeId",
    "notes",
  ])
  const result = await updateSuccessionCriticalRole({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
    code: normalizeSuccessionCode(data.code),
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: parsed.data.criticalRoleId }
}
