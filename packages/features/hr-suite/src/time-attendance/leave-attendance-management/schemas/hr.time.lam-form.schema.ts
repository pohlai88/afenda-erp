import { z } from "zod";

export const hrLamLeaveTypeSchema = z.enum([
  "annual",
  "sick",
  "medical",
  "unpaid",
  "maternity",
  "paternity",
  "compassionate",
  "emergency",
  "study",
  "replacement",
  "hospitalization",
  "other",
]);

export const hrLamAttendanceDayStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "early_out",
  "half_day",
  "rest_day",
  "off_day",
  "public_holiday",
  "missing_punch",
]);

export const hrLamLeaveApplicationFormSchema = z.object({
  employeeId: z.string().trim().min(1),
  leaveType: hrLamLeaveTypeSchema,
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  reason: z.string().trim().max(2000).optional(),
  supportingDocumentId: z.string().trim().optional(),
  policyGroupCode: z.string().trim().optional(),
});

export const hrLamAttendanceDayFormSchema = z.object({
  employeeId: z.string().trim().min(1),
  workDate: z.coerce.date(),
  workCalendarCode: z.string().trim().optional(),
  status: hrLamAttendanceDayStatusSchema,
  notes: z.string().trim().max(2000).optional(),
});

export function parseHrLamLeaveApplicationForm(formData: FormData) {
  return hrLamLeaveApplicationFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    leaveType: formData.get("leaveType"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    reason: formData.get("reason") ?? undefined,
    supportingDocumentId: formData.get("supportingDocumentId") ?? undefined,
    policyGroupCode: formData.get("policyGroupCode") ?? undefined,
  });
}

export function parseHrLamAttendanceDayForm(formData: FormData) {
  return hrLamAttendanceDayFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    workDate: formData.get("workDate"),
    workCalendarCode: formData.get("workCalendarCode") ?? undefined,
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
}

export function formatHrLamLeaveTypeLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function formatHrLamAttendanceStatusLabel(value: string): string {
  return value.replace(/_/g, " ");
}
