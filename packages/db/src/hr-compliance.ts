import { and, count, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appliesComplianceObligationToEmployee } from "./hr-compliance-scope.shared";
import type { HrComplianceObligationScope } from "./hr-compliance-scope.shared";
import {
  activeLaborLawObligationKindCondition,
  buildEmployeeObligationTrackingKey,
} from "./hr-compliance-labor-law.shared";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceObligations,
  hrDepartments,
  hrEmployees,
} from "./schema/hr";

export {
  appliesComplianceObligationToEmployee,
  type HrComplianceObligationScope,
  type HrEmployeeComplianceScope,
} from "./hr-compliance-scope.shared";

export {
  buildEmployeeObligationTrackingKey,
  HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND,
} from "./hr-compliance-labor-law.shared";

export type HrComplianceObligationScopeFields = Omit<
  HrComplianceObligationScope,
  "departmentId"
>;

export type HrComplianceObligationRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  complianceArea: string;
  requirementKind: string;
  status: (typeof hrComplianceObligations.$inferSelect)["status"];
  departmentName: string | null;
  dueDate: Date | null;
} & HrComplianceObligationScopeFields;

export type HrComplianceObligationWindow = {
  rows: readonly HrComplianceObligationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceExceptionRow = {
  id: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  complianceArea: string;
  itemType: string;
  title: string;
  severity: (typeof hrComplianceExceptions.$inferSelect)["severity"];
  status: (typeof hrComplianceExceptions.$inferSelect)["status"];
  correctiveActionDueDate: Date | null;
  createdAt: Date;
};

export type HrComplianceExceptionWindow = {
  rows: readonly HrComplianceExceptionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrEmployeeLaborLawRequirementRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  obligationId: string;
  obligationCode: string;
  obligationTitle: string;
  complianceArea: string;
  status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
  dueDate: Date | null;
  completedAt: Date | null;
  reviewNotes: string | null;
};

export type HrEmployeeLaborLawRequirementWindow = {
  rows: readonly HrEmployeeLaborLawRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export class HrComplianceCommandError extends Error {
  readonly code:
    | "obligation_not_found"
    | "exception_not_found"
    | "exception_not_open"
    | "requirement_not_found";

  constructor(code: HrComplianceCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function normalizeScopeCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

function normalizeScopeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

function appendExactOrNullScopeFilter(
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

export async function listHrComplianceObligationsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceObligations.$inferSelect)["status"];
  complianceArea?: string;
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  workerCategory?: string | null;
}): Promise<HrComplianceObligationWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceObligations.organizationId, input.organizationId),
    ];

    if (input.status) {
      conditions.push(eq(hrComplianceObligations.status, input.status));
    } else {
      conditions.push(eq(hrComplianceObligations.status, "active"));
    }

    if (input.complianceArea?.trim()) {
      conditions.push(
        eq(hrComplianceObligations.complianceArea, input.complianceArea.trim()),
      );
    }

    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.countryCode,
      input.countryCode,
      (value) => value.toUpperCase(),
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.legalEntityCode,
      input.legalEntityCode,
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.workLocationCode,
      input.workLocationCode,
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.employmentType,
      input.employmentType,
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.workerCategory,
      input.workerCategory,
    );

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrComplianceObligations.code, pattern),
          ilike(hrComplianceObligations.title, pattern),
          ilike(hrComplianceObligations.complianceArea, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrComplianceObligations)
      .leftJoin(
        hrDepartments,
        eq(hrComplianceObligations.departmentId, hrDepartments.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrComplianceObligations.id,
        code: hrComplianceObligations.code,
        title: hrComplianceObligations.title,
        description: hrComplianceObligations.description,
        complianceArea: hrComplianceObligations.complianceArea,
        requirementKind: hrComplianceObligations.requirementKind,
        status: hrComplianceObligations.status,
        departmentName: hrDepartments.name,
        dueDate: hrComplianceObligations.dueDate,
        countryCode: hrComplianceObligations.countryCode,
        legalEntityCode: hrComplianceObligations.legalEntityCode,
        workLocationCode: hrComplianceObligations.workLocationCode,
        employmentType: hrComplianceObligations.employmentType,
        workerCategory: hrComplianceObligations.workerCategory,
      })
      .from(hrComplianceObligations)
      .leftJoin(
        hrDepartments,
        eq(hrComplianceObligations.departmentId, hrDepartments.id),
      )
      .where(whereClause)
      .orderBy(desc(hrComplianceObligations.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description,
        complianceArea: row.complianceArea,
        requirementKind: row.requirementKind,
        status: row.status,
        departmentName: row.departmentName,
        dueDate: row.dueDate,
        countryCode: row.countryCode,
        legalEntityCode: row.legalEntityCode,
        workLocationCode: row.workLocationCode,
        employmentType: row.employmentType,
        workerCategory: row.workerCategory,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function listHrComplianceExceptionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceExceptions.$inferSelect)["status"];
  openOnly?: boolean;
}): Promise<HrComplianceExceptionWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceExceptions.organizationId, input.organizationId),
    ];

    if (input.openOnly) {
      conditions.push(
        inArray(hrComplianceExceptions.status, ["open", "in_progress"]),
      );
    } else if (input.status) {
      conditions.push(eq(hrComplianceExceptions.status, input.status));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrComplianceExceptions.title, pattern),
          ilike(hrComplianceExceptions.complianceArea, pattern),
          ilike(hrComplianceExceptions.itemType, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrComplianceExceptions)
      .leftJoin(
        hrEmployees,
        eq(hrComplianceExceptions.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrComplianceExceptions.id,
        employeeId: hrComplianceExceptions.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        complianceArea: hrComplianceExceptions.complianceArea,
        itemType: hrComplianceExceptions.itemType,
        title: hrComplianceExceptions.title,
        severity: hrComplianceExceptions.severity,
        status: hrComplianceExceptions.status,
        correctiveActionDueDate: hrComplianceExceptions.correctiveActionDueDate,
        createdAt: hrComplianceExceptions.createdAt,
      })
      .from(hrComplianceExceptions)
      .leftJoin(
        hrEmployees,
        eq(hrComplianceExceptions.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrComplianceExceptions.createdAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.employeeId
          ? row.preferredName?.trim() || row.legalName
          : null,
        complianceArea: row.complianceArea,
        itemType: row.itemType,
        title: row.title,
        severity: row.severity,
        status: row.status,
        correctiveActionDueDate: row.correctiveActionDueDate,
        createdAt: row.createdAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function upsertHrComplianceObligationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    title: string;
    complianceArea: string;
    requirementKind: string;
    description?: string | null;
    departmentId?: string | null;
    dueDate?: Date | null;
    countryCode?: string | null;
    legalEntityCode?: string | null;
    workLocationCode?: string | null;
    employmentType?: string | null;
    workerCategory?: string | null;
  },
): Promise<{ obligationId: string }> {
  const code = input.code.trim();
  const scopePayload = {
    countryCode: normalizeScopeCode(input.countryCode),
    legalEntityCode: normalizeScopeText(input.legalEntityCode),
    workLocationCode: normalizeScopeText(input.workLocationCode),
    employmentType: normalizeScopeText(input.employmentType),
    workerCategory: normalizeScopeText(input.workerCategory),
  } as const;
  const [existing] = await db
    .select({ id: hrComplianceObligations.id })
    .from(hrComplianceObligations)
    .where(
      and(
        eq(hrComplianceObligations.organizationId, input.organizationId),
        eq(hrComplianceObligations.code, code),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrComplianceObligations)
      .set({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        complianceArea: input.complianceArea.trim(),
        requirementKind: input.requirementKind.trim(),
        departmentId: input.departmentId ?? null,
        dueDate: input.dueDate ?? null,
        ...scopePayload,
        status: "active",
      })
      .where(eq(hrComplianceObligations.id, existing.id));
    return { obligationId: existing.id };
  }

  const obligationId = createEntityId("hr_cmp_obl");
  await db.insert(hrComplianceObligations).values({
    id: obligationId,
    organizationId: input.organizationId,
    code,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    complianceArea: input.complianceArea.trim(),
    requirementKind: input.requirementKind.trim(),
    departmentId: input.departmentId ?? null,
    dueDate: input.dueDate ?? null,
    ...scopePayload,
  });

  return { obligationId };
}

