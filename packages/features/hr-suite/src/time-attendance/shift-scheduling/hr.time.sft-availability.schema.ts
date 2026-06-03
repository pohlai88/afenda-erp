import { z } from "zod";

/** HRM-SFT-011 — employee availability kind. */
export const hrSftAvailabilityKindSchema = z.enum([
  "unavailable",
  "preferred",
  "blocked",
]);

export type HrSftAvailabilityKind = z.infer<
  typeof hrSftAvailabilityKindSchema
>;

export const hrSftAssignmentKindSchema = z.enum([
  "shift",
  "rest_day",
  "off_day",
  "holiday",
]);

export type HrSftAssignmentKind = z.infer<typeof hrSftAssignmentKindSchema>;

const hrSftDateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    if (value.startDate.getTime() > value.endDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startDate must be on or before endDate",
        path: ["startDate"],
      });
    }
  });

/** HRM-SFT-011 — create employee availability window. */
export const hrSftCreateAvailabilitySchema = hrSftDateRangeSchema.extend({
  employeeId: z.string().trim().min(1),
  availabilityKind: hrSftAvailabilityKindSchema,
  preferredTemplateId: z.string().trim().min(1).optional(),
  reason: z.string().trim().max(500).optional(),
});

export type HrSftCreateAvailabilityInput = z.infer<
  typeof hrSftCreateAvailabilitySchema
>;

export const hrSftUpdateAvailabilitySchema = z.object({
  availabilityId: z.string().trim().min(1),
  availabilityKind: hrSftAvailabilityKindSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  preferredTemplateId: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().max(500).nullable().optional(),
});

export type HrSftUpdateAvailabilityInput = z.infer<
  typeof hrSftUpdateAvailabilitySchema
>;

export const hrSftDeleteAvailabilitySchema = z.object({
  availabilityId: z.string().trim().min(1),
});

export const hrSftAvailabilityRowSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  availabilityKind: hrSftAvailabilityKindSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  preferredTemplateId: z.string().nullable(),
  reason: z.string().nullable(),
});

export type HrSftAvailabilityRow = z.infer<typeof hrSftAvailabilityRowSchema>;

/** HRM-SFT-009 — assign rest day or off day. */
export const hrSftAssignRestOrOffDaySchema = z.object({
  employeeId: z.string().trim().min(1),
  shiftDate: z.coerce.date(),
  assignmentKind: z.enum(["rest_day", "off_day"]),
  templateId: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type HrSftAssignRestOrOffDayInput = z.infer<
  typeof hrSftAssignRestOrOffDaySchema
>;

/** HRM-SFT-010 — schedule holiday shift assignment. */
export const hrSftAssignHolidayShiftSchema = z.object({
  employeeId: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  shiftDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
});

export type HrSftAssignHolidayShiftInput = z.infer<
  typeof hrSftAssignHolidayShiftSchema
>;

export const hrSftListAvailabilityQuerySchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

export type HrSftListAvailabilityQuery = z.infer<
  typeof hrSftListAvailabilityQuerySchema
>;
