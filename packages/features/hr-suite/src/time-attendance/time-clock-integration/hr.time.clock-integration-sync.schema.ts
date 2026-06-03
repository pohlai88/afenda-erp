import { z } from "zod";

import { hrTimeClockIngestPunchSchema } from "./hr.time.clock-integration-punch.schema";

export const hrTimeClockTriggerSyncSchema = z.object({
  deviceId: z.string().trim().min(1),
  batchKey: z.string().trim().min(1).max(256).optional(),
  punches: z.array(hrTimeClockIngestPunchSchema).optional(),
});

export const hrTimeClockOfflineReconcileSchema = z.object({
  deviceId: z.string().trim().min(1),
  batchKey: z.string().trim().min(1).max(256).optional(),
  punches: z.array(hrTimeClockIngestPunchSchema).min(1).max(5000),
});

export type HrTimeClockTriggerSyncInput = z.infer<
  typeof hrTimeClockTriggerSyncSchema
>;
export type HrTimeClockOfflineReconcileInput = z.infer<
  typeof hrTimeClockOfflineReconcileSchema
>;
