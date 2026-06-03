import {
  computeOtmDurationMinutesFromTimeRange,
  HRM_OTM_DAY_CATEGORIES,
  HRM_OTM_TIMING_KINDS,
} from "@afenda/db";
import { z } from "zod";

const hrTimeOtmTimeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}:\d{2}$/, "Use HH:mm format.");

/** HRM-OTM-002 — overtime request payload (date, time range, type, reason). */
const hrTimeOtmRequestCoreSchema = z
  .object({
    workDate: z.coerce.date(),
    startTime: hrTimeOtmTimeSchema.optional(),
    endTime: hrTimeOtmTimeSchema.optional(),
    hours: z.coerce.number().positive().max(24).optional(),
    overtimeType: z.enum(HRM_OTM_DAY_CATEGORIES),
    timingKind: z.enum(HRM_OTM_TIMING_KINDS).default("planned"),
    reason: z.string().trim().min(1, "Reason is required.").max(4000),
    policyGroupCode: z.string().trim().optional(),
    eligibilityExceptionReason: z.string().trim().max(4000).optional(),
  })
  .superRefine((value, ctx) => {
    const hasHours = value.hours !== undefined && Number.isFinite(value.hours);
    const hasStart = Boolean(value.startTime?.trim());
    const hasEnd = Boolean(value.endTime?.trim());

    if (hasHours && (hasStart || hasEnd)) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either hours or a start/end time range — not both.",
        path: ["hours"],
      });
      return;
    }

    if (!hasHours && !(hasStart && hasEnd)) {
      ctx.addIssue({
        code: "custom",
        message: "Provide hours or both start and end times.",
        path: ["hours"],
      });
      return;
    }

    if (hasStart && hasEnd) {
      const minutes = computeOtmDurationMinutesFromTimeRange({
        startTime: value.startTime!,
        endTime: value.endTime!,
      });
      if (minutes === null || minutes <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "End time must be after start time.",
          path: ["endTime"],
        });
      }
    }
  });

/** HRM-OTM-001 — employee self-service submit. */
export const requestOwnOtmFormSchema = hrTimeOtmRequestCoreSchema;

/** HRM-OTM-001 — manager or HR on-behalf submit. */
export const applyOtmOnBehalfFormSchema = hrTimeOtmRequestCoreSchema.extend({
  employeeId: z.string().trim().min(1, "Employee is required."),
});

export type RequestOwnOtmFormInput = z.infer<typeof requestOwnOtmFormSchema>;
export type ApplyOtmOnBehalfFormInput = z.infer<typeof applyOtmOnBehalfFormSchema>;

function readOptionalString(formData: FormData, key: string): string | undefined {
  const raw = formData.get(key);
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readFormObject(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData.entries());
}

export function parseRequestOwnOtmForm(formData: FormData) {
  return requestOwnOtmFormSchema.safeParse(readFormObject(formData));
}

export function parseApplyOtmOnBehalfForm(formData: FormData) {
  return applyOtmOnBehalfFormSchema.safeParse(readFormObject(formData));
}

export function resolveOtmSubmitHours(input: {
  hours?: number;
  startTime?: string;
  endTime?: string;
}): number {
  if (input.hours !== undefined && Number.isFinite(input.hours)) {
    return input.hours;
  }
  if (input.startTime && input.endTime) {
    const minutes = computeOtmDurationMinutesFromTimeRange({
      startTime: input.startTime,
      endTime: input.endTime,
    });
    if (minutes === null || minutes <= 0) {
      throw new Error("invalid_time_range");
    }
    return minutes / 60;
  }
  throw new Error("invalid_hours");
}

export { readOptionalString };
