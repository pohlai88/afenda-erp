"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  CreateMscCorrectiveFormState,
  CreateMscHazardFormState,
  CreateMscIncidentFormState,
} from "../data/msc-form-state.shared"
import {
  createMscCorrectiveAction,
  createMscHazardAssessment,
  createMscIncident,
} from "../data/msc-operational.server"
import {
  createMscCorrectiveFormSchema,
  createMscHazardFormSchema,
  createMscIncidentFormSchema,
} from "../schemas/msc.schema"

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return null
  return raw
}

async function requireMscUpdatePermission(input: {
  organizationId: string
  userId: string
  errorMessage: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: input.errorMessage })
  }
  return null
}

export async function createMscHazardFormAction(
  _prev: CreateMscHazardFormState | undefined,
  formData: FormData
): Promise<CreateMscHazardFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to create manufacturing safety hazard assessments.",
  })
  if (denied) return denied

  const parsed = createMscHazardFormSchema.safeParse({
    siteId: parseOptionalUuid(formData.get("siteId")),
    assessmentType: formData.get("assessmentType"),
    title: formData.get("title"),
    taskDescription: formData.get("taskDescription") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createMscHazardAssessment({
    organizationId,
    userId,
    siteId: parsed.data.siteId ?? null,
    assessmentType: parsed.data.assessmentType,
    title: parsed.data.title,
    taskDescription: parsed.data.taskDescription ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, assessmentId: result.assessmentId }
}

export async function createMscIncidentFormAction(
  _prev: CreateMscIncidentFormState | undefined,
  formData: FormData
): Promise<CreateMscIncidentFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to report manufacturing safety incidents.",
  })
  if (denied) return denied

  const parsed = createMscIncidentFormSchema.safeParse({
    siteId: parseOptionalUuid(formData.get("siteId")),
    employeeId: parseOptionalUuid(formData.get("employeeId")),
    incidentDate: formData.get("incidentDate"),
    incidentType: formData.get("incidentType"),
    severity: formData.get("severity") || null,
    description: formData.get("description") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createMscIncident({
    organizationId,
    userId,
    siteId: parsed.data.siteId ?? null,
    employeeId: parsed.data.employeeId ?? null,
    incidentDate: parsed.data.incidentDate,
    incidentType: parsed.data.incidentType,
    severity: parsed.data.severity ?? null,
    description: parsed.data.description ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, incidentId: result.incidentId }
}

export async function createMscCorrectiveFormAction(
  _prev: CreateMscCorrectiveFormState | undefined,
  formData: FormData
): Promise<CreateMscCorrectiveFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to create manufacturing safety corrective actions.",
  })
  if (denied) return denied

  const parsed = createMscCorrectiveFormSchema.safeParse({
    sourceKind: formData.get("sourceKind"),
    sourceId: formData.get("sourceId"),
    title: formData.get("title"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createMscCorrectiveAction({
    organizationId,
    userId,
    sourceKind: parsed.data.sourceKind,
    sourceId: parsed.data.sourceId,
    title: parsed.data.title,
    priority: parsed.data.priority,
    dueDate: parsed.data.dueDate ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, actionId: result.actionId }
}
