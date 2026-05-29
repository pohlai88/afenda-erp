import { listHrEmployeeAssignments } from "@afenda/db";
import { requireHrEmployeesRead } from "../policies/hr-employees.policy.server";

export async function listHrEmployeeAssignmentHistory(input: {
  employeeId: string;
  limit?: number;
}) {
  const { organization } = await requireHrEmployeesRead();

  return listHrEmployeeAssignments({
    organizationId: organization.id,
    employeeId: input.employeeId,
    limit: input.limit,
  });
}
