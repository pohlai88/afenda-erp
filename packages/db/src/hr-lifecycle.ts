import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { adjustHrBenefitCoverageForEmploymentStatusInTx } from "./hr-benefits-coverage";
import { createEntityId } from "./ids";
import { upsertHrEmployeeEffectiveAssignmentInTx,
  type HrEmployeePlacementInput,
} from "./hr-commands";
import { listOrganizationsForCoreErpSeed } from "./erp";
import {
  hrEmployees,
  hrLifecycleEvents,
  hrLifecycleTransitions,
  hrOffboardingCases,
} from "./schema/hr";

export type HrEmploymentStatus =
  (typeof hrEmployees.$inferSelect)["employmentStatus"];

export type HrLifecycleTransitionStatus =
  "pending" | "applied" | "cancelled" | "rejected" | "failed";

export type HrProbationOutcome = "confirmed" | "extended" | "termination_recommended";

export type HrMovementKind =
  | "promotion"
  | "transfer"
  | "demotion"
  | "job_change"
  | "department_change"
  | "manager_change"
  | "grade_change"
  | "location_change";

const TERMINAL_STATUSES = new Set<HrEmploymentStatus>([
  "separated",
  "retired",
  "archived",
]);

const ALLOWED_EMPLOYMENT_TRANSITIONS: Record<
  HrEmploymentStatus,
  readonly HrEmploymentStatus[]
> = {
  onboarding: [
    "probation",
    "confirmed",
    "active",
    "suspended",
    "terminated",
    "separated",
  ],
  active: [
    "probation",
    "confirmed",
    "suspended",
    "notice_period",
    "offboarding",
    "terminated",
    "separated",
    "retired",
  ],
  probation: ["active", "confirmed", "suspended", "terminated", "separated"],
  confirmed: [
    "active",
    "probation",
    "suspended",
    "notice_period",
    "offboarding",
    "terminated",
    "separated",
    "retired",
  ],
  suspended: [
    "active",
    "confirmed",
    "probation",
    "onboarding",
    "notice_period",
    "offboarding",
    "terminated",
    "separated",
    "retired",
  ],
  notice_period: [
    "offboarding",
    "terminated",
    "separated",
    "retired",
    "active",
    "confirmed",
  ],
  offboarding: ["terminated", "separated", "retired"],
  terminated: ["archived", "separated"],
  separated: [],
  retired: [],
  archived: [],
};

export function assertHrEmploymentStatusTransition(
  fromStatus: HrEmploymentStatus,
  toStatus: HrEmploymentStatus,
) {
  if (fromStatus === toStatus) {
    return;
  }
  if (TERMINAL_STATUSES.has(fromStatus)) {
    throw new HrLifecycleCommandError(
      "invalid_status_transition",
      `Cannot transition from terminal status "${fromStatus}".`,
    );
  }
  const allowed = ALLOWED_EMPLOYMENT_TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new HrLifecycleCommandError(
      "invalid_status_transition",
      `Transition from "${fromStatus}" to "${toStatus}" is not allowed.`,
    );
  }
}

export type HrLifecycleOverviewRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  stage: HrEmploymentStatus | "archived";
  probationEndDate: Date | null;
  confirmationDate: Date | null;
  pendingTransitionCount: number;
  nextEffectiveDate: Date | null;
};

export type HrLifecycleOverviewWindow = {
  rows: readonly HrLifecycleOverviewRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrLifecycleEventRow = {
  id: string;
  employeeId: string;
  kind: string;
  previousStatus: HrEmploymentStatus | null;
  newStatus: HrEmploymentStatus | null;
  effectiveDate: Date;
  reason: string | null;
  approvalReference: string | null;
  createdAt: Date;
};

const HR_LIFECYCLE_DEFAULT_PAGE_SIZE = 25;
const HR_LIFECYCLE_MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return HR_LIFECYCLE_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return HR_LIFECYCLE_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_LIFECYCLE_MAX_PAGE_SIZE);
}

export class HrLifecycleCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "employee_archived"
    | "invalid_status_transition"
    | "transition_not_found"
    | "transition_not_pending";

  constructor(
    code: HrLifecycleCommandError["code"],
    message?: string,
  ) {
    super(message ?? code);
    this.code = code;
  }
}

