import {
  listHrDepartments,
  listHrEmployeeDirectoryWindow,
  listHrPositions,
} from "@afenda/db";

export type HrLifecycleFormOptions = {
  employees: ReadonlyArray<{ id: string; label: string }>;
  departments: ReadonlyArray<{ id: string; label: string }>;
  positions: ReadonlyArray<{ id: string; label: string }>;
  managers: ReadonlyArray<{ id: string; label: string }>;
};

export async function loadHrLifecycleFormOptions(
  organizationId: string,
): Promise<HrLifecycleFormOptions> {
  const [departments, positions, directory] = await Promise.all([
    listHrDepartments({ organizationId, limit: 100 }),
    listHrPositions({ organizationId, limit: 100 }),
    listHrEmployeeDirectoryWindow({ organizationId, limit: 100 }),
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
    employees: directory.rows.map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.displayName}`,
    })),
    managers: directory.rows.map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.displayName}`,
    })),
  };
}
