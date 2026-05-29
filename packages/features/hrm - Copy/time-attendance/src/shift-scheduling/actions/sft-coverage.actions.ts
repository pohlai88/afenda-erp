"use server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmShiftCoverageRequirement } from "@afenda/platform/db/schema"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { SftCoverageFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_SFT_AUDIT } from "../sft.contract"
import { createCoverageRequirementSchema } from "../schemas/sft.schema"
import { revalidateSftSurfaces } from "../data/sft-revalidate.server"

export async function createCoverageRequirementAction(
  _prev: SftCoverageFormState | undefined,
  formData: FormData
): Promise<SftCoverageFormState> {
  const gate = await requireHrmPermission({
    object: "shift_schedule",
    function: "create",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { session } = gate

  const parsed = createCoverageRequirementSchema.safeParse({
    attendanceDate: formData.get("attendanceDate"),
    shiftTemplateId: formData.get("shiftTemplateId"),
    minHeadcount: formData.get("minHeadcount"),
    departmentId: formData.get("departmentId") || null,
    locationCode: formData.get("locationCode") || null,
    requiredSkillId: formData.get("requiredSkillId") || null,
    requiredPositionId: formData.get("requiredPositionId") || null,
    requiredTrainingCourseId: formData.get("requiredTrainingCourseId") || null,
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      attendanceDate: flat.attendanceDate?.[0],
      shiftTemplateId: flat.shiftTemplateId?.[0],
      minHeadcount: flat.minHeadcount?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const requirementId = crypto.randomUUID()
  await db.insert(hrmShiftCoverageRequirement).values({
    id: requirementId,
    organizationId: session.organizationId,
    attendanceDate: parsed.data.attendanceDate,
    shiftTemplateId: parsed.data.shiftTemplateId,
    minHeadcount: parsed.data.minHeadcount,
    departmentId: parsed.data.departmentId ?? null,
    locationCode: parsed.data.locationCode ?? null,
    requiredSkillId: parsed.data.requiredSkillId ?? null,
    requiredPositionId: parsed.data.requiredPositionId ?? null,
    requiredTrainingCourseId: parsed.data.requiredTrainingCourseId ?? null,
    createdByUserId: session.userId,
    updatedByUserId: session.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SFT_AUDIT.coverageCreate,
    actorUserId: session.userId,
    actorSessionId: session.sessionId,
    organizationId: session.organizationId,
    resourceType: "hrm_shift_coverage_requirement",
    resourceId: requirementId,
    metadata: {
      attendanceDate: parsed.data.attendanceDate,
      shiftTemplateId: parsed.data.shiftTemplateId,
      minHeadcount: parsed.data.minHeadcount,
    },
  })

  revalidateSftSurfaces()
  return { ok: true, requirementId }
}
