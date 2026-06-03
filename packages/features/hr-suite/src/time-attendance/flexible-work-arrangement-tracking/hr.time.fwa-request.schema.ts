import { z } from "zod";

import { hrFwaArrangementKindSchema } from "./hr.time.fwa-arrangement-types.schema";
import { hrFwaSchedulePatternDetailsSchema } from "./hr.time.fwa-schedule.schema";

const hrFwaRequestDateRangeRefinement = (
  value: { startDate: Date; endDate?: Date | null },
  ctx: z.RefinementCtx,
) => {
  if (value.endDate && value.endDate.getTime() < value.startDate.getTime()) {
    ctx.addIssue({
      code: "custom",
      message: "End date must be on or after start date.",
      path: ["endDate"],
    });
  }
};

/** HRM-FWA-006 — employee self-service request payload. */
export const submitHrFwaEmployeeRequestFormSchema = z
  .object({
    arrangementKind: hrFwaArrangementKindSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    reason: z.string().trim().min(1, "Reason is required.").max(4000),
    policyGroupCode: z.string().trim().optional(),
    remoteLocationId: z.string().trim().optional(),
    supportingDocumentId: z.string().trim().optional(),
    exceptionRequested: z.coerce.boolean().optional(),
    schedulePatternLabel: z.string().trim().optional(),
    schedulePatternDetails: hrFwaSchedulePatternDetailsSchema.optional(),
  })
  .superRefine(hrFwaRequestDateRangeRefinement);

/** HRM-FWA-005 / FWA-006 — manager or HR initiated arrangement. */
export const initiateHrFwaRequestFormSchema = z
  .object({
    employeeId: z.string().trim().min(1, "Employee is required."),
    arrangementKind: hrFwaArrangementKindSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    reason: z.string().trim().min(1, "Reason is required.").max(4000),
    policyGroupCode: z.string().trim().optional(),
    remoteLocationId: z.string().trim().optional(),
    supportingDocumentId: z.string().trim().optional(),
    exceptionRequested: z.coerce.boolean().optional(),
    initiatorKind: z.enum(["manager", "hr"]).default("manager"),
    schedulePatternLabel: z.string().trim().optional(),
    schedulePatternDetails: hrFwaSchedulePatternDetailsSchema.optional(),
  })
  .superRefine(hrFwaRequestDateRangeRefinement);

export type SubmitHrFwaEmployeeRequestFormInput = z.infer<
  typeof submitHrFwaEmployeeRequestFormSchema
>;

export type InitiateHrFwaRequestFormInput = z.infer<
  typeof initiateHrFwaRequestFormSchema
>;

function readOptionalBoolean(formData: FormData, key: string): boolean | undefined {
  const raw = formData.get(key);
  if (raw === null || raw === "") return undefined;
  if (raw === "true" || raw === "on" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return undefined;
}

function readSchedulePatternDetails(formData: FormData) {
  const raw = formData.get("schedulePatternDetails");
  if (typeof raw !== "string" || !raw.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

export function parseSubmitHrFwaEmployeeRequestForm(formData: FormData) {
  const schedulePatternDetails = readSchedulePatternDetails(formData);
  return submitHrFwaEmployeeRequestFormSchema.safeParse({
    arrangementKind: formData.get("arrangementKind"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") ?? undefined,
    reason: formData.get("reason"),
    policyGroupCode: formData.get("policyGroupCode") ?? undefined,
    remoteLocationId: formData.get("remoteLocationId") ?? undefined,
    supportingDocumentId: formData.get("supportingDocumentId") ?? undefined,
    exceptionRequested: readOptionalBoolean(formData, "exceptionRequested"),
    schedulePatternLabel: formData.get("schedulePatternLabel") ?? undefined,
    schedulePatternDetails,
  });
}

export function parseInitiateHrFwaRequestForm(formData: FormData) {
  const schedulePatternDetails = readSchedulePatternDetails(formData);
  return initiateHrFwaRequestFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    arrangementKind: formData.get("arrangementKind"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") ?? undefined,
    reason: formData.get("reason"),
    policyGroupCode: formData.get("policyGroupCode") ?? undefined,
    remoteLocationId: formData.get("remoteLocationId") ?? undefined,
    supportingDocumentId: formData.get("supportingDocumentId") ?? undefined,
    exceptionRequested: readOptionalBoolean(formData, "exceptionRequested"),
    initiatorKind: formData.get("initiatorKind") ?? "manager",
    schedulePatternLabel: formData.get("schedulePatternLabel") ?? undefined,
    schedulePatternDetails,
  });
}