async function assertLifecycleEmployeeWritable(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
) {
  const [employee] = await db
    .select({
      id: hrEmployees.id,
      archivedAt: hrEmployees.archivedAt,
      employmentStatus: hrEmployees.employmentStatus,
    })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, organizationId),
        eq(hrEmployees.id, employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrLifecycleCommandError("employee_not_found");
  }
  if (employee.archivedAt) {
    throw new HrLifecycleCommandError("employee_archived");
  }

  return employee;
}

async function insertLifecycleEvent(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    kind: string;
    previousStatus: HrEmploymentStatus | null;
    newStatus: HrEmploymentStatus | null;
    effectiveDate: Date;
    reason?: string | null;
    approvalReference?: string | null;
  },
): Promise<string> {
  const eventId = createEntityId("hr_lcy_evt");
  await db.insert(hrLifecycleEvents).values({
    id: eventId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    kind: input.kind,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    effectiveDate: input.effectiveDate,
    reason: input.reason?.trim() || null,
    approvalReference: input.approvalReference?.trim() || null,
  });
  return eventId;
}

async function applyEmploymentStatusChange(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    toStatus: HrEmploymentStatus;
    effectiveDate: Date;
    reason?: string | null;
    approvalReference?: string | null;
    eventKind?: string;
    confirmationDate?: Date | null;
    probationEndDate?: Date | null;
  },
): Promise<{ eventId: string; previousStatus: HrEmploymentStatus }> {
  const employee = await assertLifecycleEmployeeWritable(
    db,
    input.organizationId,
    input.employeeId,
  );

  assertHrEmploymentStatusTransition(
    employee.employmentStatus,
    input.toStatus,
  );

  const eventId = await insertLifecycleEvent(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    kind: input.eventKind ?? "employment_status_change",
    previousStatus: employee.employmentStatus,
    newStatus: input.toStatus,
    effectiveDate: input.effectiveDate,
    reason: input.reason,
    approvalReference: input.approvalReference,
  });

  await db
    .update(hrEmployees)
    .set({
      employmentStatus: input.toStatus,
      ...(input.confirmationDate !== undefined
        ? { confirmationDate: input.confirmationDate }
        : input.toStatus === "confirmed"
          ? { confirmationDate: input.effectiveDate }
          : {}),
      ...(input.probationEndDate !== undefined
        ? { probationEndDate: input.probationEndDate }
        : {}),
    })
    .where(eq(hrEmployees.id, input.employeeId));

  await adjustHrBenefitCoverageForEmploymentStatusInTx(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    employmentStatus: input.toStatus,
    effectiveDate: input.effectiveDate,
    actorUserId: null,
  });

  return { eventId, previousStatus: employee.employmentStatus };
}

export async function listHrLifecycleOverviewWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employmentStatus?: HrEmploymentStatus;
}): Promise<HrLifecycleOverviewWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      isNull(hrEmployees.archivedAt),
    ];

    if (input.employmentStatus) {
      conditions.push(eq(hrEmployees.employmentStatus, input.employmentStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employmentStatus: hrEmployees.employmentStatus,
        probationEndDate: hrEmployees.probationEndDate,
        confirmationDate: hrEmployees.confirmationDate,
      })
      .from(hrEmployees)
      .where(whereClause)
      .orderBy(desc(hrEmployees.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const employeeIds = rows.map((row) => row.id);
    const pendingByEmployee = new Map<
      string,
      { count: number; nextEffectiveDate: Date | null }
    >();

    if (employeeIds.length > 0) {
      const pendingRows = await db
        .select({
          employeeId: hrLifecycleTransitions.employeeId,
          pendingCount: count(),
          nextEffectiveDate: sql<Date>`min(${hrLifecycleTransitions.effectiveDate})`,
        })
        .from(hrLifecycleTransitions)
        .where(
          and(
            eq(hrLifecycleTransitions.organizationId, input.organizationId),
            eq(hrLifecycleTransitions.status, "pending"),
            inArray(hrLifecycleTransitions.employeeId, employeeIds),
          ),
        )
        .groupBy(hrLifecycleTransitions.employeeId);

      for (const row of pendingRows) {
        pendingByEmployee.set(row.employeeId, {
          count: Number(row.pendingCount ?? 0),
          nextEffectiveDate: row.nextEffectiveDate ?? null,
        });
      }
    }

    const mapped: HrLifecycleOverviewRow[] = rows.map((row) => {
      const pending = pendingByEmployee.get(row.id);
      return {
        id: row.id,
        employeeNumber: row.employeeNumber,
        displayName: row.preferredName?.trim() || row.legalName,
        employmentStatus: row.employmentStatus,
        stage: row.employmentStatus,
        probationEndDate: row.probationEndDate,
        confirmationDate: row.confirmationDate,
        pendingTransitionCount: pending?.count ?? 0,
        nextEffectiveDate: pending?.nextEffectiveDate ?? null,
      };
    });

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrLifecycleProbationDueRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  probationEndDate: Date;
};

export type HrLifecycleProbationDueWindow = {
  rows: readonly HrLifecycleProbationDueRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

const PROBATION_REVIEW_HORIZON_DAYS = 30;
const CONTRACT_REVIEW_HORIZON_DAYS = 60;

export async function listHrLifecycleProbationDueWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  asOf?: Date;
}): Promise<HrLifecycleProbationDueWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const asOf = input.asOf ?? new Date();
  const horizon = new Date(asOf);
  horizon.setDate(horizon.getDate() + PROBATION_REVIEW_HORIZON_DAYS);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      eq(hrEmployees.employmentStatus, "probation"),
      isNull(hrEmployees.archivedAt),
      isNotNull(hrEmployees.probationEndDate),
      lte(hrEmployees.probationEndDate, horizon),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employmentStatus: hrEmployees.employmentStatus,
        probationEndDate: hrEmployees.probationEndDate,
      })
      .from(hrEmployees)
      .where(whereClause)
      .orderBy(hrEmployees.probationEndDate)
      .limit(pageSize)
      .offset(offset);

    const mapped: HrLifecycleProbationDueRow[] = rows
      .filter((row) => row.probationEndDate)
      .map((row) => ({
        id: row.id,
        employeeNumber: row.employeeNumber,
        displayName: row.preferredName?.trim() || row.legalName,
        employmentStatus: row.employmentStatus,
        probationEndDate: row.probationEndDate!,
      }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrLifecycleContractReviewRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  employmentType: string | null;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  contractEndDate: Date;
  hrOwnerEmployeeId: string | null;
  managerEmployeeId: string | null;
};

export type HrLifecycleContractReviewWindow = {
  rows: readonly HrLifecycleContractReviewRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrLifecycleContractReviewWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  asOf?: Date;
}): Promise<HrLifecycleContractReviewWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const asOf = input.asOf ?? new Date();
  const horizon = new Date(asOf);
  horizon.setDate(horizon.getDate() + CONTRACT_REVIEW_HORIZON_DAYS);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      isNull(hrEmployees.archivedAt),
      isNotNull(hrEmployees.contractEndDate),
      lte(hrEmployees.contractEndDate, horizon),
      notInArray(hrEmployees.employmentStatus, [
        "separated",
        "retired",
        "archived",
      ]),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrEmployees.employmentType, pattern),
          ilike(hrEmployees.legalEntityCode, pattern),
          ilike(hrEmployees.workLocationCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employmentStatus: hrEmployees.employmentStatus,
        employmentType: hrEmployees.employmentType,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        contractEndDate: hrEmployees.contractEndDate,
        hrOwnerEmployeeId: hrEmployees.hrOwnerEmployeeId,
        managerEmployeeId: hrEmployees.managerEmployeeId,
      })
      .from(hrEmployees)
      .where(whereClause)
      .orderBy(hrEmployees.contractEndDate)
      .limit(pageSize)
      .offset(offset);

    const mapped: HrLifecycleContractReviewRow[] = rows
      .filter((row) => row.contractEndDate)
      .map((row) => ({
        id: row.id,
        employeeNumber: row.employeeNumber,
        displayName: row.preferredName?.trim() || row.legalName,
        employmentStatus: row.employmentStatus,
        employmentType: row.employmentType,
        legalEntityCode: row.legalEntityCode,
        workLocationCode: row.workLocationCode,
        contractEndDate: row.contractEndDate!,
        hrOwnerEmployeeId: row.hrOwnerEmployeeId,
        managerEmployeeId: row.managerEmployeeId,
      }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrLifecycleAuditEventRow = HrLifecycleEventRow & {
  employeeNumber: string;
  displayName: string;
};

export type HrLifecycleAuditEventWindow = {
  rows: readonly HrLifecycleAuditEventRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrLifecycleAuditEventsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrLifecycleAuditEventWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrLifecycleEvents.organizationId, input.organizationId)];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrLifecycleEvents.kind, pattern),
          ilike(hrLifecycleEvents.reason, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrLifecycleEvents)
      .innerJoin(
        hrEmployees,
        and(
          eq(hrLifecycleEvents.employeeId, hrEmployees.id),
          eq(hrLifecycleEvents.organizationId, hrEmployees.organizationId),
        ),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrLifecycleEvents.id,
        employeeId: hrLifecycleEvents.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        kind: hrLifecycleEvents.kind,
        previousStatus: hrLifecycleEvents.previousStatus,
        newStatus: hrLifecycleEvents.newStatus,
        effectiveDate: hrLifecycleEvents.effectiveDate,
        reason: hrLifecycleEvents.reason,
        approvalReference: hrLifecycleEvents.approvalReference,
        createdAt: hrLifecycleEvents.createdAt,
      })
      .from(hrLifecycleEvents)
      .innerJoin(
        hrEmployees,
        and(
          eq(hrLifecycleEvents.employeeId, hrEmployees.id),
          eq(hrLifecycleEvents.organizationId, hrEmployees.organizationId),
        ),
      )
      .where(whereClause)
      .orderBy(desc(hrLifecycleEvents.effectiveDate), desc(hrLifecycleEvents.createdAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrLifecycleAuditEventRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      displayName: row.preferredName?.trim() || row.legalName,
      kind: row.kind,
      previousStatus: row.previousStatus,
      newStatus: row.newStatus,
      effectiveDate: row.effectiveDate,
      reason: row.reason,
      approvalReference: row.approvalReference,
      createdAt: row.createdAt,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export type HrLifecycleNoticePeriodRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  lastWorkingDate: Date | null;
  offboardingCaseId: string | null;
};

export type HrLifecycleNoticePeriodWindow = {
  rows: readonly HrLifecycleNoticePeriodRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrLifecycleNoticePeriodWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrLifecycleNoticePeriodWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      eq(hrEmployees.employmentStatus, "notice_period"),
      isNull(hrEmployees.archivedAt),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employmentStatus: hrEmployees.employmentStatus,
        offboardingCaseId: hrOffboardingCases.id,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
      })
      .from(hrEmployees)
      .leftJoin(
        hrOffboardingCases,
        and(
          eq(hrOffboardingCases.employeeId, hrEmployees.id),
          eq(hrOffboardingCases.organizationId, hrEmployees.organizationId),
          eq(hrOffboardingCases.status, "in_progress"),
        ),
      )
      .where(whereClause)
      .orderBy(hrEmployees.employeeNumber)
      .limit(pageSize)
      .offset(offset);

    const mapped: HrLifecycleNoticePeriodRow[] = rows.map((row) => ({
      id: row.id,
      employeeNumber: row.employeeNumber,
      displayName: row.preferredName?.trim() || row.legalName,
      employmentStatus: row.employmentStatus,
      lastWorkingDate: row.lastWorkingDate,
      offboardingCaseId: row.offboardingCaseId,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export async function getHrEmployeeLifecycleSnapshot(input: {
  organizationId: string;
  employeeId: string;
}): Promise<{
  employeeId: string;
  employmentStatus: HrEmploymentStatus;
  probationEndDate: Date | null;
  confirmationDate: Date | null;
} | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrEmployees.id,
        employmentStatus: hrEmployees.employmentStatus,
        probationEndDate: hrEmployees.probationEndDate,
        confirmationDate: hrEmployees.confirmationDate,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      employeeId: row.id,
      employmentStatus: row.employmentStatus,
      probationEndDate: row.probationEndDate,
      confirmationDate: row.confirmationDate,
    };
  });
}

