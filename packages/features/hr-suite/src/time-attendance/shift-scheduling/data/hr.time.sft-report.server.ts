import {
  listHrShiftRosterReportDefinitionsWindow,
  queryHrShiftScheduleReportRows,
  saveHrShiftRosterReportDefinition,
  type HrShiftReportGroupBy,
  type HrShiftRosterReportDefinitionWindow,
  type HrShiftRosterReportFilterPayload,
  type HrShiftScheduleReportRow,
} from "@afenda/db";
import { z } from "zod";

export type { HrShiftReportGroupBy, HrShiftScheduleReportRow };

export const hrSftReportGroupBySchema = z.enum([
  "employee",
  "department",
  "manager",
  "location",
  "role",
  "period",
]);

export type HrSftReportGroupBy = z.infer<typeof hrSftReportGroupBySchema>;

export const hrSftReportFilterSchema = z.object({
  groupBy: hrSftReportGroupBySchema,
  periodStartIso: z.string(),
  periodEndIso: z.string(),
  departmentId: z.string().optional(),
  locationCode: z.string().optional(),
  grade: z.string().optional(),
  positionId: z.string().optional(),
  managerEmployeeId: z.string().optional(),
  legalEntityCode: z.string().optional(),
  templateId: z.string().optional(),
  employeeId: z.string().optional(),
});

export type HrSftReportFilter = z.infer<typeof hrSftReportFilterSchema>;

export const hrSftReportResultSchema = z.object({
  groupBy: hrSftReportGroupBySchema,
  periodStart: z.date(),
  periodEnd: z.date(),
  rowCount: z.number(),
  rows: z.array(
    z.object({
      groupKey: z.string(),
      groupLabel: z.string(),
      periodLabel: z.string().nullable(),
      assignmentCount: z.number(),
      publishedCount: z.number(),
      employeeCount: z.number(),
    }),
  ),
});

export type HrSftReportResult = z.infer<typeof hrSftReportResultSchema>;

export const hrSftReportCsvResultSchema = z.object({
  filename: z.string(),
  contentType: z.literal("text/csv"),
  csv: z.string(),
  rowCount: z.number(),
});

export type HrSftReportCsvResult = z.infer<typeof hrSftReportCsvResultSchema>;

export const saveHrSftReportDefinitionFormSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  filterPayloadJson: z.string().optional(),
});

function parsePeriodBounds(filter: Pick<HrSftReportFilter, "periodStartIso" | "periodEndIso">) {
  const periodStart = new Date(filter.periodStartIso);
  const periodEnd = new Date(filter.periodEndIso);
  if (
    Number.isNaN(periodStart.getTime()) ||
    Number.isNaN(periodEnd.getTime()) ||
    periodStart > periodEnd
  ) {
    throw new Error("invalid_period_range");
  }
  return { periodStart, periodEnd };
}

function toFilterPayload(filter: HrSftReportFilter): HrShiftRosterReportFilterPayload {
  return {
    departmentId: filter.departmentId,
    locationCode: filter.locationCode,
    grade: filter.grade,
    positionId: filter.positionId,
    managerEmployeeId: filter.managerEmployeeId,
    legalEntityCode: filter.legalEntityCode,
    templateId: filter.templateId,
    employeeId: filter.employeeId,
  };
}

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(headers: readonly string[], rows: readonly string[][]) {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return lines.join("\n");
}

/** HRM-SFT-028 — generate shift schedule report rows. */
export async function buildHrSftScheduleReport(input: {
  organizationId: string;
  filter: HrSftReportFilter;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrSftReportResult> {
  const { periodStart, periodEnd } = parsePeriodBounds(input.filter);

  const rows = await queryHrShiftScheduleReportRows({
    organizationId: input.organizationId,
    groupBy: input.filter.groupBy,
    periodStart,
    periodEnd,
    filter: toFilterPayload(input.filter),
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  return hrSftReportResultSchema.parse({
    groupBy: input.filter.groupBy,
    periodStart,
    periodEnd,
    rowCount: rows.length,
    rows,
  });
}

/** HRM-SFT-028 — CSV export for shift schedule report. */
export async function buildHrSftScheduleReportCsv(input: {
  organizationId: string;
  filter: HrSftReportFilter;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrSftReportCsvResult> {
  const report = await buildHrSftScheduleReport(input);
  const csv = buildCsv(
    [
      "Group",
      "Period",
      "Assignments",
      "Published",
      "Employees",
    ],
    report.rows.map((row) => [
      row.groupLabel,
      row.periodLabel ?? "",
      String(row.assignmentCount),
      String(row.publishedCount),
      String(row.employeeCount),
    ]),
  );

  return hrSftReportCsvResultSchema.parse({
    filename: `shift-schedule-${report.groupBy}-${report.periodStart.toISOString().slice(0, 10)}.csv`,
    contentType: "text/csv",
    csv,
    rowCount: report.rowCount,
  });
}

/** HRM-SFT-028 — save report definition preset. */
export async function saveHrSftReportDefinition(input: {
  organizationId: string;
  createdByAuthUserId: string;
  code: string;
  name: string;
  description?: string | null;
  filter: HrSftReportFilter;
}): Promise<{ definitionId: string }> {
  return saveHrShiftRosterReportDefinition({
    organizationId: input.organizationId,
    code: input.code,
    name: input.name,
    description: input.description,
    filterPayload: toFilterPayload(input.filter),
    createdByAuthUserId: input.createdByAuthUserId,
  });
}

/** HRM-SFT-028 — list saved report definitions. */
export async function listHrSftReportDefinitions(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftRosterReportDefinitionWindow> {
  return listHrShiftRosterReportDefinitionsWindow(input);
}

export function toHrSftReportActionFailure(error: unknown): { ok: false; error: string } {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "hr_sft_report_failed" };
}

export const HR_SFT_REPORT_GROUP_BY_OPTIONS: readonly {
  value: HrSftReportGroupBy;
  label: string;
}[] = [
  { value: "employee", label: "Employee" },
  { value: "department", label: "Department" },
  { value: "manager", label: "Manager" },
  { value: "location", label: "Location" },
  { value: "role", label: "Role" },
  { value: "period", label: "Period" },
];
