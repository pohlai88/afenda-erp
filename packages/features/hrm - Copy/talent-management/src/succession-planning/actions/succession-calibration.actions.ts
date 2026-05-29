"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  createSuccessionCalibrationSession,
  seedSuccessionCalibrationEntriesFromNominations,
  updateSuccessionCalibrationEntry,
} from "../data/succession-calibration.server"
import {
  createCalibrationSessionFormSchema,
  updateCalibrationEntryFormSchema,
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
      form: "You are not authorized to manage calibration sessions.",
    })
  }
  return null
}

export async function createSuccessionCalibrationSessionAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createCalibrationSessionFormSchema.safeParse({
    title: formData.get("title"),
    sessionDate: formData.get("sessionDate") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, ["sessionDate", "notes"])
  const result = await createSuccessionCalibrationSession({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })

  await seedSuccessionCalibrationEntriesFromNominations({
    organizationId: session.organizationId,
    sessionId: result.sessionId,
  })

  return { ok: true, id: result.sessionId }
}

export async function updateSuccessionCalibrationEntryAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateCalibrationEntryFormSchema.safeParse({
    entryId: formData.get("entryId"),
    outcome: formData.get("outcome"),
    comments: formData.get("comments") || null,
    decisionRef: formData.get("decisionRef") || null,
    gridCell: formData.get("gridCell") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, [
    "comments",
    "decisionRef",
    "gridCell",
  ])
  const result = await updateSuccessionCalibrationEntry({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: parsed.data.entryId }
}
