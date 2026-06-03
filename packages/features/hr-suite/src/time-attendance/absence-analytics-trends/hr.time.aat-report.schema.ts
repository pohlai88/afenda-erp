import { z } from "zod";

/** HRM-AAT-023 — report grouping dimensions. */
export const HRM_AAT_REPORT_GROUP_BY = [
  "employee",
  "department",
  "manager",
  "location",
  "legal_entity",
  "leave_type",
  "period",
] as const;

export type HrAatReportGroupBy = (typeof HRM_AAT_REPORT_GROUP_BY)[number];

/** HRM-AAT-023 — period granularity for trend analysis. */
export const HRM_AAT_REPORT_PERIOD_GRANULARITY = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export type HrAatReportPeriodGranularity =
  (typeof HRM_AAT_REPORT_PERIOD_GRANULARITY)[number];

export const HRM_AAT_REPORT_EXPORT_ROW_CAP = 5_000;

export const hrAatTrendReportFilterSchema = z.object({
  groupBy: z.enum(HRM_AAT_REPORT_GROUP_BY),
  periodGranularity: z.enum(HRM_AAT_REPORT_PERIOD_GRANULARITY).default("monthly"),
  periodStartIso: z.string().datetime({ offset: true }),
  periodEndIso: z.string().datetime({ offset: true }),
  employeeId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  managerEmployeeId: z.string().trim().min(1).optional(),
  locationCode: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
  leaveType: z.string().trim().min(1).optional(),
});

export type HrAatTrendReportFilter = z.infer<typeof hrAatTrendReportFilterSchema>;

export const generateHrAatTrendReportFormSchema = hrAatTrendReportFilterSchema;

export const exportHrAatTrendReportFormSchema = hrAatTrendReportFilterSchema;

export type HrAatTrendReportRow = {
  groupKey: string;
  groupLabel: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  locationCode: string | null;
  legalEntityCode: string | null;
  leaveType: string | null;
  periodLabel: string | null;
  absenceCount: number;
  lostWorkdays: number;
  absenceFrequency: number;
  absenceRatePercent: number | null;
  reasonSample: string | null;
};

export type HrAatTrendReportResult = {
  groupBy: HrAatReportGroupBy;
  periodGranularity: HrAatReportPeriodGranularity;
  periodStartIso: string;
  periodEndIso: string;
  rowCount: number;
  rows: readonly HrAatTrendReportRow[];
};

export type HrAatTrendReportCsvResult = {
  filename: string;
  contentType: "text/csv";
  content: string;
  rowCount: number;
};
