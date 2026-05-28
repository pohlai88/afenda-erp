"use server"

import { hrmActionFailure } from "../../../_core/governance"
import { requireTimeClockExceptionDecisionPermission } from "../data/tci-correction-access.server"
import { decideTimeClockPunchException } from "../data/tci-exception-commands.server"
import { timeClockExceptionDecisionFormSchema } from "../schemas/tci.schema"
import type { TimeClockExceptionDecisionFormState } from "../tci-action-state.shared"

export async function decideTimeClockPunchExceptionAction(
  _prev: TimeClockExceptionDecisionFormState | undefined,
  formData: FormData
): Promise<TimeClockExceptionDecisionFormState> {
  const gate = await requireTimeClockExceptionDecisionPermission()
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { organizationId, userId, sessionId } = gate.session

  const parsed = timeClockExceptionDecisionFormSchema.safeParse({
    exceptionId: formData.get("exceptionId"),
    decision: formData.get("decision"),
    decisionReason: formData.get("decisionReason") || undefined,
  })
  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message ?? "Invalid decision.",
    })
  }

  return decideTimeClockPunchException(
    { organizationId, userId, sessionId },
    parsed.data
  )
}
