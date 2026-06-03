import {
  listHrTimeClockValidatedPunchesForLamWindow,
} from "@afenda/db";

export type HrTimeClockOvertimeRefRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  workDate: Date;
  workHours: number;
  punchSpanLabel: string;
  exposureStatus: string;
};

/** HRM-TCI-022 — derive work-hour references from validated clock-in/out pairs. */
export async function listHrTimeClockOvertimeReferenceRows(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}): Promise<readonly HrTimeClockOvertimeRefRow[]> {
  const window = await listHrTimeClockValidatedPunchesForLamWindow({
    organizationId: input.organizationId,
    limit: input.limit ?? 100,
    search: input.search,
  });

  const byEmployeeDay = new Map<
    string,
    {
      employeeId: string;
      employeeNumber: string;
      employeeDisplayName: string;
      workDate: Date;
      punches: Date[];
    }
  >();

  for (const row of window.rows) {
    const key = `${row.employeeId}:${row.workDate.toISOString()}`;
    const bucket = byEmployeeDay.get(key) ?? {
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      workDate: row.workDate,
      punches: [],
    };
    bucket.punches.push(row.punchedAt);
    byEmployeeDay.set(key, bucket);
  }

  return [...byEmployeeDay.values()].map((bucket) => {
    const sorted = [...bucket.punches].sort(
      (left, right) => left.getTime() - right.getTime(),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1] ?? first;
    const workHours =
      first && last
        ? Math.max(0, (last.getTime() - first.getTime()) / 3_600_000)
        : 0;

    return {
      id: `${bucket.employeeId}:${bucket.workDate.toISOString()}`,
      employeeId: bucket.employeeId,
      employeeNumber: bucket.employeeNumber,
      employeeDisplayName: bucket.employeeDisplayName,
      workDate: bucket.workDate,
      workHours,
      punchSpanLabel:
        first && last
          ? `${first.toISOString()} → ${last.toISOString()}`
          : "—",
      exposureStatus: workHours > 0 ? "ot_reference_ready" : "insufficient_punches",
    };
  });
}
