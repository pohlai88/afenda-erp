"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  CreateGpgAdjustmentReferenceFormState,
  CreateGpgEmployeeAssignmentFormState,
  CreateGpgLocalityRuleFormState,
} from "../../../_core/shared"
import { createGpgEmployeeAssignment } from "../data/gpg-assignments.server"
import {
  createGpgAdjustmentReference,
  createGpgLocalityRule,
} from "../data/gpg-locality.server"
import {
  createGpgAdjustmentReferenceFormSchema,
  createGpgEmployeeAssignmentFormSchema,
  createGpgLocalityRuleFormSchema,
} from "../schemas/gpg.schema"

async function requireGpgManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "government_pay_grade",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage government pay grades.",
    })
  }
  return null
}

export async function createGpgEmployeeAssignmentAction(
  _prev: CreateGpgEmployeeAssignmentFormState | undefined,
  formData: FormData
): Promise<CreateGpgEmployeeAssignmentFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const payBandRaw = formData.get("payBandId")
  const parsed = createGpgEmployeeAssignmentFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    classificationId: formData.get("classificationId"),
    payGradeId: formData.get("payGradeId"),
    payBandId: typeof payBandRaw === "string" && payBandRaw ? payBandRaw : null,
    salaryTableVersionId: formData.get("salaryTableVersionId"),
    step: formData.get("step"),
    appointmentType: formData.get("appointmentType"),
    effectiveFrom: formData.get("effectiveFrom"),
    positionId: formData.get("positionId") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgEmployeeAssignment({
    organizationId,
    userId,
    employeeId: data.employeeId,
    classificationId: data.classificationId,
    payGradeId: data.payGradeId,
    payBandId: data.payBandId ?? null,
    salaryTableVersionId: data.salaryTableVersionId,
    step: data.step,
    appointmentType: data.appointmentType,
    effectiveFrom: data.effectiveFrom,
    positionId: data.positionId ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, assignmentId: result.assignmentId }
}

export async function createGpgLocalityRuleAction(
  _prev: CreateGpgLocalityRuleFormState | undefined,
  formData: FormData
): Promise<CreateGpgLocalityRuleFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgLocalityRuleFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    localityType: formData.get("localityType"),
    effectiveDate: formData.get("effectiveDate"),
    adjustmentPercent: formData.get("adjustmentPercent") || null,
    areaRef: formData.get("areaRef") || null,
    regionCode: formData.get("regionCode") || null,
    countryCode: formData.get("countryCode") || null,
    city: formData.get("city") || null,
    dutyStationRef: formData.get("dutyStationRef") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgLocalityRule({
    organizationId,
    userId,
    code: data.code,
    name: data.name,
    localityType: data.localityType,
    effectiveDate: data.effectiveDate,
    adjustmentPercent: data.adjustmentPercent ?? null,
    areaRef: data.areaRef ?? null,
    regionCode: data.regionCode ?? null,
    countryCode: data.countryCode ?? null,
    city: data.city ?? null,
    dutyStationRef: data.dutyStationRef ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, localityRuleId: result.localityRuleId }
}

export async function createGpgAdjustmentReferenceAction(
  _prev: CreateGpgAdjustmentReferenceFormState | undefined,
  formData: FormData
): Promise<CreateGpgAdjustmentReferenceFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const localityRaw = formData.get("localityRuleId")
  const parsed = createGpgAdjustmentReferenceFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    adjustmentType: formData.get("adjustmentType"),
    effectiveDate: formData.get("effectiveDate"),
    localityRuleId:
      typeof localityRaw === "string" && localityRaw ? localityRaw : null,
    amount: formData.get("amount") || null,
    percent: formData.get("percent") || null,
    currencyCode: formData.get("currencyCode") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgAdjustmentReference({
    organizationId,
    userId,
    employeeId: data.employeeId,
    adjustmentType: data.adjustmentType,
    effectiveDate: data.effectiveDate,
    localityRuleId: data.localityRuleId ?? null,
    amount: data.amount ?? null,
    percent: data.percent ?? null,
    currencyCode: data.currencyCode ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, adjustmentReferenceId: result.adjustmentReferenceId }
}
