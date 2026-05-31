import type { HrCompensationReportRow } from "@afenda/db";

export type HrCompensationPlanningReportFilter = {
  cycleId?: string | null;
  departmentId?: string | null;
  managerEmployeeId?: string | null;
  legalEntityCode?: string | null;
  grade?: string | null;
  budgetPoolId?: string | null;
  recommendationStatus?: string | null;
};

export { listHrCompensationPlanningReportRows } from "@afenda/db";

export function filterHrCompensationPlanningReportRows(
  rows: readonly HrCompensationReportRow[],
  filter: HrCompensationPlanningReportFilter,
  search?: string,
): Array<HrCompensationReportRow & { id: string }> {
  const trimmedSearch = search?.trim().toLowerCase();

  return rows
    .filter((row) => {
      if (filter.cycleId && row.cycleId !== filter.cycleId) return false;
      if (filter.departmentId && row.departmentId !== filter.departmentId) return false;
      if (filter.managerEmployeeId && row.managerEmployeeId !== filter.managerEmployeeId) {
        return false;
      }
      if (filter.legalEntityCode && row.legalEntityCode !== filter.legalEntityCode) {
        return false;
      }
      if (filter.grade && row.grade !== filter.grade) return false;
      if (filter.budgetPoolId && row.budgetPoolId !== filter.budgetPoolId) return false;
      if (
        filter.recommendationStatus &&
        row.recommendationStatus !== filter.recommendationStatus
      ) {
        return false;
      }

      if (!trimmedSearch) {
        return true;
      }

      const haystack = [
        row.cycleId,
        row.departmentId,
        row.managerEmployeeId,
        row.legalEntityCode,
        row.grade,
        row.budgetPoolId,
        row.recommendationStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(trimmedSearch);
    })
    .map((row) => ({
      ...row,
      id: [
        row.cycleId,
        row.departmentId ?? "",
        row.managerEmployeeId ?? "",
        row.legalEntityCode ?? "",
        row.grade ?? "",
        row.budgetPoolId ?? "",
        row.recommendationStatus,
      ].join(":"),
    }));
}

export function buildHrCompensationPlanningReportCsv(
  rows: readonly (HrCompensationReportRow & { id: string })[],
): string {
  const header = [
    "cycle_id",
    "department_id",
    "manager_employee_id",
    "legal_entity_code",
    "grade",
    "budget_pool_id",
    "recommendation_status",
    "count",
  ].join(",");

  const body = rows.map((row) =>
    [
      row.cycleId,
      row.departmentId ?? "",
      row.managerEmployeeId ?? "",
      row.legalEntityCode ?? "",
      row.grade ?? "",
      row.budgetPoolId ?? "",
      row.recommendationStatus,
      String(row.count),
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [header, ...body].join("\n");
}
