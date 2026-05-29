import { listHrLifecycleEventsForEmployee } from "@afenda/db";
import type { HrLifecycleEventRow } from "../contracts/hr-lifecycle-event.contract";

export async function listHrEmployeeLifecycleEvents(input: {
  organizationId: string;
  employeeId: string;
  limit?: number;
}): Promise<readonly HrLifecycleEventRow[]> {
  const rows = await listHrLifecycleEventsForEmployee(input);

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    previousStatus: row.previousStatus,
    newStatus: row.newStatus,
    effectiveDate: row.effectiveDate,
    reason: row.reason,
    approvalReference: row.approvalReference,
    createdAt: row.createdAt,
  }));
}
