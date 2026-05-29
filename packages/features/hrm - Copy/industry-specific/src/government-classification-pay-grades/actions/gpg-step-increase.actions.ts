"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  CreateGpgStepIncreaseEventFormState,
  CreateGpgStepIncreaseRuleFormState,
  DecideGpgStepIncreaseEventFormState,
  ProcessGpgStepIncreaseAutoBatchFormState,
} from "@afenda/feature-hrm-core/shared"
import {
  createGpgStepIncreaseEvent,
  createGpgStepIncreaseRule,
  decideGpgStepIncreaseEvent,
  processGpgStepIncreaseAutoBatch,
} from "../data/gpg-step-increase.server"
import {
  createGpgStepIncreaseEventFormSchema,
  createGpgStepIncreaseRuleFormSchema,
  decideGpgStepIncreaseEventFormSchema,
  processGpgStepIncreaseAutoBatchFormSchema,
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

export async function createGpgStepIncreaseRuleAction(
  _prev: CreateGpgStepIncreaseRuleFormState | undefined,
  formData: FormData
): Promise<CreateGpgStepIncreaseRuleFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const requiresApprovalRaw = formData.get("requiresApproval")
  const parsed = createGpgStepIncreaseRuleFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    waitingPeriodMonths: formData.get("waitingPeriodMonths"),
    requiresApproval:
      requiresApprovalRaw === "on" || requiresApprovalRaw === "true"
        ? "true"
        : "false",
    minManagerRating: formData.get("minManagerRating") ?? "",
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgStepIncreaseRule({
    organizationId,
    userId,
    code: data.code,
    name: data.name,
    waitingPeriodMonths: data.waitingPeriodMonths,
    requiresApproval: data.requiresApproval,
    minManagerRating: data.minManagerRating,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, ruleId: result.ruleId }
}

export async function createGpgStepIncreaseEventAction(
  _prev: CreateGpgStepIncreaseEventFormState | undefined,
  formData: FormData
): Promise<CreateGpgStepIncreaseEventFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = createGpgStepIncreaseEventFormSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    ruleId: formData.get("ruleId"),
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createGpgStepIncreaseEvent({
    organizationId,
    userId,
    assignmentId: parsed.data.assignmentId,
    ruleId: parsed.data.ruleId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, eventId: result.eventId }
}

export async function decideGpgStepIncreaseEventAction(
  _prev: DecideGpgStepIncreaseEventFormState | undefined,
  formData: FormData
): Promise<DecideGpgStepIncreaseEventFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = decideGpgStepIncreaseEventFormSchema.safeParse({
    eventId: formData.get("eventId"),
    decision: formData.get("decision"),
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await decideGpgStepIncreaseEvent({
    organizationId,
    userId,
    eventId: parsed.data.eventId,
    decision: parsed.data.decision,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true }
}

export async function processGpgStepIncreaseAutoBatchAction(
  _prev: ProcessGpgStepIncreaseAutoBatchFormState | undefined,
  formData: FormData
): Promise<ProcessGpgStepIncreaseAutoBatchFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = processGpgStepIncreaseAutoBatchFormSchema.safeParse({
    confirm: formData.get("confirm"),
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await processGpgStepIncreaseAutoBatch({
    organizationId,
    userId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return {
    ok: true,
    processedCount: result.processedCount,
    skippedCount: result.skippedCount,
  }
}
