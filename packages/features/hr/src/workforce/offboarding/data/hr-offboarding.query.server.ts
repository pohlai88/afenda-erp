import { listHrOffboardingCasesWindow } from "@afenda/db";
import type {
  HrOffboardingCaseRow,
  HrOffboardingCaseWindow,
} from "../contracts/hr-offboarding.contract";

export async function listHrOffboardingCases(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrOffboardingCaseRow["status"];
}): Promise<HrOffboardingCaseWindow> {
  const window = await listHrOffboardingCasesWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      status: row.status,
      priorEmploymentStatus: row.priorEmploymentStatus,
      reason: row.reason,
      lastWorkingDate: row.lastWorkingDate,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      cancelledAt: row.cancelledAt,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}