export async function listHrLifecycleEventsForEmployee(input: {
  organizationId: string;
  employeeId: string;
  limit?: number;
}): Promise<readonly HrLifecycleEventRow[]> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrLifecycleEvents.id,
        employeeId: hrLifecycleEvents.employeeId,
        kind: hrLifecycleEvents.kind,
        previousStatus: hrLifecycleEvents.previousStatus,
        newStatus: hrLifecycleEvents.newStatus,
        effectiveDate: hrLifecycleEvents.effectiveDate,
        reason: hrLifecycleEvents.reason,
        approvalReference: hrLifecycleEvents.approvalReference,
        createdAt: hrLifecycleEvents.createdAt,
      })
      .from(hrLifecycleEvents)
      .where(
        and(
          eq(hrLifecycleEvents.organizationId, input.organizationId),
          eq(hrLifecycleEvents.employeeId, input.employeeId),
        ),
      )
      .orderBy(desc(hrLifecycleEvents.effectiveDate), desc(hrLifecycleEvents.createdAt))
      .limit(limit);

    return rows;
  });
}

export async function changeHrEmploymentStatus(input: {
  organizationId: string;
  employeeId: string;
  toStatus: HrEmploymentStatus;
  effectiveDate?: Date;
  reason?: string | null;
  approvalReference?: string | null;
}): Promise<{ eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const effectiveDate = input.effectiveDate ?? new Date();
    const now = new Date();

    if (effectiveDate <= now) {
      const result = await applyEmploymentStatusChange(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        toStatus: input.toStatus,
        effectiveDate,
        reason: input.reason,
        approvalReference: input.approvalReference,
      });
      return { eventId: result.eventId };
    }

    const employee = await assertLifecycleEmployeeWritable(
      db,
      input.organizationId,
      input.employeeId,
    );
    assertHrEmploymentStatusTransition(employee.employmentStatus, input.toStatus);

    const transitionId = createEntityId("hr_lcy_trn");
    await db.insert(hrLifecycleTransitions).values({
      id: transitionId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      transitionKind: "employment_status_change",
      fromStatus: employee.employmentStatus,
      toStatus: input.toStatus,
      effectiveDate,
      reason: input.reason?.trim() || null,
      approvalReference: input.approvalReference?.trim() || null,
    });

    const eventId = await insertLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: "transition_scheduled",
      previousStatus: employee.employmentStatus,
      newStatus: input.toStatus,
      effectiveDate,
      reason: input.reason,
      approvalReference: input.approvalReference,
    });

    await db
      .update(hrLifecycleTransitions)
      .set({ lifecycleEventId: eventId })
      .where(eq(hrLifecycleTransitions.id, transitionId));

    return { eventId };
  });
}