export async function upsertHrComplianceObligation(input: {
  organizationId: string;
  code: string;
  title: string;
  complianceArea: string;
  requirementKind: string;
  description?: string | null;
  departmentId?: string | null;
  dueDate?: Date | null;
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  workerCategory?: string | null;
}): Promise<{ obligationId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    upsertHrComplianceObligationInTx(db, input),
  );
}

export async function archiveHrComplianceObligationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    obligationId: string;
  },
): Promise<{ obligationId: string }> {
  const [obligation] = await db
    .select({ id: hrComplianceObligations.id })
    .from(hrComplianceObligations)
    .where(
      and(
        eq(hrComplianceObligations.organizationId, input.organizationId),
        eq(hrComplianceObligations.id, input.obligationId),
      ),
    )
    .limit(1);

  if (!obligation) {
    throw new HrComplianceCommandError("obligation_not_found");
  }

  await db
    .update(hrComplianceObligations)
    .set({ status: "archived" })
    .where(eq(hrComplianceObligations.id, input.obligationId));

  return { obligationId: input.obligationId };
}

export async function archiveHrComplianceObligation(input: {
  organizationId: string;
  obligationId: string;
}): Promise<{ obligationId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    archiveHrComplianceObligationInTx(db, input),
  );
}

function assertExceptionIsOpen(status: string): void {
  if (status === "resolved" || status === "waived") {
    throw new HrComplianceCommandError("exception_not_open");
  }
}

