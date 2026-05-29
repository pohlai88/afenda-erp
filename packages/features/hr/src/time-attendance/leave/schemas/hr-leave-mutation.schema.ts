import { z } from "zod";

const leaveTypeSchema = z.enum([
  "annual",
  "sick",
  "unpaid",
  "compassionate",
  "other",
]);

export const hrSubmitLeaveRequestActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  leaveType: leaveTypeSchema,
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrDecideLeaveRequestActionSchema = z.object({
  requestId: z.string().trim().min(1),
  decisionNote: z.string().trim().max(2000).optional(),
});

export const hrCancelLeaveRequestActionSchema = z.object({
  requestId: z.string().trim().min(1),
});
