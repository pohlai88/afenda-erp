"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { ResolveFrmExceptionFormState } from "@afenda/feature-hrm-core/shared"
import { resolveFrmFieldException } from "../data/frm-exceptions.server"
import { resolveFrmExceptionFormSchema } from "../schemas/frm.schema"

export async function resolveFrmExceptionAction(
  _prev: ResolveFrmExceptionFormState | undefined,
  formData: FormData
): Promise<ResolveFrmExceptionFormState> {
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
      form: "You are not authorized to resolve field exceptions.",
    })
  }

  const parsed = resolveFrmExceptionFormSchema.safeParse({
    exceptionId: formData.get("exceptionId"),
    correctionRef: formData.get("correctionRef") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await resolveFrmFieldException({
    organizationId,
    userId,
    exceptionId: parsed.data.exceptionId,
    correctionRef: parsed.data.correctionRef ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true }
}
