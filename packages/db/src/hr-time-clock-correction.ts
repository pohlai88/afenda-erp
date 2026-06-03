import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { appendHrTimeClockAuditEvent } from "./hr-time-clock-devices";
import { HrTimeClockCommandError } from "./hr-time-clock.types";
import { runHrTimeClockPunchValidationPipeline } from "./hr-time-clock-validation";
import type { HrTimeClockPunchType } from "./hr-time-clock.types";
import { hrTimeClockRawPunches } from "./hr-time-clock";

export type CreateHrTimeClockCorrectionPunchInput = {
  organizationId: string;
  actorAuthUserId: string;
  originalRawPunchId: string;
  punchType: Exclude<HrTimeClockPunchType, "correction" | "transfer">;
  punchedAt: Date;
  reason: string;
  policyGroupCode?: string;
};

/** HRM-TCI-024 — authorized correction punch linked to the original raw record. */
export async function createHrTimeClockCorrectionPunch(
  input: CreateHrTimeClockCorrectionPunchInput,
): Promise<{
  correctionRawPunchId: string;
  validation: Awaited<ReturnType<typeof runHrTimeClockPunchValidationPipeline>>;
}> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [original] = await db
      .select()
      .from(hrTimeClockRawPunches)
      .where(
        and(
          eq(hrTimeClockRawPunches.organizationId, input.organizationId),
          eq(hrTimeClockRawPunches.id, input.originalRawPunchId),
        ),
      )
      .limit(1);

    if (!original) {
      throw new HrTimeClockCommandError("raw_punch_not_found");
    }

    if (original.punchType === "correction") {
      throw new HrTimeClockCommandError("correction_not_allowed");
    }

    const correctionRawPunchId = createEntityId("hr_tclk_raw");
    const idempotencyKey = `correction:${input.originalRawPunchId}:${correctionRawPunchId}`;

    await db.insert(hrTimeClockRawPunches).values({
      id: correctionRawPunchId,
      organizationId: input.organizationId,
      deviceId: original.deviceId,
      mappingId: original.mappingId,
      employeeId: original.employeeId,
      punchType: "correction",
      punchedAt: input.punchedAt,
      source: "correction",
      idempotencyKey,
      validationStatus: "pending",
      rawPayload: {
        correctedRawPunchId: input.originalRawPunchId,
        correctedPunchType: input.punchType,
        reason: input.reason.trim(),
        actorAuthUserId: input.actorAuthUserId,
      },
    });

    await appendHrTimeClockAuditEvent({
      organizationId: input.organizationId,
      action: "punch_captured",
      summary: "Time clock correction punch captured",
      actorAuthUserId: input.actorAuthUserId,
      rawPunchId: correctionRawPunchId,
      employeeId: original.employeeId,
      deviceId: original.deviceId,
      metadata: {
        originalRawPunchId: input.originalRawPunchId,
        punchType: input.punchType,
      },
    });

    const validation = await runHrTimeClockPunchValidationPipeline({
      organizationId: input.organizationId,
      rawPunchId: correctionRawPunchId,
      policyGroupCode: input.policyGroupCode,
      actorAuthUserId: input.actorAuthUserId,
    });

    return { correctionRawPunchId, validation };
  });
}