export async function recordHrProbationOutcome(input: {
  organizationId: string;
  employeeId: string;
  outcome: HrProbationOutcome;
  effectiveDate?: Date;
  probationEndDate?: Date | null;
  reason?: string | null;
  approvalReference?: string | null;
}): Promise<{ eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employee = await assertLifecycleEmployeeWritable(
      db,
      input.organizationId,
      input.employeeId,
    );

    if (employee.employmentStatus !== "probation") {
      throw new HrLifecycleCommandError(
        "invalid_status_transition",
        "Probation outcome requires current status probation.",
      );
    }

    const effectiveDate = input.effectiveDate ?? new Date();

    if (input.outcome === "confirmed") {
      const result = await applyEmploymentStatusChange(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        toStatus: "confirmed",
        effectiveDate,
        reason: input.reason,
        approvalReference: input.approvalReference,
        eventKind: "confirmation",
        confirmationDate: effectiveDate,
      });
      return { eventId: result.eventId };
    }

    if (input.outcome === "extended") {
      if (!input.probationEndDate) {
        throw new HrLifecycleCommandError(
          "invalid_status_transition",
          "Probation extension requires probationEndDate.",
        );
      }
      const eventId = await insertLifecycleEvent(db, {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        kind: "probation_extended",
        previousStatus: employee.employmentStatus,
        newStatus: employee.employmentStatus,
        effectiveDate,
        reason: input.reason,
        approvalReference: input.approvalReference,
      });
      await db
        .update(hrEmployees)
        .set({ probationEndDate: input.probationEndDate })
        .where(eq(hrEmployees.id, input.employeeId));
      return { eventId };
    }

    const result = await applyEmploymentStatusChange(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      toStatus: "separated",
      effectiveDate,
      reason: input.reason ?? "probation_termination_recommended",
      approvalReference: input.approvalReference,
      eventKind: "probation_outcome",
    });
    return { eventId: result.eventId };
  });
}

