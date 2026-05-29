import {
  listHrEmployeeDirectoryWindow,
  type HrEmployeeDirectoryRow as DbHrEmployeeDirectoryRow,
} from "@afenda/db";
import type {
  HrEmployeeDirectoryRow,
  HrEmployeeDirectoryWindow,
} from "../contracts";

function mapEmployeeRow(row: DbHrEmployeeDirectoryRow): HrEmployeeDirectoryRow {
  return {
    id: row.id,
    employeeNumber: row.employeeNumber,
    displayName: row.displayName,
    email: row.email,
    employmentStatus: row.employmentStatus,
    departmentName: row.departmentName,
    positionTitle: row.positionTitle,
    managerDisplayName: row.managerDisplayName,
    updatedAt: row.updatedAt,
  };
}

export async function listHrEmployeeDirectory(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrEmployeeDirectoryWindow> {
  const window = await listHrEmployeeDirectoryWindow({
    organizationId: input.organizationId,
    limit: input.limit,
    offset: input.offset,
    search: input.search,
  });

  return {
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    rows: window.rows.map(mapEmployeeRow),
  };
}
