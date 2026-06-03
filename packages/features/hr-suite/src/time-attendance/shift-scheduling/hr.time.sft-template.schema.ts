import { z } from "zod";

const HR_SFT_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** HRM-SFT-002 — operational shift category. */
export const hrSftShiftCategorySchema = z.enum([
  "day",
  "evening",
  "night",
  "split",
  "rest",
  "off",
  "holiday",
  "flexible",
  "other",
]);

export type HrSftShiftCategory = z.infer<typeof hrSftShiftCategorySchema>;

/** HRM-SFT-003 — scheduling pattern kind. */
export const hrSftPatternKindSchema = z.enum([
  "fixed",
  "rotating",
  "split",
  "night",
  "weekend",
  "holiday",
  "flexible",
]);

export type HrSftPatternKind = z.infer<typeof hrSftPatternKindSchema>;

export const hrSftTimeHmSchema = z
  .string()
  .trim()
  .regex(HR_SFT_TIME_PATTERN, "Expected HH:mm (24-hour) time");

export const hrSftTemplateCodeSchema = z
  .string()
  .trim()
  .min(1, "Code is required")
  .max(32, "Code must be at most 32 characters");

export const hrSftTemplateNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name must be at most 120 characters");

export const hrSftWorkingHoursMinutesSchema = z
  .number()
  .int("Working hours must be whole minutes")
  .min(15, "Working hours must be at least 15 minutes")
  .max(24 * 60, "Working hours cannot exceed 24 hours");

/** HRM-SFT-001/002/003 — create shift template input. */
export const hrSftCreateShiftTemplateSchema = z
  .object({
    code: hrSftTemplateCodeSchema,
    name: hrSftTemplateNameSchema,
    description: z.string().trim().max(500).optional(),
    startTime: hrSftTimeHmSchema,
    endTime: hrSftTimeHmSchema,
    breakStartTime: hrSftTimeHmSchema.optional(),
    breakEndTime: hrSftTimeHmSchema.optional(),
    workingHoursMinutes: hrSftWorkingHoursMinutesSchema.optional(),
    shiftCategory: hrSftShiftCategorySchema.default("day"),
    patternKind: hrSftPatternKindSchema.default("fixed"),
  })
  .superRefine((value, ctx) => {
    const hasBreakStart = value.breakStartTime !== undefined;
    const hasBreakEnd = value.breakEndTime !== undefined;
    if (hasBreakStart !== hasBreakEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "breakStartTime and breakEndTime must both be set or omitted",
        path: ["breakStartTime"],
      });
    }
  });

export type HrSftCreateShiftTemplateInput = z.infer<
  typeof hrSftCreateShiftTemplateSchema
>;

/** HRM-SFT-001 — update shift template input (code immutable). */
export const hrSftUpdateShiftTemplateSchema = z
  .object({
    templateId: z.string().trim().min(1),
    name: hrSftTemplateNameSchema.optional(),
    description: z.string().trim().max(500).nullable().optional(),
    startTime: hrSftTimeHmSchema.optional(),
    endTime: hrSftTimeHmSchema.optional(),
    breakStartTime: hrSftTimeHmSchema.nullable().optional(),
    breakEndTime: hrSftTimeHmSchema.nullable().optional(),
    workingHoursMinutes: hrSftWorkingHoursMinutesSchema.optional(),
    shiftCategory: hrSftShiftCategorySchema.optional(),
    patternKind: hrSftPatternKindSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const hasBreakStart = value.breakStartTime !== undefined;
    const hasBreakEnd = value.breakEndTime !== undefined;
    if (hasBreakStart !== hasBreakEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "breakStartTime and breakEndTime must both be provided",
        path: ["breakStartTime"],
      });
    }
  });

export type HrSftUpdateShiftTemplateInput = z.infer<
  typeof hrSftUpdateShiftTemplateSchema
>;

/** Serializable shift template row for governed list surfaces. */
export const hrSftShiftTemplateRowSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  breakStartTime: z.string().nullable(),
  breakEndTime: z.string().nullable(),
  workingHoursMinutes: z.number().int(),
  shiftCategory: hrSftShiftCategorySchema,
  patternKind: hrSftPatternKindSchema,
  status: z.enum(["active", "archived"]),
});

export type HrSftShiftTemplateRow = z.infer<typeof hrSftShiftTemplateRowSchema>;

export const hrSftArchiveShiftTemplateSchema = z.object({
  templateId: z.string().trim().min(1),
});

export type HrSftArchiveShiftTemplateInput = z.infer<
  typeof hrSftArchiveShiftTemplateSchema
>;
