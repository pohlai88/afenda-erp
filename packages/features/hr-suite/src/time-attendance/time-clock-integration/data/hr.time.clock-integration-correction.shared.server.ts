import {
  createHrTimeClockCorrectionPunch,
  HrTimeClockCommandError,
  type HrTimeClockPunchType,
} from "@afenda/db";

import type { SubmitHrTimeClockCorrectionInput } from "../schemas/hr.time.clock-integration-correction.schema";

export { HrTimeClockCommandError };

/** HRM-TCI-024 — correction punch for invalid/missing/duplicate/unmatched raw punches. */
export async function submitHrTimeClockCorrectionCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: SubmitHrTimeClockCorrectionInput;
}) {
  return createHrTimeClockCorrectionPunch({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    originalRawPunchId: input.payload.originalRawPunchId,
    punchType: input.payload.punchType as Exclude<
      HrTimeClockPunchType,
      "correction" | "transfer"
    >,
    punchedAt: input.payload.punchedAt,
    reason: input.payload.reason,
    policyGroupCode: input.payload.policyGroupCode,
  });
}
