import { z } from "zod";

const dayOfWeekSchema = z.number().int().min(0).max(6);

export const hrFwaSchedulePatternDetailsSchema = z
  .object({
    workDays: z.array(dayOfWeekSchema).optional(),
    officeDays: z.array(dayOfWeekSchema).optional(),
    remoteDays: z.array(dayOfWeekSchema).optional(),
    restDays: z.array(dayOfWeekSchema).optional(),
    coreHoursStartMinutes: z.number().int().min(0).max(1439).optional(),
    coreHoursEndMinutes: z.number().int().min(0).max(1439).optional(),
    flexibleStartEarliestMinutes: z.number().int().min(0).max(1439).optional(),
    flexibleStartLatestMinutes: z.number().int().min(0).max(1439).optional(),
    flexibleEndEarliestMinutes: z.number().int().min(0).max(1439).optional(),
    flexibleEndLatestMinutes: z.number().int().min(0).max(1439).optional(),
    expectedWeeklyHours: z.number().positive().optional(),
    extendedDailyHours: z.number().positive().optional(),
    compressedWorkingDaysPerWeek: z.number().int().min(1).max(6).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.coreHoursStartMinutes !== undefined &&
      value.coreHoursEndMinutes !== undefined &&
      value.coreHoursEndMinutes <= value.coreHoursStartMinutes
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Core hours end must be after start.",
        path: ["coreHoursEndMinutes"],
      });
    }
    if (
      value.flexibleStartEarliestMinutes !== undefined &&
      value.flexibleStartLatestMinutes !== undefined &&
      value.flexibleStartLatestMinutes < value.flexibleStartEarliestMinutes
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Flexible start latest must be on or after earliest.",
        path: ["flexibleStartLatestMinutes"],
      });
    }
    if (
      value.flexibleEndEarliestMinutes !== undefined &&
      value.flexibleEndLatestMinutes !== undefined &&
      value.flexibleEndLatestMinutes < value.flexibleEndEarliestMinutes
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Flexible end latest must be on or after earliest.",
        path: ["flexibleEndLatestMinutes"],
      });
    }
    if (
      value.extendedDailyHours !== undefined &&
      value.compressedWorkingDaysPerWeek === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Compressed working days per week is required for extended daily hours.",
        path: ["compressedWorkingDaysPerWeek"],
      });
    }
  });

export const createHrFwaSchedulePatternFormSchema = z.object({
  employeeId: z.string().optional(),
  label: z.string().optional(),
  patternDetails: hrFwaSchedulePatternDetailsSchema,
});

export type HrFwaSchedulePatternDetailsInput = z.infer<
  typeof hrFwaSchedulePatternDetailsSchema
>;
