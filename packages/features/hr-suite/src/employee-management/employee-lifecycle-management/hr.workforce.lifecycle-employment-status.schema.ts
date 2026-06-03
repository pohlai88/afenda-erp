import { z } from "zod";

/** Mirrors `hr_employment_status` in `@afenda/db` schema (HRM-LCY-001 / LCY-003). */
export const HR_LIFECYCLE_EMPLOYMENT_STATUSES = [
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

export const hrLifecycleEmploymentStatusSchema = z.enum(
  HR_LIFECYCLE_EMPLOYMENT_STATUSES,
);

export type HrLifecycleEmploymentStatus = z.infer<
  typeof hrLifecycleEmploymentStatusSchema
>;
