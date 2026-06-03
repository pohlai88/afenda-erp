import {
  listHrFwaComplianceBreaches,
  summarizeHrFwaReport,
  type HrFwaReportGroupBy,
  type HrFwaReportRow,
} from "@afenda/db";

export type { HrFwaReportGroupBy, HrFwaReportRow };

export type HrFwaReportFilter = {
  organizationId: string;
  groupBy: HrFwaReportGroupBy;
  periodStart?: Date;
  periodEnd?: Date;
  visibleEmployeeIds?: readonly string[] | null;
};

/** HRM-FWA-030 — aggregate flexible work metrics by dimension and period. */
export async function buildHrFwaReportRows(
  input: HrFwaReportFilter,
): Promise<readonly HrFwaReportRow[]> {
  const summary = await summarizeHrFwaReport({
    organizationId: input.organizationId,
    groupBy: input.groupBy,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  if (input.groupBy === "status") {
    return summary;
  }

  const breaches = await listHrFwaComplianceBreaches({
    organizationId: input.organizationId,
    status: "open",
    limit: 500,
  });

  const breachByEmployee = new Map<string, number>();
  for (const breach of breaches) {
    breachByEmployee.set(
      breach.employeeId,
      (breachByEmployee.get(breach.employeeId) ?? 0) + 1,
    );
  }

  return summary.map((row) => ({
    ...row,
    complianceBreachCount:
      row.complianceBreachCount +
      (input.groupBy === "employee"
        ? (breachByEmployee.get(row.groupKey) ?? 0)
        : 0),
  }));
}

export const HR_FWA_REPORT_GROUP_BY_OPTIONS: readonly {
  value: HrFwaReportGroupBy;
  label: string;
}[] = [
  { value: "employee", label: "Employee" },
  { value: "department", label: "Department" },
  { value: "manager", label: "Manager" },
  { value: "legal_entity", label: "Legal entity" },
  { value: "location", label: "Location" },
  { value: "arrangement_kind", label: "Arrangement type" },
  { value: "status", label: "Status" },
  { value: "period", label: "Period" },
];
