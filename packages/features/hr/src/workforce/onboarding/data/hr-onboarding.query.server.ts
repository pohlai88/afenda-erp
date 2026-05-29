import { listHrOnboardingCasesWindow } from "@afenda/db";
import type {
  HrOnboardingCaseRow,
  HrOnboardingCaseWindow,
} from "../contracts/hr-onboarding.contract";

export async function listHrOnboardingCases(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrOnboardingCaseRow["status"];
}): Promise<HrOnboardingCaseWindow> {
  const window = await listHrOnboardingCasesWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      status: row.status,
      priorEmploymentStatus: row.priorEmploymentStatus,
      targetStatus: row.targetStatus,
      reason: row.reason,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      cancelledAt: row.cancelledAt,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}
