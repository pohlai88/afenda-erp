import { listHrEmployeeDirectoryWindow } from "@afenda/db";

export async function loadHrOnboardingFormOptions(organizationId: string) {
  const directory = await listHrEmployeeDirectoryWindow({
    organizationId,
    limit: 100,
  });

  return {
    employees: directory.rows
      .filter((row) => row.employmentStatus === "onboarding")
      .map((row) => ({
        id: row.id,
        label: `${row.employeeNumber} — ${row.displayName}`,
      })),
  };
}
