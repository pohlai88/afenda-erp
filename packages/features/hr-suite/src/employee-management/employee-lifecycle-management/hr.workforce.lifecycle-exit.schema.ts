import { z } from "zod";

export const hrLifecycleNoticePeriodFormSchema = z.object({
  employeeId: z.string().min(1),
  effectiveDate: z.coerce.date().optional(),
  lastWorkingDate: z.coerce.date().optional(),
  reason: z.string().trim().min(1).max(2000),
  approvalReference: z.string().trim().max(500).optional(),
});

export const hrLifecycleStartOffboardingFormSchema = z.object({
  employeeId: z.string().min(1),
  effectiveDate: z.coerce.date().optional(),
  lastWorkingDate: z.coerce.date().optional(),
  reason: z.string().trim().min(1).max(2000),
  approvalReference: z.string().trim().max(500).optional(),
});

export const hrLifecycleStartOnboardingFormSchema = z.object({
  employeeId: z.string().min(1),
  reason: z.string().trim().max(2000).optional(),
  targetStatus: z.enum(["active", "confirmed", "probation"]).optional(),
});

function readLifecycleFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseHrLifecycleNoticePeriodForm(formData: FormData) {
  const effectiveDateRaw = readLifecycleFormField(formData, "effectiveDate");
  const lastWorkingDateRaw = readLifecycleFormField(formData, "lastWorkingDate");
  return hrLifecycleNoticePeriodFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    effectiveDate: effectiveDateRaw ? new Date(effectiveDateRaw) : undefined,
    lastWorkingDate: lastWorkingDateRaw ? new Date(lastWorkingDateRaw) : undefined,
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}

export function parseHrLifecycleStartOffboardingForm(formData: FormData) {
  const effectiveDateRaw = readLifecycleFormField(formData, "effectiveDate");
  const lastWorkingDateRaw = readLifecycleFormField(formData, "lastWorkingDate");
  return hrLifecycleStartOffboardingFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    effectiveDate: effectiveDateRaw ? new Date(effectiveDateRaw) : undefined,
    lastWorkingDate: lastWorkingDateRaw ? new Date(lastWorkingDateRaw) : undefined,
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}

export function parseHrLifecycleStartOnboardingForm(formData: FormData) {
  return hrLifecycleStartOnboardingFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    reason: readLifecycleFormField(formData, "reason"),
    targetStatus: readLifecycleFormField(formData, "targetStatus"),
  });
}
