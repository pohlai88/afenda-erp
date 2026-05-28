"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { LinkMscEvidenceFormState } from "../data/msc-form-state.shared"
import { linkMscEvidenceDocument } from "../data/msc-evidence.server"
import { linkMscEvidenceFormSchema } from "../schemas/msc.schema"

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return null
  return raw
}

export async function linkMscEvidenceFormAction(
  _prev: LinkMscEvidenceFormState | undefined,
  formData: FormData
): Promise<LinkMscEvidenceFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to link manufacturing safety evidence.",
    })
  }

  const parsed = linkMscEvidenceFormSchema.safeParse({
    employeeId: parseOptionalUuid(formData.get("employeeId")),
    subjectKind: formData.get("subjectKind"),
    subjectId: formData.get("subjectId"),
    documentId: formData.get("documentId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await linkMscEvidenceDocument({
    organizationId,
    userId,
    employeeId: parsed.data.employeeId ?? null,
    subjectKind: parsed.data.subjectKind,
    subjectId: parsed.data.subjectId,
    documentId: parsed.data.documentId,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, linkId: result.linkId }
}