export async function confirmHrEmployment(input: {
  organizationId: string;
  employeeId: string;
  effectiveDate?: Date;
  reason?: string | null;
  approvalReference?: string | null;
}): Promise<{ eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const effectiveDate = input.effectiveDate ?? new Date();
    const result = await applyEmploymentStatusChange(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      toStatus: "confirmed",
      effectiveDate,
      reason: input.reason,
      approvalReference: input.approvalReference,
      eventKind: "confirmation",
      confirmationDate: effectiveDate,
    });
    return { eventId: result.eventId };
  });
}

export async function recordHrEmployeeMovement(input: {
  organizationId: string;
  employeeId: string;
  movementKind: HrMovementKind;
  effectiveDate?: Date;
  placement: HrEmployeePlacementInput;
  grade?: string | null;
  workLocationCode?: string | null;
  reason?: string | null;
  approvalReference?: string | null;
}): Promise<{
  eventId: string;
  assignmentId: string | null;
  changedFields: readonly string[];
}> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employee = await assertLifecycleEmployeeWritable(
      db,
      input.organizationId,
      input.employeeId,
    );
    const effectiveDate = input.effectiveDate ?? new Date();

    const assignment = await upsertHrEmployeeEffectiveAssignmentInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      effectiveFrom: effectiveDate,
      placement: input.placement,
      reason: input.reason ?? input.movementKind,
    });

    const employmentPatch: Partial<typeof hrEmployees.$inferInsert> = {};
    const changedFields = [...assignment.changedFields];

    if (input.grade !== undefined) {
      employmentPatch.grade = input.grade?.trim() || null;
      changedFields.push("grade");
    }

    if (input.workLocationCode !== undefined) {
      employmentPatch.workLocationCode = input.workLocationCode?.trim() || null;
      changedFields.push("workLocationCode");
    }

    if (Object.keys(employmentPatch).length > 0) {
      await db
        .update(hrEmployees)
        .set(employmentPatch)
        .where(eq(hrEmployees.id, input.employeeId));
    }

    const eventId = await insertLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: input.movementKind,
      previousStatus: employee.employmentStatus,
      newStatus: employee.employmentStatus,
      effectiveDate,
      reason: input.reason,
      approvalReference: input.approvalReference,
    });

    return { eventId, assignmentId: assignment.assignmentId, changedFields };
  });
}

export async function renewHrEmployeeContract(input: {
  organizationId: string;
  employeeId: string;
  contractEndDate: Date;
  effectiveDate?: Date;
  reason?: string | null;
  approvalReference?: string | null;
}): Promise<{ eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employee = await assertLifecycleEmployeeWritable(
      db,
      input.organizationId,
      input.employeeId,
    );
    const effectiveDate = input.effectiveDate ?? new Date();

    await db
      .update(hrEmployees)
      .set({ contractEndDate: input.contractEndDate })
      .where(eq(hrEmployees.id, input.employeeId));

    const eventId = await insertLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: "contract_renewal",
      previousStatus: employee.employmentStatus,
      newStatus: employee.employmentStatus,
      effectiveDate,
      reason: input.reason,
      approvalReference: input.approvalReference,
    });

    return { eventId };
  });
}

export async function applyDueHrLifecycleTransitions(input: {
  organizationId: string;
  asOf?: Date;
}): Promise<{ appliedCount: number }> {
  const asOf = input.asOf ?? new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const pending = await db
      .select({
        id: hrLifecycleTransitions.id,
        employeeId: hrLifecycleTransitions.employeeId,
        toStatus: hrLifecycleTransitions.toStatus,
        effectiveDate: hrLifecycleTransitions.effectiveDate,
        reason: hrLifecycleTransitions.reason,
        approvalReference: hrLifecycleTransitions.approvalReference,
      })
      .from(hrLifecycleTransitions)
      .where(
        and(
          eq(hrLifecycleTransitions.organizationId, input.organizationId),
          eq(hrLifecycleTransitions.status, "pending"),
          lte(hrLifecycleTransitions.effectiveDate, asOf),
        ),
      )
      .orderBy(hrLifecycleTransitions.effectiveDate)
      .limit(50);

    let appliedCount = 0;

    for (const transition of pending) {
      try {
        const result = await applyEmploymentStatusChange(db, {
          organizationId: input.organizationId,
          employeeId: transition.employeeId,
          toStatus: transition.toStatus,
          effectiveDate: transition.effectiveDate,
          reason: transition.reason,
          approvalReference: transition.approvalReference,
          eventKind: "transition_applied",
        });

        await db
          .update(hrLifecycleTransitions)
          .set({
            status: "applied",
            appliedAt: asOf,
            lifecycleEventId: result.eventId,
          })
          .where(eq(hrLifecycleTransitions.id, transition.id));

        appliedCount += 1;
      } catch {
        await db
          .update(hrLifecycleTransitions)
          .set({ status: "failed" })
          .where(eq(hrLifecycleTransitions.id, transition.id));
      }
    }

    return { appliedCount };
  });
}

