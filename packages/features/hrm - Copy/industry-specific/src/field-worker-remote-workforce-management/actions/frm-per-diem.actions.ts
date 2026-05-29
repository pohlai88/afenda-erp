"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  ApproveFrmPerDiemFormState,
  CreateFrmPerDiemRateFormState,
} from "@afenda/feature-hrm-core/shared"
import {
  approveFrmPerDiemReference,
  createFrmPerDiemRate,
} from "../data/frm-travel.server"
import {
  approveFrmPerDiemFormSchema,
  createFrmPerDiemRateFormSchema,
} from "../schemas/frm.schema"

export async function createFrmPerDiemRateAction(
  _prev: CreateFrmPerDiemRateFormState | undefined,
  formData: FormData
): Promise<CreateFrmPerDiemRateFormState> {
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
      form: "You are not authorized to manage per diem rates.",
    })
  }

  const travelClassRaw = formData.get("travelClass")
  const parsed = createFrmPerDiemRateFormSchema.safeParse({
    code: formData.get("code"),
    countryCode: formData.get("countryCode") || null,
    city: formData.get("city") || null,
    travelClass:
      typeof travelClassRaw === "string" && travelClassRaw.length > 0
        ? travelClassRaw
        : null,
    fullDayAmount: formData.get("fullDayAmount"),
    currencyCode: formData.get("currencyCode") || "MYR",
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createFrmPerDiemRate({
    organizationId,
    userId,
    code: parsed.data.code,
    countryCode: parsed.data.countryCode ?? null,
    city: parsed.data.city ?? null,
    travelClass: parsed.data.travelClass ?? null,
    fullDayAmount: parsed.data.fullDayAmount,
    currencyCode: parsed.data.currencyCode ?? "MYR",
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, rateId: result.rateId }
}

export async function approveFrmPerDiemReferenceAction(
  _prev: ApproveFrmPerDiemFormState | undefined,
  formData: FormData
): Promise<ApproveFrmPerDiemFormState> {
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
      form: "You are not authorized to approve per diem references.",
    })
  }

  const parsed = approveFrmPerDiemFormSchema.safeParse({
    travelStatusId: formData.get("travelStatusId"),
    eligibilityDate: formData.get("eligibilityDate"),
    employeeCategoryRef: formData.get("employeeCategoryRef") || null,
    policyGroupRef: formData.get("policyGroupRef") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await approveFrmPerDiemReference({
    organizationId,
    userId,
    travelStatusId: parsed.data.travelStatusId,
    eligibilityDate: parsed.data.eligibilityDate,
    employeeCategoryRef: parsed.data.employeeCategoryRef ?? null,
    policyGroupRef: parsed.data.policyGroupRef ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, referenceId: result.referenceId }
}
