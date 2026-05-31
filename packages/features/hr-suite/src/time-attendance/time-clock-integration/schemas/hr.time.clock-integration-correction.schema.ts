import { z } from "zod";

import { hrTimeClockPunchTypeSchema } from "./hr.time.clock-integration-punch.schema";

const correctionPunchTypeSchema = hrTimeClockPunchTypeSchema.exclude([
  "correction",
  "transfer",
]);

export const submitHrTimeClockCorrectionSchema = z.object({
  originalRawPunchId: z.string().trim().min(1),
  punchType: correctionPunchTypeSchema,
  punchedAt: z.coerce.date(),
  reason: z.string().trim().min(3).max(2000),
  policyGroupCode: z.string().trim().max(64).optional(),
});

export const promoteHrTimeClockPunchSchema = z.object({
  rawPunchId: z.string().trim().min(1),
});

export const runHrTimeClockValidationSchema = z.object({
  rawPunchId: z.string().trim().min(1),
  policyGroupCode: z.string().trim().max(64).optional(),
});

export type SubmitHrTimeClockCorrectionInput = z.infer<
  typeof submitHrTimeClockCorrectionSchema
>;
export type PromoteHrTimeClockPunchInput = z.infer<
  typeof promoteHrTimeClockPunchSchema
>;
export type RunHrTimeClockValidationInput = z.infer<
  typeof runHrTimeClockValidationSchema
>;