export async function createHrComplianceExceptionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    title: string;
    complianceArea: string;
    itemType: string;
    severity?: (typeof hrComplianceExceptions.$inferInsert)["severity"];
    employeeId?: string | null;
    correctiveActionDescription?: string | null;
    correctiveActionDueDate?: Date | null;
  },
): Promise<{ exceptionId: string }> {
  const exceptionId = createEntityId("hr_cmp_exc");
  const hasCorrectiveAction =
    Boolean(input.correctiveActionDescription?.trim()) ||
    input.correctiveActionDueDate != null;

  await db.insert(hrComplianceExceptions).values({
    id: exceptionId,
    organizationId: input.organizationId,
    employeeId: input.employeeId ?? null,
    title: input.title.trim(),
    complianceArea: input.complianceArea.trim(),
    itemType: input.itemType.trim(),
    severity: input.severity ?? "medium",
    status: hasCorrectiveAction ? "in_progress" : "open",
    correctiveActionDescription:
      input.correctiveActionDescription?.trim() || null,
    correctiveActionDueDate: input.correctiveActionDueDate ?? null,
  });

  return { exceptionId };
}

export async function createHrComplianceException(input: {
  organizationId: string;
  title: string;
  complianceArea: string;
  itemType: string;
  severity?: (typeof hrComplianceExceptions.$inferInsert)["severity"];
  employeeId?: string | null;
  correctiveActionDescription?: string | null;
  correctiveActionDueDate?: Date | null;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    createHrComplianceExceptionInTx(db, input),
  );
}

export async function assignHrComplianceCorrectiveActionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    exceptionId: string;
    correctiveActionDescription: string;
    correctiveActionDueDate: Date;
  },
): Promise<{ exceptionId: string }> {
  const [exception] = await db
    .select({
      id: hrComplianceExceptions.id,
      status: hrComplianceExceptions.status,
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

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "in_progress",
      correctiveActionDescription: input.correctiveActionDescription.trim(),
      correctiveActionDueDate: input.correctiveActionDueDate,
    })
    .where(eq(hrComplianceExceptions.id, input.exceptionId));

  return { exceptionId: input.exceptionId };
}

