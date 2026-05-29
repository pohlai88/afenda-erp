import { z } from "zod";

export const hrRecordAttendancePunchActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  punchType: z.enum(["clock_in", "clock_out"]),
  punchedAt: z.coerce.date().optional(),
  idempotencyKey: z.string().trim().max(128).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const hrVoidAttendancePunchActionSchema = z.object({
  recordId: z.string().trim().min(1),
});
