import { z } from "zod";

export const hrLifecycleContractRenewalFormSchema = z
  .object({
    employeeId: z.string().min(1),
    contractEndDate: z.coerce.date(),
    effectiveDate: z.coerce.date().optional(),
    reason: z.string().trim().min(1).max(2000),
    approvalReference: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    const effectiveDate = value.effectiveDate ?? new Date();
    if (value.contractEndDate <= effectiveDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Renewed contract end date must be after the effective date.",
        path: ["contractEndDate"],
      });
    }
  });

function readLifecycleFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseHrLifecycleContractRenewalForm(formData: FormData) {
  const contractEndDateRaw = readLifecycleFormField(
    formData,
    "contractEndDate",
  );
  const effectiveDateRaw = readLifecycleFormField(formData, "effectiveDate");

  return hrLifecycleContractRenewalFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    contractEndDate: contractEndDateRaw
      ? new Date(contractEndDateRaw)
      : undefined,
    effectiveDate: effectiveDateRaw ? new Date(effectiveDateRaw) : undefined,
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}