export async function cancelHrLifecycleTransition(input: {
  organizationId: string;
  transitionId: string;
}): Promise<{ transitionId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [transition] = await db
      .select({
        id: hrLifecycleTransitions.id,
        status: hrLifecycleTransitions.status,
      })
      .from(hrLifecycleTransitions)
      .where(
        and(
          eq(hrLifecycleTransitions.organizationId, input.organizationId),
          eq(hrLifecycleTransitions.id, input.transitionId),
        ),
      )
      .limit(1);

    if (!transition) {
      throw new HrLifecycleCommandError("transition_not_found");
    }
    if (transition.status !== "pending") {
      throw new HrLifecycleCommandError("transition_not_pending");
    }

    await db
      .update(hrLifecycleTransitions)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(hrLifecycleTransitions.id, input.transitionId));

    return { transitionId: input.transitionId };
  });
}

export type HrLifecycleTransitionSweepResult = {
  checkedAt: string;
  organizationCount: number;
  appliedCount: number;
};

export type HrLifecyclePendingTransitionRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  displayName: string;
  fromStatus: HrEmploymentStatus;
  toStatus: HrEmploymentStatus;
  effectiveDate: Date;
  reason: string | null;
  approvalReference: string | null;
};

export type HrLifecyclePendingTransitionWindow = {
  rows: readonly HrLifecyclePendingTransitionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrLifecyclePendingTransitionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrLifecyclePendingTransitionWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrLifecycleTransitions.organizationId, input.organizationId),
      eq(hrLifecycleTransitions.status, "pending"),
      isNull(hrEmployees.archivedAt),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrLifecycleTransitions)
      .innerJoin(
        hrEmployees,
        and(
          eq(hrLifecycleTransitions.employeeId, hrEmployees.id),
          eq(hrLifecycleTransitions.organizationId, hrEmployees.organizationId),
        ),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrLifecycleTransitions.id,
        employeeId: hrLifecycleTransitions.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        fromStatus: hrLifecycleTransitions.fromStatus,
        toStatus: hrLifecycleTransitions.toStatus,
        effectiveDate: hrLifecycleTransitions.effectiveDate,
        reason: hrLifecycleTransitions.reason,
        approvalReference: hrLifecycleTransitions.approvalReference,
      })
      .from(hrLifecycleTransitions)
      .innerJoin(
        hrEmployees,
        and(
          eq(hrLifecycleTransitions.employeeId, hrEmployees.id),
          eq(hrLifecycleTransitions.organizationId, hrEmployees.organizationId),
        ),
      )
      .where(whereClause)
      .orderBy(hrLifecycleTransitions.effectiveDate)
      .limit(pageSize)
      .offset(offset);

    const mapped: HrLifecyclePendingTransitionRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      displayName: row.preferredName?.trim() || row.legalName,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      effectiveDate: row.effectiveDate,
      reason: row.reason,
      approvalReference: row.approvalReference,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export async function countHrLifecyclePendingTransitions(input: {
  organizationId: string;
}): Promise<number> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({ total: count() })
      .from(hrLifecycleTransitions)
      .where(
        and(
          eq(hrLifecycleTransitions.organizationId, input.organizationId),
          eq(hrLifecycleTransitions.status, "pending"),
        ),
      );
    return Number(row?.total ?? 0);
  });
}

export async function runHrLifecycleTransitionSweep(): Promise<HrLifecycleTransitionSweepResult> {
  const organizations = await listOrganizationsForCoreErpSeed();
  let appliedCount = 0;

  for (const organization of organizations) {
    const result = await applyDueHrLifecycleTransitions({
      organizationId: organization.id,
    });
    appliedCount += result.appliedCount;
  }

  return {
    checkedAt: new Date().toISOString(),
    organizationCount: organizations.length,
    appliedCount,
  };
}
