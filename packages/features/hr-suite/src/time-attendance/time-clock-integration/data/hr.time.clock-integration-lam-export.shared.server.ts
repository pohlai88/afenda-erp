export { listHrTimeClockValidatedPunchesForLamWindow } from "@afenda/db";

import { listHrTimeClockValidatedPunchesForLamWindow } from "@afenda/db";

/** HRM-TCI-021 — validated punch exposure for Leave & Attendance Management. */
export async function loadHrTimeClockLamExportWindow(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}) {
  return listHrTimeClockValidatedPunchesForLamWindow({
    organizationId: input.organizationId,
    limit: input.limit,
    search: input.search,
  });
}
