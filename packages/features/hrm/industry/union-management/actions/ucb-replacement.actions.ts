"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import {
  createUcbGrievanceStep,
  updateUcbGrievanceStatus,
} from "../data/ucb-grievance.server"
import { upsertUcbSeniorityProfile } from "../data/ucb-seniority.server"
import { createUcbLrMeeting } from "../data/ucb-meetings.server"
import { createUcbRepresentative } from "../data/ucb-representatives.server"
import {
  createGrievanceStepFormSchema,
  createLrMeetingFormSchema,
  createRepresentativeFormSchema,
  type UcbMutationFormState,
  updateGrievanceStatusFormSchema,
  upsertSeniorityFormSchema,
  withUcbNullableFields,
} from "../schemas/ucb.schema"

async function requireUcbManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "union_collective_bargaining",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: "You are not authorized for this action." })
  }
  return null
}

export async function updateUcbGrievanceStatusAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateGrievanceStatusFormSchema.safeParse({
    grievanceId: formData.get("grievanceId"),
    status: formData.get("status"),
    mediationRef: formData.get("mediationRef") || null,
    arbitrationRef: formData.get("arbitrationRef") || null,
    legalMatterRef: formData.get("legalMatterRef") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "mediationRef",
    "arbitrationRef",
    "legalMatterRef",
  ])
  const result = await updateUcbGrievanceStatus({
    organizationId: session.organizationId,
    userId: session.userId,
    grievanceId: data.grievanceId,
    status: data.status,
    mediationRef: data.mediationRef,
    arbitrationRef: data.arbitrationRef,
    legalMatterRef: data.legalMatterRef,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}

export async function createUcbGrievanceStepAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createGrievanceStepFormSchema.safeParse({
    grievanceId: formData.get("grievanceId"),
    stepLevel: formData.get("stepLevel"),
    deadlineAt: formData.get("deadlineAt") || null,
    meetingAt: formData.get("meetingAt") || null,
    decision: formData.get("decision") || null,
    escalationLevel: formData.get("escalationLevel") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "deadlineAt",
    "meetingAt",
    "decision",
    "escalationLevel",
    "notes",
  ])
  const result = await createUcbGrievanceStep({
    organizationId: session.organizationId,
    userId: session.userId,
    grievanceId: data.grievanceId,
    stepLevel: data.stepLevel,
    deadlineAt: data.deadlineAt,
    meetingAt: data.meetingAt,
    decision: data.decision,
    escalationLevel: data.escalationLevel,
    notes: data.notes,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.stepId }
}

export async function upsertUcbSeniorityAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = upsertSeniorityFormSchema.safeParse({
    membershipId: formData.get("membershipId"),
    seniorityDate: formData.get("seniorityDate"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await upsertUcbSeniorityProfile({
    organizationId: session.organizationId,
    userId: session.userId,
    ...parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.seniorityProfileId }
}

export async function createUcbRepresentativeAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createRepresentativeFormSchema.safeParse({
    unionId: formData.get("unionId"),
    employeeId: formData.get("employeeId") || null,
    roleKind: formData.get("roleKind"),
    departmentRef: formData.get("departmentRef") || null,
    siteRef: formData.get("siteRef") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "employeeId",
    "departmentRef",
    "siteRef",
  ])
  const result = await createUcbRepresentative({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.representativeId }
}

export async function createUcbLrMeetingAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createLrMeetingFormSchema.safeParse({
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, ["scheduledAt"])
  const result = await createUcbLrMeeting({
    organizationId: session.organizationId,
    userId: session.userId,
    title: data.title,
    scheduledAt: data.scheduledAt,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.meetingId }
}
