import { and, asc, desc, eq, gte, ilike, isNotNull, isNull, lt, lte, ne, or, sql } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { HrComplianceCommandError } from "./hr-compliance.types";
import { HR_COMPLIANCE_AT_RISK_WINDOW_MS } from "./hr-compliance.shared";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceObligations,
  hrEmployees,
} from "./hr";

type TrackedRequirementStatus =
  (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];

/** Matches HRM-CMP-015 at-risk window used by feature-layer derivation. */
const REQUIREMENT_AT_RISK_WINDOW_MS = HR_COMPLIANCE_AT_RISK_WINDOW_MS;

/**
 * Derived-only posture tokens are not persisted — overdue/at_risk come from pending + dueDate.
 */
export function normalizeStoredRequirementStatusForMutation(
  status: TrackedRequirementStatus,
): TrackedRequirementStatus {
  if (status === "overdue" || status === "at_risk") {
    return "pending";
  }

  return status;
}

export function parseEffectiveRequirementStatusSearchToken(
  search: string,
): "overdue" | "at_risk" | "missing" | null {
  const normalized = search.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "overdue") {
    return "overdue";
  }
  if (normalized === "at_risk") {
    return "at_risk";
  }
  if (normalized === "missing") {
    return "missing";
  }
  return null;
}

export function appendEmployeeRequirementWindowSearchCondition(
  conditions: Parameters<typeof and>[0][],
  input: {
    search?: string;
    employeeNumber: typeof hrEmployees.employeeNumber;
    legalName: typeof hrEmployees.legalName;
    preferredName: typeof hrEmployees.preferredName;
    obligationCode: typeof hrComplianceObligations.code;
    obligationTitle: typeof hrComplianceObligations.title;
    complianceArea: typeof hrComplianceObligations.complianceArea;
    requirementStatus: typeof hrComplianceEmployeeRequirements.status;
    requirementDueDate: typeof hrComplianceEmployeeRequirements.dueDate;
  },
) {
  const trimmedSearch = input.search?.trim();
  if (!trimmedSearch) {
    return;
  }

  const derivedStatusToken =
    parseEffectiveRequirementStatusSearchToken(trimmedSearch);
  if (derivedStatusToken === "missing") {
    conditions.push(
      buildEmployeeRequirementMissingSearchCondition(input.requirementStatus),
    );
    return;
  }
  if (derivedStatusToken) {
    conditions.push(
      buildEmployeeRequirementDerivedStatusSearchCondition(
        derivedStatusToken,
        input.requirementStatus,
        input.requirementDueDate,
      ),
    );
    return;
  }

  const pattern = `%${trimmedSearch}%`;
  conditions.push(
    or(
      ilike(input.employeeNumber, pattern),
      ilike(input.legalName, pattern),
      ilike(input.preferredName, pattern),
      ilike(input.obligationCode, pattern),
      ilike(input.obligationTitle, pattern),
      ilike(input.complianceArea, pattern),
      ilike(sql`${input.requirementStatus}::text`, pattern),
    )!,
  );
}

export function buildEmployeeRequirementDerivedStatusSearchCondition(
  token: "overdue" | "at_risk",
  statusColumn: typeof hrComplianceEmployeeRequirements.status,
  dueDateColumn: typeof hrComplianceEmployeeRequirements.dueDate,
  now: Date = new Date(),
) {
  if (token === "overdue") {
    return or(
      eq(statusColumn, "overdue"),
      and(
        eq(statusColumn, "pending"),
        isNotNull(dueDateColumn),
        lt(dueDateColumn, now),
      ),
    )!;
  }

  const atRiskCutoff = new Date(now.getTime() + REQUIREMENT_AT_RISK_WINDOW_MS);
  return or(
    eq(statusColumn, "at_risk"),
    and(
      eq(statusColumn, "pending"),
      isNotNull(dueDateColumn),
      gte(dueDateColumn, now),
      lte(dueDateColumn, atRiskCutoff),
    ),
  )!;
}

/** HRM-CMP-014 — mandatory acknowledgments not yet recorded. */
export function buildEmployeeRequirementMissingSearchCondition(
  statusColumn: typeof hrComplianceEmployeeRequirements.status,
) {
  return and(ne(statusColumn, "compliant"), ne(statusColumn, "waived"))!;
}