export async function assignHrComplianceCorrectiveAction(input: {
  organizationId: string;
  exceptionId: string;
  correctiveActionDescription: string;
  correctiveActionDueDate: Date;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    assignHrComplianceCorrectiveActionInTx(db, input),
  );
}

export async function updateHrComplianceCorrectiveActionProgressInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    exceptionId: string;
    progressNote: string;
  },
): Promise<{ exceptionId: string }> {
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

  const progressLine = `[${new Date().toISOString().slice(0, 10)}] ${input.progressNote.trim()}`;
  const previous = exception.correctiveActionDescription?.trim();
  const correctiveActionDescription = previous
    ? `${previous}\n\n${progressLine}`
    : progressLine;

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "in_progress",
      correctiveActionDescription,
    })
    .where(eq(hrComplianceExceptions.id, input.exceptionId));

  return { exceptionId: input.exceptionId };
}

export async function updateHrComplianceCorrectiveActionProgress(input: {
  organizationId: string;
  exceptionId: string;
  progressNote: string;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrComplianceCorrectiveActionProgressInTx(db, input),
  );
}

export async function waiveHrComplianceExceptionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    exceptionId: string;
    waiverReason: string;
    approvalReference: string;
  },
): Promise<{ exceptionId: string }> {
  const [exception] = await db
    .select({
      id: hrComplianceExceptions.id,
      status: hrComplianceExceptions.status,
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

  const resolutionNote = `${input.waiverReason.trim()} (ref: ${input.approvalReference.trim()})`;

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "waived",
      resolutionNote,
      resolvedAt: new Date(),
    })
    .where(eq(hrComplianceExceptions.id, input.exceptionId));

  return { exceptionId: input.exceptionId };
}

export async function waiveHrComplianceException(input: {
  organizationId: string;
  exceptionId: string;
  waiverReason: string;
  approvalReference: string;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    waiveHrComplianceExceptionInTx(db, input),
  );
}

export async function resolveHrComplianceExceptionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    exceptionId: string;
    resolutionNote?: string | null;
  },
): Promise<{ exceptionId: string }> {
  const [exception] = await db
    .select({
      id: hrComplianceExceptions.id,
      status: hrComplianceExceptions.status,
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

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "resolved",
      resolutionNote: input.resolutionNote?.trim() || null,
      resolvedAt: new Date(),
    })
    .where(eq(hrComplianceExceptions.id, input.exceptionId));

  return { exceptionId: input.exceptionId };
}

export async function resolveHrComplianceException(input: {
  organizationId: string;
  exceptionId: string;
  resolutionNote?: string | null;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    resolveHrComplianceExceptionInTx(db, input),
  );
}

