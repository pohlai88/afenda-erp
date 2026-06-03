import { z } from "zod";

import { HR_SBS_VERSION_STATUSES } from "./hr.payroll.sbs-constants.shared";

/** SBS-022 — version detail lookup. */
export const hrSbsVersionIdSchema = z.object({
  versionId: z.string().min(1),
});

/** SBS-022 — activate or supersede a benchmark dataset version. */
export const hrSbsVersionStatusTransitionSchema = z.object({
  versionId: z.string().min(1),
  versionStatus: z.enum(HR_SBS_VERSION_STATUSES),
});

export type HrSbsVersionStatusTransitionInput = z.infer<
  typeof hrSbsVersionStatusTransitionSchema
>;
