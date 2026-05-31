import { z } from "zod";

import { HR_PAYROLL_PRORATION_REASONS } from "./hr.payroll.processing-constants.shared";

export const hrPayrollProrationInputSchema = z.object({
  reason: z.enum(HR_PAYROLL_PRORATION_REASONS),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  periodAmount: z.number().positive(),
  eventDate: z.coerce.date().optional(),
  eventEndDate: z.coerce.date().optional(),
  unpaidDays: z.number().nonnegative().optional(),
  priorPeriodAmount: z.number().nonnegative().optional(),
  newPeriodAmount: z.number().nonnegative().optional(),
  salaryChangeDate: z.coerce.date().optional(),
  workingDaysInPeriod: z.number().int().positive().optional(),
});

export type HrPayrollProrationInput = z.infer<
  typeof hrPayrollProrationInputSchema
>;

export type HrPayrollProrationResult = {
  reason: HrPayrollProrationInput["reason"];
  proratedAmount: number;
  basisDays: number;
  totalDays: number;
  factor: number;
  notes: string;
};
