import { listHrLifecycleOverviewWindow } from "@afenda/db";
import type {
  HrLifecycleOverviewRow,
  HrLifecycleOverviewWindow,
} from "../contracts/hr-lifecycle.contract";

export async function listHrLifecycleOverview(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employmentStatus?: HrLifecycleOverviewRow["employmentStatus"];
}): Promise<HrLifecycleOverviewWindow> {
  const window = await listHrLifecycleOverviewWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      employeeNumber: row.employeeNumber,
      displayName: row.displayName,
      employmentStatus: row.employmentStatus,
      stage: row.stage,
      probationEndDate: row.probationEndDate,
      confirmationDate: row.confirmationDate,
      pendingTransitionCount: row.pendingTransitionCount,
      nextEffectiveDate: row.nextEffectiveDate,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}
