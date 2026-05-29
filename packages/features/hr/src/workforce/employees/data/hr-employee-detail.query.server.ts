import { getHrEmployeeDetail as getHrEmployeeDetailRow } from "@afenda/db";
import type { HrEmployeeDetail } from "../contracts";

export async function getHrEmployeeDetail(input: {
  organizationId: string;
  employeeId: string;
}): Promise<HrEmployeeDetail | null> {
  const row = await getHrEmployeeDetailRow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });

  if (!row) return null;

  return {
    id: row.id,
    employeeNumber: row.employeeNumber,
    legalName: row.legalName,
    preferredName: row.preferredName,
    displayName: row.displayName,
    email: row.email,
    employmentStatus: row.employmentStatus,
    currentDepartmentId: row.currentDepartmentId,
    currentPositionId: row.currentPositionId,
    departmentName: row.departmentName,
    positionTitle: row.positionTitle,
    managerDisplayName: row.managerDisplayName,
    managerEmployeeId: row.managerEmployeeId,
    archivedAt: row.archivedAt,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  };
}
