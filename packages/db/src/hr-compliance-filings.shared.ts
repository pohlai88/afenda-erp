import { eq } from "drizzle-orm";

import { hrComplianceObligations } from "./hr";

export const HR_COMPLIANCE_FILING_REQUIREMENT_KIND = "filing" as const;

export const activeFilingObligationKindCondition = eq(
  hrComplianceObligations.requirementKind,
  HR_COMPLIANCE_FILING_REQUIREMENT_KIND,
);

export function resolveFilingSubmittedAt(input: {
  status: "pending" | "submitted" | "confirmed" | "overdue" | "waived";
  submittedAt?: Date | null;
  existingSubmittedAt: Date | null;
}): Date | null {
  if (input.status === "submitted" || input.status === "confirmed") {
    return input.submittedAt ?? input.existingSubmittedAt ?? new Date();
  }

  return null;
}

export function resolveFilingConfirmedAt(input: {
  status: "pending" | "submitted" | "confirmed" | "overdue" | "waived";
  confirmedAt?: Date | null;
  existingConfirmedAt: Date | null;
}): Date | null {
  if (input.status === "confirmed") {
    return input.confirmedAt ?? input.existingConfirmedAt ?? new Date();
  }

  return null;
}

export function isPendingLikeFilingStatus(
  status: "pending" | "submitted" | "confirmed" | "overdue" | "waived",
): boolean {
  return status === "pending" || status === "overdue";
}
