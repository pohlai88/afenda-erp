import { z } from "zod";

export const hrTimeOtmReportGroupBySchema = z.enum([
  "employee",
  "department",
  "manager",
  "cost_center",
  "legal_entity",
  "location",
  "overtime_type",
  "status",
  "period",
]);

export type HrTimeOtmReportGroupBy = z.infer<
  typeof hrTimeOtmReportGroupBySchema
>;

export const exportHrTimeOtmReportFormSchema = z.object({
  groupBy: hrTimeOtmReportGroupBySchema.default("department"),
  periodStartIso: z.string().optional(),
  periodEndIso: z.string().optional(),
});

export const HR_OTM_REPORT_GROUP_BY_OPTIONS: readonly {
  value: HrTimeOtmReportGroupBy;
  label: string;
}[] = [
  { value: "employee", label: "Employee" },
  { value: "department", label: "Department" },
  { value: "manager", label: "Manager" },
  { value: "cost_center", label: "Cost center" },
  { value: "legal_entity", label: "Legal entity" },
  { value: "location", label: "Location" },
  { value: "overtime_type", label: "Overtime type" },
  { value: "status", label: "Status" },
  { value: "period", label: "Period" },
];
