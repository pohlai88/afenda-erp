import { z } from "zod";

import {
  HR_MCP_CALENDAR_PERIOD_KINDS,
  HR_MCP_STATUTORY_DEADLINE_KINDS,
} from "./hr.payroll.mcp-constants.shared";
import {
  hrMcpEntityIdSchema,
  hrMcpFormDateInput,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-010 — country payroll calendar definition. */
export const hrMcpUpsertPayrollCalendarSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  legalEntitySetupId: hrMcpEntityIdSchema.nullable().optional(),
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  periodKind: z.enum(HR_MCP_CALENDAR_PERIOD_KINDS),
  payGroupCode: z.string().trim().max(64).nullable().optional(),
  calendarYear: z.coerce.number().int().min(2000).max(2100),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertPayrollCalendarInput = z.infer<
  typeof hrMcpUpsertPayrollCalendarSchema
>;

/** MCP-010 — pay period cutoff and pay dates within a calendar. */
export const hrMcpUpsertCalendarPeriodSchema = z
  .object({
    calendarId: hrMcpEntityIdSchema,
    periodCode: z.string().trim().min(1).max(64),
    periodStart: hrMcpFormDateInput,
    periodEnd: hrMcpFormDateInput,
    cutoffDate: hrMcpFormDateInput,
    payDate: hrMcpFormDateInput,
  })
  .superRefine((data, ctx) => {
    if (data.periodEnd < data.periodStart) {
      ctx.addIssue({
        code: "custom",
        message: "period_end must be on or after period_start",
        path: ["periodEnd"],
      });
    }
    if (data.cutoffDate < data.periodStart || data.cutoffDate > data.periodEnd) {
      ctx.addIssue({
        code: "custom",
        message: "cutoff_date must fall within the pay period",
        path: ["cutoffDate"],
      });
    }
  });

export type HrMcpUpsertCalendarPeriodInput = z.infer<
  typeof hrMcpUpsertCalendarPeriodSchema
>;

/** MCP-010 — public holidays by country. */
export const hrMcpUpsertPublicHolidaySchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  holidayDate: hrMcpFormDateInput,
  name: z.string().trim().min(1).max(256),
  regionCode: z.string().trim().max(32).nullable().optional(),
  recurringAnnually: z.coerce.boolean().default(false),
});

export type HrMcpUpsertPublicHolidayInput = z.infer<
  typeof hrMcpUpsertPublicHolidaySchema
>;

/** MCP-010 — statutory filing and payroll deadlines. */
export const hrMcpUpsertStatutoryDeadlineSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  deadlineKind: z.enum(HR_MCP_STATUTORY_DEADLINE_KINDS),
  dueDate: hrMcpFormDateInput,
  periodRef: z.string().trim().max(64).nullable().optional(),
  description: z.string().trim().max(512).nullable().optional(),
});

export type HrMcpUpsertStatutoryDeadlineInput = z.infer<
  typeof hrMcpUpsertStatutoryDeadlineSchema
>;

export const hrMcpPayrollCalendarRecordSchema =
  hrMcpUpsertPayrollCalendarSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export const hrMcpCalendarPeriodRecordSchema = hrMcpUpsertCalendarPeriodSchema.extend({
  id: hrMcpEntityIdSchema,
  organizationId: hrMcpEntityIdSchema,
});

export const hrMcpPublicHolidayRecordSchema = hrMcpUpsertPublicHolidaySchema.extend({
  id: hrMcpEntityIdSchema,
  organizationId: hrMcpEntityIdSchema,
});

export const hrMcpStatutoryDeadlineRecordSchema =
  hrMcpUpsertStatutoryDeadlineSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export const hrMcpUpsertPayrollCalendarFormSchema = hrMcpUpsertPayrollCalendarSchema;
export const hrMcpUpsertCalendarPeriodFormSchema = hrMcpUpsertCalendarPeriodSchema;
export const hrMcpUpsertPublicHolidayFormSchema = hrMcpUpsertPublicHolidaySchema;
export const hrMcpUpsertStatutoryDeadlineFormSchema =
  hrMcpUpsertStatutoryDeadlineSchema;
