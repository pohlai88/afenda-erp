"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  CreateGpgClassificationFormState,
  CreateGpgPayBandFormState,
  CreateGpgPayGradeFormState,
  CreateGpgSalaryTableRowFormState,
  CreateGpgSalaryTableVersionFormState,
  PublishGpgSalaryTableVersionFormState,
} from "../../../_core/shared"
import { createGpgClassification } from "../data/gpg-classifications.server"
import {
  createGpgPayBand,
  createGpgPayGrade,
} from "../data/gpg-pay-structure.server"
import {
  addGpgSalaryTableRow,
  createGpgSalaryTableVersion,
  publishGpgSalaryTableVersion,
} from "../data/gpg-salary-tables.server"
import {
  createGpgClassificationFormSchema,
  createGpgPayBandFormSchema,
  createGpgPayGradeFormSchema,
  createGpgSalaryTableRowFormSchema,
  createGpgSalaryTableVersionFormSchema,
  publishGpgSalaryTableVersionFormSchema,
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

export async function createGpgClassificationAction(
  _prev: CreateGpgClassificationFormState | undefined,
  formData: FormData
): Promise<CreateGpgClassificationFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgClassificationFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    scheme: formData.get("scheme"),
    effectiveDate: formData.get("effectiveDate"),
    occupationalGroup: formData.get("occupationalGroup") || null,
    jobSeries: formData.get("jobSeries") || null,
    jobFamily: formData.get("jobFamily") || null,
    agencyRef: formData.get("agencyRef") || null,
    departmentRef: formData.get("departmentRef") || null,
    positionRef: formData.get("positionRef") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgClassification({
    organizationId,
    userId,
    code: data.code,
    name: data.name,
    scheme: data.scheme,
    effectiveDate: data.effectiveDate,
    occupationalGroup: data.occupationalGroup ?? null,
    jobSeries: data.jobSeries ?? null,
    jobFamily: data.jobFamily ?? null,
    agencyRef: data.agencyRef ?? null,
    departmentRef: data.departmentRef ?? null,
    positionRef: data.positionRef ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, classificationId: result.classificationId }
}

export async function createGpgPayGradeAction(
  _prev: CreateGpgPayGradeFormState | undefined,
  formData: FormData
): Promise<CreateGpgPayGradeFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgPayGradeFormSchema.safeParse({
    classificationId: formData.get("classificationId"),
    code: formData.get("code"),
    name: formData.get("name"),
    effectiveDate: formData.get("effectiveDate"),
    gsEquivalent: formData.get("gsEquivalent") || null,
    sesEquivalent: formData.get("sesEquivalent") || null,
    civilServiceGradeRef: formData.get("civilServiceGradeRef") || null,
    rankEquivalent: formData.get("rankEquivalent") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgPayGrade({
    organizationId,
    userId,
    classificationId: data.classificationId,
    code: data.code,
    name: data.name,
    effectiveDate: data.effectiveDate,
    gsEquivalent: data.gsEquivalent ?? null,
    sesEquivalent: data.sesEquivalent ?? null,
    civilServiceGradeRef: data.civilServiceGradeRef ?? null,
    rankEquivalent: data.rankEquivalent ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, payGradeId: result.payGradeId }
}

export async function createGpgPayBandAction(
  _prev: CreateGpgPayBandFormState | undefined,
  formData: FormData
): Promise<CreateGpgPayBandFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgPayBandFormSchema.safeParse({
    payGradeId: formData.get("payGradeId"),
    code: formData.get("code"),
    name: formData.get("name"),
    effectiveDate: formData.get("effectiveDate"),
    minRate: formData.get("minRate") || null,
    maxRate: formData.get("maxRate") || null,
    currencyCode: formData.get("currencyCode") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgPayBand({
    organizationId,
    userId,
    payGradeId: data.payGradeId,
    code: data.code,
    name: data.name,
    effectiveDate: data.effectiveDate,
    minRate: data.minRate ?? null,
    maxRate: data.maxRate ?? null,
    currencyCode: data.currencyCode ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, payBandId: result.payBandId }
}

export async function createGpgSalaryTableVersionAction(
  _prev: CreateGpgSalaryTableVersionFormState | undefined,
  formData: FormData
): Promise<CreateGpgSalaryTableVersionFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgSalaryTableVersionFormSchema.safeParse({
    code: formData.get("code"),
    effectiveDate: formData.get("effectiveDate"),
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createGpgSalaryTableVersion({
    organizationId,
    userId,
    ...parsed.data,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, tableVersionId: result.tableVersionId }
}

export async function createGpgSalaryTableRowAction(
  _prev: CreateGpgSalaryTableRowFormState | undefined,
  formData: FormData
): Promise<CreateGpgSalaryTableRowFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgSalaryTableRowFormSchema.safeParse({
    tableVersionId: formData.get("tableVersionId"),
    payGradeId: formData.get("payGradeId"),
    step: formData.get("step"),
    baseRate: formData.get("baseRate"),
    minRate: formData.get("minRate") || null,
    maxRate: formData.get("maxRate") || null,
    currencyCode: formData.get("currencyCode") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await addGpgSalaryTableRow({
    organizationId,
    userId,
    tableVersionId: data.tableVersionId,
    payGradeId: data.payGradeId,
    step: data.step,
    baseRate: data.baseRate,
    minRate: data.minRate ?? null,
    maxRate: data.maxRate ?? null,
    currencyCode: data.currencyCode ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, rowId: result.rowId }
}

export async function publishGpgSalaryTableVersionAction(
  _prev: PublishGpgSalaryTableVersionFormState | undefined,
  formData: FormData
): Promise<PublishGpgSalaryTableVersionFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = publishGpgSalaryTableVersionFormSchema.safeParse({
    tableVersionId: formData.get("tableVersionId"),
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await publishGpgSalaryTableVersion({
    organizationId,
    userId,
    tableVersionId: parsed.data.tableVersionId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true }
}
