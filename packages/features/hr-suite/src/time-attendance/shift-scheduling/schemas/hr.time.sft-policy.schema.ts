import { z } from "zod";

/** HRM-SFT-014/015 — org scheduling policy (rest hours, weekly cap, validation toggles). */
export const hrSftSchedulingPolicySchema = z.object({
  minRestHoursBetweenShifts: z
    .number()
    .min(0, "Minimum rest hours cannot be negative")
    .max(48, "Minimum rest hours cannot exceed 48")
    .default(11),
  maxWeeklyScheduledHours: z
    .number()
    .min(1, "Weekly cap must be at least 1 hour")
    .max(168, "Weekly cap cannot exceed 168 hours")
    .default(48),
  swapRequestsEnabled: z.boolean().default(true),
  employeeScheduleChangeEnabled: z.boolean().default(true),
  validateAvailabilityOnAssign: z.boolean().default(true),
  validateLeaveConflictOnAssign: z.boolean().default(true),
});

export type HrSftSchedulingPolicy = z.infer<typeof hrSftSchedulingPolicySchema>;

export const DEFAULT_HR_SFT_SCHEDULING_POLICY: HrSftSchedulingPolicy =
  hrSftSchedulingPolicySchema.parse({});

export const upsertHrSftSchedulingPolicyFormSchema = hrSftSchedulingPolicySchema;

export const hrSftSchedulingPolicyRowSchema = hrSftSchedulingPolicySchema.extend({
  organizationId: z.string().min(1),
  updatedByAuthUserId: z.string().nullable(),
  updatedAt: z.coerce.date().optional(),
});

export type HrSftSchedulingPolicyRow = z.infer<
  typeof hrSftSchedulingPolicyRowSchema
>;
