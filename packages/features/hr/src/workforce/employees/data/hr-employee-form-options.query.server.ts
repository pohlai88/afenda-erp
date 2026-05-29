import {
  listHrDepartments,
  listHrEmployeeDirectoryWindow,
  listHrPositions,
} from "@afenda/db";
import type { HrEmployeeFormOptions } from "../contracts/hr-employee-form.contract";
import { requireHrEmployeesRead } from "../policies/hr-employees.policy.server";

export async function loadHrEmployeeFormOptions(input?: {
  excludeEmployeeId?: string;
}): Promise<HrEmployeeFormOptions> {
  const { organization } = await requireHrEmployeesRead();

  const [departments, positions, directory] = await Promise.all([
    listHrDepartments({ organizationId: organization.id, limit: 100 }),
    listHrPositions({ organizationId: organization.id, limit: 100 }),
    listHrEmployeeDirectoryWindow({
      organizationId: organization.id,
      limit: 100,
    }),
  ]);

  return {
    departments: departments.map((row) => ({
      id: row.id,
      label: `${row.code} — ${row.name}`,
    })),
    positions: positions.map((row) => ({
      id: row.id,
      label: `${row.code} — ${row.title}`,
    })),
    managers: directory.rows
      .filter((row) => row.id !== input?.excludeEmployeeId)
      .map((row) => ({
        id: row.id,
        label: `${row.employeeNumber} — ${row.displayName}`,
      })),
  };
}
