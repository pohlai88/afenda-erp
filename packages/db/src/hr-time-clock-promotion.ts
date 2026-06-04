import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { recordHrAttendancePunch } from "./hr-attendance";
import { appendHrTimeClockAuditEvent } from "./hr-time-clock-devices";
import { HrTimeClockCommandError } from "./hr-time-clock.types";
import { hrTimeClockRawPunches } from "./dbx-hr-time-clock";
import type { HrTimeClockPunchType } from "./hr-time-clock.types";

const PROMOTABLE_PUNCH_TYPES = new Set<HrTimeClockPunchType>([
  "clock_in",
  "clock_out",
  "break_in",
  "break_out",
]);

const LAM_PUNCH_TYPE_MAP: Record<
  "clock_in" | "clock_out" | "break_in" | "break_out",
  "clock_in" | "clock_out"
> = {
  clock_in: "clock_in",
  clock_out: "clock_out",
  break_in: "clock_in",
  break_out: "clock_out",
};

/** HRM-TCI-029/021 — promote validated raw punches to LAM attendance records (idempotent). */
export async function promoteValidatedHrTimeClockPunchToLam(input: {
  organizationId: string;
  rawPunchId: string;
  actorAuthUserId: string;
}): Promise<{ lamAttendanceRecordId: string; created: boolean }> {
  const raw = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select()
        .from(hrTimeClockRawPunches)
        .where(
          and(
            eq(hrTimeClockRawPunches.organizationId, input.organizationId),
            eq(hrTimeClockRawPunches.id, input.rawPunchId),
          ),
        )
        .limit(1);
      return row ?? null;
    },
  );

  if (!raw) {
    throw new HrTimeClockCommandError("raw_punch_not_found");
  }

  if (raw.validationStatus !== "valid") {
    throw new HrTimeClockCommandError("punch_not_promotable");
  }

  if (!raw.employeeId) {
    throw new HrTimeClockCommandError("punch_not_promotable");
  }

  const effectiveType =
    raw.punchType === "correction"
      ? (typeof raw.rawPayload?.correctedPunchType === "string"
          ? raw.rawPayload.correctedPunchType
          : null)
      : raw.punchType;

  if (
    !effectiveType ||
    !PROMOTABLE_PUNCH_TYPES.has(effectiveType as HrTimeClockPunchType)
  ) {
    throw new HrTimeClockCommandError("punch_not_promotable");
  }

  const lamPunchType =
    LAM_PUNCH_TYPE_MAP[
      effectiveType as keyof typeof LAM_PUNCH_TYPE_MAP
    ];

  const idempotencyKey = `time_clock:${raw.id}`;
  const result = await recordHrAttendancePunch({
    organizationId: input.organizationId,
    employeeId: raw.employeeId,
    punchType: lamPunchType,
    punchedAt: raw.punchedAt,
    source: "time_clock",
    idempotencyKey,
    notes: `time_clock_raw:${raw.id}`,
  });

  await appendHrTimeClockAuditEvent({
    organizationId: input.organizationId,
    action: "punch_captured",
    summary: "Validated time clock punch promoted to attendance",
    actorAuthUserId: input.actorAuthUserId,
    rawPunchId: raw.id,
    employeeId: raw.employeeId,
    deviceId: raw.deviceId,
    metadata: {
      lamAttendanceRecordId: result.recordId,
      created: result.created,
    },
  });

  return {
    lamAttendanceRecordId: result.recordId,
    created: result.created,
  };
}