export async function syncHrEmployeeLaborLawRequirementsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
  },
): Promise<{
  createdCount: number;
  removedCount: number;
  dueDateUpdatedCount: number;
  totalTracked: number;
}> {
  const [employees, obligations, trackedRows] = await Promise.all([
      db
        .select({
          id: hrEmployees.id,
          countryCode: hrEmployees.countryCode,
          legalEntityCode: hrEmployees.legalEntityCode,
          workLocationCode: hrEmployees.workLocationCode,
          employmentType: hrEmployees.employmentType,
          workerCategory: hrEmployees.workerCategory,
          departmentId: hrEmployees.currentDepartmentId,
        })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            isNull(hrEmployees.archivedAt),
            eq(hrEmployees.employmentStatus, "active"),
          ),
        ),
      db
        .select({
          id: hrComplianceObligations.id,
          dueDate: hrComplianceObligations.dueDate,
          countryCode: hrComplianceObligations.countryCode,
          legalEntityCode: hrComplianceObligations.legalEntityCode,
          workLocationCode: hrComplianceObligations.workLocationCode,
          employmentType: hrComplianceObligations.employmentType,
          workerCategory: hrComplianceObligations.workerCategory,
          departmentId: hrComplianceObligations.departmentId,
        })
        .from(hrComplianceObligations)
        .where(
          and(
            eq(hrComplianceObligations.organizationId, input.organizationId),
            eq(hrComplianceObligations.status, "active"),
            activeLaborLawObligationKindCondition,
          ),
        ),
      db
        .select({
          id: hrComplianceEmployeeRequirements.id,
          employeeId: hrComplianceEmployeeRequirements.employeeId,
          obligationId: hrComplianceEmployeeRequirements.obligationId,
          dueDate: hrComplianceEmployeeRequirements.dueDate,
        })
        .from(hrComplianceEmployeeRequirements)
        .innerJoin(
          hrComplianceObligations,
          eq(
            hrComplianceEmployeeRequirements.obligationId,
            hrComplianceObligations.id,
          ),
        )
        .where(
          and(
            eq(
              hrComplianceEmployeeRequirements.organizationId,
              input.organizationId,
            ),
            activeLaborLawObligationKindCondition,
          ),
        ),
    ]);

    const trackedByKey = new Map(
      trackedRows.map((row) => [
        buildEmployeeObligationTrackingKey(row.employeeId, row.obligationId),
        row,
      ]),
    );

    const validKeys = new Set<string>();
    const inserts: (typeof hrComplianceEmployeeRequirements.$inferInsert)[] = [];
    const dueDateUpdates: Array<{ id: string; dueDate: Date | null }> = [];

    for (const employee of employees) {
      for (const obligation of obligations) {
        if (
          !appliesComplianceObligationToEmployee(obligation, {
            ...employee,
            departmentId: employee.departmentId,
          })
        ) {
          continue;
        }

        const key = buildEmployeeObligationTrackingKey(
          employee.id,
          obligation.id,
        );
        validKeys.add(key);

        const tracked = trackedByKey.get(key);
        if (!tracked) {
          inserts.push({
            id: createEntityId("hr_cmp_req"),
            organizationId: input.organizationId,
            employeeId: employee.id,
            obligationId: obligation.id,
            status: "pending",
            dueDate: obligation.dueDate,
          });
          continue;
        }

        const obligationDueMs = obligation.dueDate?.getTime() ?? null;
        const trackedDueMs = tracked.dueDate?.getTime() ?? null;
        if (obligationDueMs !== trackedDueMs) {
          dueDateUpdates.push({
            id: tracked.id,
            dueDate: obligation.dueDate ?? null,
          });
        }
      }
    }

    const staleIds = trackedRows
      .filter(
        (row) =>
          !validKeys.has(
            buildEmployeeObligationTrackingKey(row.employeeId, row.obligationId),
          ),
      )
      .map((row) => row.id);

    if (staleIds.length > 0) {
      await db
        .delete(hrComplianceEmployeeRequirements)
        .where(
          and(
            eq(
              hrComplianceEmployeeRequirements.organizationId,
              input.organizationId,
            ),
            inArray(hrComplianceEmployeeRequirements.id, staleIds),
          ),
        );
    }

    if (inserts.length > 0) {
      await db.insert(hrComplianceEmployeeRequirements).values(inserts);
    }

    if (dueDateUpdates.length > 0) {
      await Promise.all(
        dueDateUpdates.map((update) =>
          db
            .update(hrComplianceEmployeeRequirements)
            .set({ dueDate: update.dueDate })
            .where(eq(hrComplianceEmployeeRequirements.id, update.id)),
        ),
      );
    }

  return {
    createdCount: inserts.length,
    removedCount: staleIds.length,
    dueDateUpdatedCount: dueDateUpdates.length,
    totalTracked: validKeys.size,
  };
}

export async function syncHrEmployeeLaborLawRequirements(input: {
  organizationId: string;
}): Promise<{
  createdCount: number;
  removedCount: number;
  dueDateUpdatedCount: number;
  totalTracked: number;
}> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    syncHrEmployeeLaborLawRequirementsInTx(db, input),
  );
}

export async function listHrEmployeeLaborLawRequirementsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
}): Promise<HrEmployeeLaborLawRequirementWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceEmployeeRequirements.organizationId, input.organizationId),
      activeLaborLawObligationKindCondition,
      eq(hrComplianceObligations.status, "active"),
    ];

    if (input.status) {
      conditions.push(eq(hrComplianceEmployeeRequirements.status, input.status));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrComplianceObligations.code, pattern),
          ilike(hrComplianceObligations.title, pattern),
          ilike(hrComplianceObligations.complianceArea, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow, rows] = await Promise.all([
      db
        .select({ total: count() })
        .from(hrComplianceEmployeeRequirements)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceEmployeeRequirements.employeeId, hrEmployees.id),
        )
        .innerJoin(
          hrComplianceObligations,
          eq(
            hrComplianceEmployeeRequirements.obligationId,
            hrComplianceObligations.id,
          ),
        )
        .where(whereClause),
      db
        .select({
          id: hrComplianceEmployeeRequirements.id,
          employeeId: hrComplianceEmployeeRequirements.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          legalName: hrEmployees.legalName,
          preferredName: hrEmployees.preferredName,
          obligationId: hrComplianceEmployeeRequirements.obligationId,
          obligationCode: hrComplianceObligations.code,
          obligationTitle: hrComplianceObligations.title,
          complianceArea: hrComplianceObligations.complianceArea,
          status: hrComplianceEmployeeRequirements.status,
          dueDate: hrComplianceEmployeeRequirements.dueDate,
          completedAt: hrComplianceEmployeeRequirements.completedAt,
          reviewNotes: hrComplianceEmployeeRequirements.reviewNotes,
        })
        .from(hrComplianceEmployeeRequirements)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceEmployeeRequirements.employeeId, hrEmployees.id),
        )
        .innerJoin(
          hrComplianceObligations,
          eq(
            hrComplianceEmployeeRequirements.obligationId,
            hrComplianceObligations.id,
          ),
        )
        .where(whereClause)
        .orderBy(desc(hrComplianceEmployeeRequirements.updatedAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const actualTotal = Number(totalRow[0]?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        obligationId: row.obligationId,
        obligationCode: row.obligationCode,
        obligationTitle: row.obligationTitle,
        complianceArea: row.complianceArea,
        status: row.status,
        dueDate: row.dueDate,
        completedAt: row.completedAt,
        reviewNotes: row.reviewNotes,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function updateHrEmployeeLaborLawRequirementStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    requirementId: string;
    status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
    reviewNotes?: string | null;
  },
): Promise<{ requirementId: string }> {
  const [requirement] = await db
    .select({
      id: hrComplianceEmployeeRequirements.id,
    })
    .from(hrComplianceEmployeeRequirements)
    .innerJoin(
      hrComplianceObligations,
      eq(
        hrComplianceEmployeeRequirements.obligationId,
        hrComplianceObligations.id,
      ),
    )
    .where(
      and(
        eq(
          hrComplianceEmployeeRequirements.organizationId,
          input.organizationId,
        ),
        eq(hrComplianceEmployeeRequirements.id, input.requirementId),
        activeLaborLawObligationKindCondition,
      ),
    )
    .limit(1);

  if (!requirement) {
    throw new HrComplianceCommandError("requirement_not_found");
  }

  const completedAt = input.status === "compliant" ? new Date() : null;

  await db
    .update(hrComplianceEmployeeRequirements)
    .set({
      status: input.status,
      reviewNotes: input.reviewNotes?.trim() || null,
      completedAt,
    })
    .where(eq(hrComplianceEmployeeRequirements.id, input.requirementId));

  return { requirementId: input.requirementId };
}

export async function updateHrEmployeeLaborLawRequirementStatus(input: {
  organizationId: string;
  requirementId: string;
  status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
  reviewNotes?: string | null;
}): Promise<{ requirementId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrEmployeeLaborLawRequirementStatusInTx(db, input),
  );
}
