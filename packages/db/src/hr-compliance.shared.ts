import type { hrComplianceWorkEligibility } from "./schema/hr";

type HrComplianceWorkEligibilityStatus =
  (typeof hrComplianceWorkEligibility.$inferSelect)["status"];

const AUTHORIZED_WORK_ELIGIBILITY_STATUSES = new Set<HrComplianceWorkEligibilityStatus>([
  "eligible",
  "conditional",
]);

export function formatHrEmployeeDisplayName(input: {
  preferredName: string | null | undefined;
  legalName: string | null | undefined;
}): string {
  return input.preferredName?.trim() || input.legalName?.trim() || "—";
}

export function buildPaginatedWindow<T>(input: {
  rows: readonly T[];
  pageSize: number;
  offset: number;
  totalCount: number;
}): {
  rows: readonly T[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
} {
  return {
    rows: input.rows,
    pageSize: input.pageSize,
    totalCount: input.totalCount,
    hasNextPage: input.offset + input.rows.length < input.totalCount,
  };
}

export function resolveWorkEligibilityVerifiedAt(input: {
  status: HrComplianceWorkEligibilityStatus;
  verifiedAt?: Date | null;
}): Date | null {
  if (input.verifiedAt !== undefined) {
    return input.verifiedAt;
  }

  return AUTHORIZED_WORK_ELIGIBILITY_STATUSES.has(input.status) ? new Date() : null;
}
