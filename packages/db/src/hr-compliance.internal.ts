import { and, eq, isNull, or } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { HrComplianceCommandError } from "./hr-compliance.types";
import { hrComplianceExceptions, hrComplianceObligations, hrEmployees } from "./schema/hr";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export function normalizeScopeCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function normalizeScopeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function appendExactOrNullScopeFilter(
  conditions: Parameters<typeof and>[0][],
  column:
    | typeof hrComplianceObligations.countryCode
    | typeof hrComplianceObligations.legalEntityCode
    | typeof hrComplianceObligations.workLocationCode
    | typeof hrComplianceObligations.employmentType
    | typeof hrComplianceObligations.workerCategory,
  value: string | null | undefined,
  transform: (next: string) => string = (next) => next,
) {
  const trimmed = value?.trim();
  if (!trimmed) return;
  conditions.push(or(isNull(column), eq(column, transform(trimmed)))!);
}

export function activeEmployeeFilters(organizationId: string) {
  return and(
    eq(hrEmployees.organizationId, organizationId),
    isNull(hrEmployees.archivedAt),
    eq(hrEmployees.employmentStatus, "active"),
  );
}

export function assertExceptionIsOpen(
  status: (typeof hrComplianceExceptions.$inferSelect)["status"],
): void {
  if (status === "resolved" || status === "waived") {
    throw new HrComplianceCommandError("exception_not_open");
  }
}

export async function loadComplianceExceptionForMutation(
  db: AfendaTransaction,
  input: { organizationId: string; exceptionId: string },
): Promise<{
  id: string;
  status: (typeof hrComplianceExceptions.$inferSelect)["status"];
  correctiveActionDescription: string | null;
}> {
  const [exception] = await db
    .select({
      id: hrComplianceExceptions.id,
      status: hrComplianceExceptions.status,
      correctiveActionDescription:
        hrComplianceExceptions.correctiveActionDescription,
    })
    .from(hrComplianceExceptions)
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        eq(hrComplianceExceptions.id, input.exceptionId),
      ),
    )
    .limit(1);

  if (!exception) {
    throw new HrComplianceCommandError("exception_not_found");
  }

  assertExceptionIsOpen(exception.status);
  return exception;
}
