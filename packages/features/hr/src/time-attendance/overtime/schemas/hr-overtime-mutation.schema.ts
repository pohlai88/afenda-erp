import { z } from "zod";

const overtimeTypeSchema = z.enum([
  "regular",
  "weekend",
  "holiday",
  "public_holiday",
]);

export const hrSubmitOvertimeRequestActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  overtimeType: overtimeTypeSchema,
  workDate: z.coerce.date(),
  hours: z.coerce.number().positive().max(24),
  reason: z.string().trim().max(2000).optional(),
});

export const hrDecideOvertimeRequestActionSchema = z.object({
  requestId: z.string().trim().min(1),
  decisionNote: z.string().trim().max(2000).optional(),
});

export const hrCancelOvertimeRequestActionSchema = z.object({
  requestId: z.string().trim().min(1),
});
