"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { FhcVerificationActionState } from "@afenda/feature-hrm-core/shared"
import {
  rejectFhcVerificationReview,
  verifyFhcVerificationReview,
} from "../data/fhc-verification.server"
import {
  rejectFhcVerificationFormSchema,
  verifyFhcVerificationFormSchema,
} from "../schemas/fhc.schema"

async function requireFhcVerifyPermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to verify food handler compliance records.",
    })
  }
  return null
}

export async function verifyFhcVerificationAction(
  _prev: FhcVerificationActionState | undefined,
  formData: FormData
): Promise<FhcVerificationActionState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireFhcVerifyPermission({ organizationId, userId })
  if (denied) return denied

  const parsed = verifyFhcVerificationFormSchema.safeParse({
    reviewId: formData.get("reviewId"),
    obligationId: formData.get("obligationId") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await verifyFhcVerificationReview({
    organizationId,
    userId,
    reviewId: parsed.data.reviewId,
    obligationId: parsed.data.obligationId ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true }
}

export async function rejectFhcVerificationAction(
  _prev: FhcVerificationActionState | undefined,
  formData: FormData
): Promise<FhcVerificationActionState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireFhcVerifyPermission({ organizationId, userId })
  if (denied) return denied

  const parsed = rejectFhcVerificationFormSchema.safeParse({
    reviewId: formData.get("reviewId"),
    obligationId: formData.get("obligationId") || null,
    rejectedReason: formData.get("rejectedReason"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await rejectFhcVerificationReview({
    organizationId,
    userId,
    reviewId: parsed.data.reviewId,
    obligationId: parsed.data.obligationId ?? null,
    rejectedReason: parsed.data.rejectedReason,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true }
}
