import {
  buildHrOvertimeReportCsv,
  summarizeHrOvertimeReport,
  type HrOvertimeReportGroupBy,
  type HrOvertimeReportRow,
} from "@afenda/db";

import type { HrTimeOtmReportGroupBy } from "./hr.time.otm.schema";

export type { HrOvertimeReportRow };

export type HrTimeOtmReportFilter = {
  organizationId: string;
  groupBy: HrTimeOtmReportGroupBy;
  periodStart?: Date;
  periodEnd?: Date;
  visibleEmployeeIds?: readonly string[] | null;
};

export type HrTimeOtmReportCsvResult = {
  filename: string;
  contentType: "text/csv";
  csv: string;
  rowCount: number;
};

/** HRM-OTM-027 — aggregate overtime by department, manager, cost center, and other dimensions. */
export async function buildHrTimeOtmReportRows(
  input: HrTimeOtmReportFilter,
): Promise<readonly HrOvertimeReportRow[]> {
  return summarizeHrOvertimeReport({
    organizationId: input.organizationId,
    groupBy: input.groupBy as HrOvertimeReportGroupBy,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
}

/** HRM-OTM-027 — operational CSV export for authorized users. */
export async function buildHrTimeOtmReportCsvExport(
  input: HrTimeOtmReportFilter,
): Promise<HrTimeOtmReportCsvResult> {
  const rows = await buildHrTimeOtmReportRows(input);
  const csv = buildHrOvertimeReportCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return {
    filename: `overtime-report-${input.groupBy}-${stamp}.csv`,
    contentType: "text/csv",
    csv,
    rowCount: rows.length,
  };
}

export { buildHrOvertimeReportCsv as buildHrTimeOtmReportCsv };
