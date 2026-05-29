import { z } from "zod";

const timeHmSchema = z
  .string()
  .trim()
  .transform((value) => {
    const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)/);
    if (!match) {
      throw new Error("Use HH:mm (24-hour) format.");
    }
    return `${match[1]}:${match[2]}`;
  });

export const hrCreateShiftTemplateActionSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
  startTime: timeHmSchema,
  endTime: timeHmSchema,
});

export const hrArchiveShiftTemplateActionSchema = z.object({
  templateId: z.string().trim().min(1),
});

export const hrScheduleShiftAssignmentActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  shiftDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});

export const hrShiftAssignmentIdActionSchema = z.object({
  assignmentId: z.string().trim().min(1),
});
