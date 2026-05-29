"use server"

import { and, eq } from "drizzle-orm"

import { requireOrgSession } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmFhcFoodHandlerPermit,
  hrmFhcHealthCertificate,
} from "@afenda/platform/db/schema"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { LinkFhcEvidenceFormState } from "@afenda/feature-hrm-core/shared"
import {
  linkFhcEvidenceDocument,
  listFhcEvidenceLinksForSubject,
} from "../data/fhc-evidence.server"
import { linkFhcEvidenceFormSchema } from "../schemas/fhc.schema"

async function requireFhcUpdatePermission(input: {
  organizationId: string
  userId: string
  errorMessage: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: input.errorMessage })
  }
  return null
}

async function resolveEvidenceSubject(input: {
  organizationId: string
  obligationId: string
  subjectKind: "permit" | "health_certificate"
}): Promise<
  | { ok: true; employeeId: string; subjectId: string }
  | { ok: false; form: string }
> {
  if (input.subjectKind === "permit") {
    const permit = await db.query.hrmFhcFoodHandlerPermit.findFirst({
      where: and(
        eq(hrmFhcFoodHandlerPermit.organizationId, input.organizationId),
        eq(hrmFhcFoodHandlerPermit.obligationId, input.obligationId)
      ),
      columns: { id: true, employeeId: true },
    })
    if (!permit) {
      return { ok: false, form: "Submit a permit before linking evidence." }
    }
    return { ok: true, employeeId: permit.employeeId, subjectId: permit.id }
  }

  const health = await db.query.hrmFhcHealthCertificate.findFirst({
    where: and(
      eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
      eq(hrmFhcHealthCertificate.obligationId, input.obligationId)
    ),
    columns: { id: true, employeeId: true },
  })
  if (!health) {
    return {
      ok: false,
      form: "Submit a health certificate before linking evidence.",
    }
  }
  return { ok: true, employeeId: health.employeeId, subjectId: health.id }
}

export async function linkFhcEvidenceFormAction(
  _prev: LinkFhcEvidenceFormState | undefined,
  formData: FormData
): Promise<LinkFhcEvidenceFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireFhcUpdatePermission({
    organizationId,
    userId,
    errorMessage: "You are not authorized to link compliance evidence.",
  })
  if (denied) return denied

  const parsed = linkFhcEvidenceFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    subjectKind: formData.get("subjectKind"),
    documentId: formData.get("documentId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const subject = await resolveEvidenceSubject({
    organizationId,
    obligationId: parsed.data.obligationId,
    subjectKind: parsed.data.subjectKind,
  })
  if (!subject.ok) {
    return hrmActionFailure({ form: subject.form })
  }

  const result = await linkFhcEvidenceDocument({
    organizationId,
    userId,
    employeeId: subject.employeeId,
    subjectKind: parsed.data.subjectKind,
    subjectId: subject.subjectId,
    documentId: parsed.data.documentId,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  const links = await listFhcEvidenceLinksForSubject({
    organizationId,
    subjectKind: parsed.data.subjectKind,
    subjectId: subject.subjectId,
  })

  return { ok: true, linkId: result.linkId, linkCount: links.length }
}
