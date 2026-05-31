import { z } from "zod";

import { hrSftTemplateCodeSchema, hrSftTemplateNameSchema } from "./hr.time.sft-template.schema";

/** HRM-SFT-008 — rotating shift cycle header. */
export const hrSftCreateRotationCycleSchema = z.object({
  code: hrSftTemplateCodeSchema,
  name: hrSftTemplateNameSchema,
  description: z.string().trim().max(500).optional(),
  cycleLengthDays: z.coerce.number().int().min(1).max(31),
});

export type HrSftCreateRotationCycleInput = z.infer<
  typeof hrSftCreateRotationCycleSchema
>;

export const hrSftAddRotationCycleStepSchema = z.object({
  cycleId: z.string().trim().min(1),
  stepIndex: z.coerce.number().int().min(0).max(30),
  templateId: z.string().trim().min(1).optional(),
  isRestDay: z.coerce.boolean().optional(),
  label: z.string().trim().max(80).optional(),
});

export type HrSftAddRotationCycleStepInput = z.infer<
  typeof hrSftAddRotationCycleStepSchema
>;

export const hrSftApplyRotationCycleSchema = z.object({
  rotationCycleId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

export type HrSftApplyRotationCycleInput = z.infer<
  typeof hrSftApplyRotationCycleSchema
>;
