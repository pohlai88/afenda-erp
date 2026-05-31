import { z } from "zod";

import { hrTimeClockPunchTypeSchema } from "./hr.time.clock-integration-punch.schema";

export const hrTimeClockPunchExceptionCodeSchema = z.enum([
  "missing_punch",
  "duplicate",
  "early_in",
  "late_in",
  "early_out",
  "unmatched",
  "invalid_employee",
  "unmapped_device",
]);

export const hrTimeClockPunchValidationStatusSchema = z.enum([
  "pending",
  "valid",
  "invalid",
  "duplicate",
  "unmatched",
]);

export const hrTimeClockShiftMatchSourceSchema = z.enum([
  "shift_assignment",
  "attendance_policy",
]);

export const hrTimeClockShiftMatchSchema = z.object({
  matched: z.boolean(),
  shiftAssignmentId: z.string().nullable(),
  referenceStartMinutes: z.number().int().min(0).max(24 * 60),
  referenceEndMinutes: z.number().int().min(0).max(24 * 60),
  source: hrTimeClockShiftMatchSourceSchema,
});

export const hrTimeClockValidationPipelineResultSchema = z.object({
  rawPunchId: z.string().min(1),
  validationStatus: hrTimeClockPunchValidationStatusSchema,
  classifiedPunchType: hrTimeClockPunchTypeSchema,
  exceptionCodes: z.array(hrTimeClockPunchExceptionCodeSchema),
  shiftMatch: hrTimeClockShiftMatchSchema,
  employeeId: z.string().nullable(),
  mappingId: z.string().nullable(),
});

export type HrTimeClockPunchExceptionCode = z.infer<
  typeof hrTimeClockPunchExceptionCodeSchema
>;
export type HrTimeClockPunchValidationStatus = z.infer<
  typeof hrTimeClockPunchValidationStatusSchema
>;
export type HrTimeClockValidationPipelineResultForm = z.infer<
  typeof hrTimeClockValidationPipelineResultSchema
>;
