import { z } from "zod";

export const HR_LIFECYCLE_PROBATION_OUTCOMES = [
  "confirmed",
  "extended",
  "termination_recommended",
] as const;

export const hrLifecycleProbationOutcomeSchema = z.enum(
  HR_LIFECYCLE_PROBATION_OUTCOMES,
);

export const hrLifecycleProbationOutcomeFormSchema = z
  .object({
    employeeId: z.string().min(1),
    outcome: hrLifecycleProbationOutcomeSchema,
    effectiveDate: z.coerce.date().optional(),
    probationEndDate: z.coerce.date().optional(),
    reason: z.string().trim().max(2000).optional(),
    approvalReference: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.outcome === "extended" && !value.probationEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Probation extension requires a new probation end date.",
        path: ["probationEndDate"],
      });
    }
  });

export const hrLifecycleConfirmEmploymentFormSchema = z.object({
  employeeId: z.string().min(1),
  effectiveDate: z.coerce.date().optional(),
  reason: z.string().trim().max(2000).optional(),
  approvalReference: z.string().trim().max(500).optional(),
});

function readLifecycleFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseHrLifecycleProbationOutcomeForm(formData: FormData) {
  const probationEndDateRaw = readLifecycleFormField(formData, "probationEndDate");
  return hrLifecycleProbationOutcomeFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    outcome: readLifecycleFormField(formData, "outcome"),
    effectiveDate: readLifecycleFormField(formData, "effectiveDate")
      ? new Date(readLifecycleFormField(formData, "effectiveDate")!)
      : undefined,
    probationEndDate: probationEndDateRaw
      ? new Date(probationEndDateRaw)
      : undefined,
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}

export function parseHrLifecycleConfirmEmploymentForm(formData: FormData) {
  const effectiveDateRaw = readLifecycleFormField(formData, "effectiveDate");
  return hrLifecycleConfirmEmploymentFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    effectiveDate: effectiveDateRaw ? new Date(effectiveDateRaw) : undefined,
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}
