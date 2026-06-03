import {
  getHrEmployeeLifecycleSnapshot,
  type HrEmploymentStatus,
} from "@afenda/db";

/** HRM-LCY-027 — read-only lifecycle snapshot for cross-module consumers. */
export async function resolveHrEmployeeLifecycleStage(input: {
  organizationId: string;
  employeeId: string;
}): Promise<{
  employeeId: string;
  employmentStatus: HrEmploymentStatus;
  probationEndDate: Date | null;
  confirmationDate: Date | null;
} | null> {
  return getHrEmployeeLifecycleSnapshot(input);
}
