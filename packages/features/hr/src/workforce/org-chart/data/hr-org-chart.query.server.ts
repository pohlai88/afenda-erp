import {
  listHrDepartmentTree,
  listHrReportingLines,
} from "@afenda/db";

export async function loadHrOrgChartModel(input: {
  organizationId: string;
  limit?: number;
}) {
  const [reportingLines, departmentTree] = await Promise.all([
    listHrReportingLines(input),
    listHrDepartmentTree(input),
  ]);

  return { reportingLines, departmentTree };
}
