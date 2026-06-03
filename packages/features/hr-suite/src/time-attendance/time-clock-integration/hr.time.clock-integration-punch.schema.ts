import { z } from "zod";

export const hrTimeClockPunchTypeSchema = z.enum([
  "clock_in",
  "clock_out",
  "break_in",
  "break_out",
  "transfer",
  "correction",
]);

export const hrTimeClockPunchTypeAliasSchema = z.union([
  hrTimeClockPunchTypeSchema,
  z.enum([
    "break_start",
    "break_end",
    "breakstart",
    "breakend",
  ]),
]);

export const hrTimeClockIngestPunchSchema = z.object({
  externalPunchId: z.string().trim().max(120).optional(),
  idempotencyKey: z.string().trim().max(256).optional(),
  punchType: hrTimeClockPunchTypeAliasSchema.optional(),
  punchedAt: z.string().datetime(),
  capturedAt: z.string().datetime().optional(),
  employeeId: z.string().trim().min(1).optional(),
  deviceUserId: z.string().trim().max(120).optional(),
  badgeId: z.string().trim().max(120).optional(),
  biometricId: z.string().trim().max(120).optional(),
  clockId: z.string().trim().max(120).optional(),
  rawPayload: z.record(z.string(), z.unknown()).optional(),
});

export const hrTimeClockManualImportBatchSchema = z.object({
  deviceId: z.string().trim().min(1),
  batchKey: z.string().trim().min(1).max(256).optional(),
  punches: z.array(hrTimeClockIngestPunchSchema).min(1).max(5000),
});

export const hrTimeClockApiIngestBodySchema = z.object({
  deviceId: z.string().trim().min(1).optional(),
  externalDeviceId: z.string().trim().min(1).max(120).optional(),
  batchKey: z.string().trim().min(1).max(256).optional(),
  offlineReconcile: z.boolean().optional(),
  punches: z.array(hrTimeClockIngestPunchSchema).min(1).max(500),
});

export type HrTimeClockIngestPunchInput = z.infer<
  typeof hrTimeClockIngestPunchSchema
>;
export type HrTimeClockManualImportBatchInput = z.infer<
  typeof hrTimeClockManualImportBatchSchema
>;
export type HrTimeClockApiIngestBodyInput = z.infer<
  typeof hrTimeClockApiIngestBodySchema
>;
