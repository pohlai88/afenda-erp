import { listHrTimeClockFailedSyncAlerts } from "@afenda/db";

export type HrTimeClockSyncAlert = {
  id: string;
  deviceId: string;
  deviceName: string;
  locationCode: string | null;
  batchKey: string;
  startedAt: Date;
  errorMessage: string | null;
  summary: string;
};

/** HRM-TCI-026 — failed sync batches surfaced as administrator alerts. */
export async function listHrTimeClockSyncAlerts(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrTimeClockSyncAlert[]> {
  const rows = await listHrTimeClockFailedSyncAlerts(input);

  return rows.map((row) => ({
    ...row,
    summary: row.errorMessage
      ? `${row.deviceName}: ${row.errorMessage}`
      : `${row.deviceName} sync failed (${row.batchKey})`,
  }));
}
