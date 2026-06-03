import { z } from "zod";

export const HR_RECORDS_EMPLOYMENT_STATUSES = [
  "onboarding",
  "active",
  "probation",
  "confirmed",
  "suspended",
  "notice_period",
  "offboarding",
  "terminated",
  "separated",
  "retired",
  "archived",
] as const;

export const hrRecordsEmploymentStatusSchema = z.enum(
  HR_RECORDS_EMPLOYMENT_STATUSES,
);

export type HrRecordsEmploymentStatus = z.infer<
  typeof hrRecordsEmploymentStatusSchema
>;
