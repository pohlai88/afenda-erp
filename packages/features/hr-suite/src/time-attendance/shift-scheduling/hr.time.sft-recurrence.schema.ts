import { z } from "zod";

import { hrSftTemplateCodeSchema, hrSftTemplateNameSchema } from "./hr.time.sft-template.schema";

const weekdaySchema = z.number().int().min(0).max(6);

/** HRM-SFT-007 — weekly recurrence rule. */
export const hrSftCreateRecurrenceRuleSchema = z.object({
  code: hrSftTemplateCodeSchema,
  name: hrSftTemplateNameSchema,
  templateId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  daysOfWeek: z.array(weekdaySchema).min(1).max(7),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
});

export type HrSftCreateRecurrenceRuleInput = z.infer<
  typeof hrSftCreateRecurrenceRuleSchema
>;

export const hrSftApplyRecurrenceRuleSchema = z.object({
  recurrenceRuleId: z.string().trim().min(1),
  applyThrough: z.coerce.date().optional(),
});

export type HrSftApplyRecurrenceRuleInput = z.infer<
  typeof hrSftApplyRecurrenceRuleSchema
>;
