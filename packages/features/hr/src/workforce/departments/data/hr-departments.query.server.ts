import { listHrDepartments } from "@afenda/db";

export async function listHrDepartmentCatalog(input: {
  organizationId: string;
  limit?: number;
}) {
  return listHrDepartments(input);
}
