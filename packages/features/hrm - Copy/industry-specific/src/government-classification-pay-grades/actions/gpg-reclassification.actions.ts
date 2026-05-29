"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  CreateGpgReclassificationRequestFormState,
  DecideGpgReclassificationRequestFormState,
} from "@afenda/feature-hrm-core/shared"
import {
  createGpgReclassificationRequest,
  decideGpgReclassificationRequest,
} from "../data/gpg-reclassification.server"
import {
  createGpgReclassificationRequestFormSchema,
  decideGpgReclassificationRequestFormSchema,
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

export async function createGpgReclassificationRequestAction(
  _prev: CreateGpgReclassificationRequestFormState | undefined,
  formData: FormData
): Promise<CreateGpgReclassificationRequestFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgReclassificationRequestFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    fromClassificationId: formData.get("fromClassificationId") || null,
    toClassificationId: formData.get("toClassificationId"),
    reason: formData.get("reason") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid reclassification request." })
  }

  const result = await createGpgReclassificationRequest({
    organizationId,
    userId,
    employeeId: parsed.data.employeeId,
    fromClassificationId: parsed.data.fromClassificationId ?? null,
    toClassificationId: parsed.data.toClassificationId,
    reason: parsed.data.reason ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, requestId: result.requestId }
}

export async function decideGpgReclassificationRequestAction(
  _prev: DecideGpgReclassificationRequestFormState | undefined,
  formData: FormData
): Promise<DecideGpgReclassificationRequestFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = decideGpgReclassificationRequestFormSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid reclassification decision." })
  }

  const result = await decideGpgReclassificationRequest({
    organizationId,
    userId,
    requestId: parsed.data.requestId,
    decision: parsed.data.decision,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true }
}