/** HRM-CMP-013 — overdue and expired training rows surface before compliant rows. */
export function buildEmployeeRequirementOverdueFirstOrderBy(input: {
  statusColumn: typeof hrComplianceEmployeeRequirements.status;
  dueDateColumn: typeof hrComplianceEmployeeRequirements.dueDate;
  updatedAtColumn: typeof hrComplianceEmployeeRequirements.updatedAt;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const atRiskCutoff = new Date(now.getTime() + REQUIREMENT_AT_RISK_WINDOW_MS);

  return [
    sql`CASE
      WHEN ${input.statusColumn} = 'pending' AND ${input.dueDateColumn} IS NOT NULL AND ${input.dueDateColumn} < ${now} THEN 0
      WHEN ${input.statusColumn} = 'compliant' AND ${input.dueDateColumn} IS NOT NULL AND ${input.dueDateColumn} < ${now} THEN 1
      WHEN ${input.statusColumn} = 'pending' AND ${input.dueDateColumn} IS NOT NULL AND ${input.dueDateColumn} >= ${now} AND ${input.dueDateColumn} <= ${atRiskCutoff} THEN 2
      WHEN ${input.statusColumn} = 'compliant' AND ${input.dueDateColumn} IS NOT NULL AND ${input.dueDateColumn} >= ${now} AND ${input.dueDateColumn} <= ${atRiskCutoff} THEN 2
      WHEN ${input.statusColumn} IN ('pending', 'non_compliant', 'overdue', 'at_risk', 'expired') THEN 3
      ELSE 4
    END`,
    sql`CASE WHEN ${input.dueDateColumn} IS NULL THEN 1 ELSE 0 END`,
    asc(input.dueDateColumn),
    desc(input.updatedAtColumn),
  ];
}

/** HRM-CMP-014 — missing acknowledgments surface before compliant rows. */
export function buildEmployeeRequirementMissingFirstOrderBy(input: {
  statusColumn: typeof hrComplianceEmployeeRequirements.status;
  dueDateColumn: typeof hrComplianceEmployeeRequirements.dueDate;
  updatedAtColumn: typeof hrComplianceEmployeeRequirements.updatedAt;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const atRiskCutoff = new Date(now.getTime() + REQUIREMENT_AT_RISK_WINDOW_MS);

  return [
    sql`CASE
      WHEN ${input.statusColumn} NOT IN ('compliant', 'waived') AND ${input.dueDateColumn} IS NOT NULL AND ${input.dueDateColumn} < ${now} THEN 0
      WHEN ${input.statusColumn} NOT IN ('compliant', 'waived') AND ${input.dueDateColumn} IS NOT NULL AND ${input.dueDateColumn} >= ${now} AND ${input.dueDateColumn} <= ${atRiskCutoff} THEN 1
      WHEN ${input.statusColumn} NOT IN ('compliant', 'waived') THEN 2
      ELSE 3
    END`,
    sql`CASE WHEN ${input.dueDateColumn} IS NULL THEN 1 ELSE 0 END`,
    asc(input.dueDateColumn),
    desc(input.updatedAtColumn),
  ];
}

/**
 * Certification-tracked requirements store operator expiry on `dueDate` once
 * status leaves `pending`. Obligation template due dates sync only for pending rows.
 */
export function resolveTrackedRequirementDueDateSync(input: {
  trackedId: string;
  trackedStatus: TrackedRequirementStatus;
  trackedDueDate: Date | null | undefined;
  obligationDueDate: Date | null | undefined;
  syncDueDateWhenNotPending: boolean;
}): { id: string; dueDate: Date | null } | null {
  if (
    !input.syncDueDateWhenNotPending &&
    input.trackedStatus !== "pending"
  ) {
    return null;
  }

  const obligationDueMs = input.obligationDueDate?.getTime() ?? null;
  const trackedDueMs = input.trackedDueDate?.getTime() ?? null;
  if (obligationDueMs === trackedDueMs) {
    return null;
  }

  return {
    id: input.trackedId,
    dueDate: input.obligationDueDate ?? null,
  };
}

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

export async function assertComplianceOwnerEmployeeInOrg(
  db: AfendaTransaction,
  input: { organizationId: string; employeeId: string },
): Promise<void> {
  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.id, input.employeeId),
        activeEmployeeFilters(input.organizationId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrComplianceCommandError("corrective_action_owner_not_found");
  }
}
