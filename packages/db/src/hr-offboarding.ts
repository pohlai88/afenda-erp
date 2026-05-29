import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  assertHrEmploymentStatusTransition,
  type HrEmploymentStatus,
} from "./hr-lifecycle";
import {
  hrEmployees,
  hrLifecycleEvents,
  hrOffboardingCases,
  hrOffboardingClearanceItems,
} from "./schema/hr";

export const DEFAULT_OFFBOARDING_CLEARANCE = [
  { code: "it_access", title: "IT access revoked", sortOrder: 10 },
  { code: "equipment", title: "Equipment returned", sortOrder: 20 },
  { code: "payroll_final", title: "Final payroll briefed", sortOrder: 30 },
  { code: "exit_interview", title: "Exit interview completed", sortOrder: 40 },
] as const;

export type HrOffboardingCaseRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  status: (typeof hrOffboardingCases.$inferSelect)["status"];
  priorEmploymentStatus: HrEmploymentStatus;
  reason: string | null;
  lastWorkingDate: Date | null;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
};

export type HrOffboardingCaseWindow = {
  rows: readonly HrOffboardingCaseRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export class HrOffboardingCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "employee_archived"
    | "case_not_found"
    | "case_not_in_progress"
    | "active_case_exists"
    | "clearance_incomplete"
    | "clearance_item_not_found"
    | "invalid_status_transition";

  constructor(code: HrOffboardingCommandError["code"], message?: string) {
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

async function assertOffboardingEmployeeWritable(
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
    throw new HrOffboardingCommandError("employee_not_found");
  }
  if (employee.archivedAt) {
    throw new HrOffboardingCommandError("employee_archived");
  }

  return employee;
}

async function insertOffboardingLifecycleEvent(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    kind: string;
    previousStatus: HrEmploymentStatus | null;
    newStatus: HrEmploymentStatus | null;
    effectiveDate: Date;
    reason?: string | null;
  },
) {
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
  });
  return eventId;
}

export async function listHrOffboardingCasesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrOffboardingCases.$inferSelect)["status"];
}): Promise<HrOffboardingCaseWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrOffboardingCases.organizationId, input.organizationId)];

    if (input.status) {
      conditions.push(eq(hrOffboardingCases.status, input.status));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrOffboardingCases.reason, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingCases.id,
        employeeId: hrOffboardingCases.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        status: hrOffboardingCases.status,
        priorEmploymentStatus: hrOffboardingCases.priorEmploymentStatus,
        reason: hrOffboardingCases.reason,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
        startedAt: hrOffboardingCases.createdAt,
        completedAt: hrOffboardingCases.completedAt,
        cancelledAt: hrOffboardingCases.cancelledAt,
      })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrOffboardingCases.createdAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        status: row.status,
        priorEmploymentStatus: row.priorEmploymentStatus,
        reason: row.reason,
        lastWorkingDate: row.lastWorkingDate,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        cancelledAt: row.cancelledAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function startHrOffboarding(input: {
  organizationId: string;
  employeeId: string;
  reason?: string | null;
  lastWorkingDate?: Date | null;
  effectiveDate?: Date;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employee = await assertOffboardingEmployeeWritable(
      db,
      input.organizationId,
      input.employeeId,
    );

    const [activeCase] = await db
      .select({ id: hrOffboardingCases.id })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.employeeId, input.employeeId),
          eq(hrOffboardingCases.status, "in_progress"),
        ),
      )
      .limit(1);

    if (activeCase) {
      throw new HrOffboardingCommandError("active_case_exists");
    }

    assertHrEmploymentStatusTransition(employee.employmentStatus, "offboarding");

    const effectiveDate = input.effectiveDate ?? new Date();
    const caseId = createEntityId("hr_off");
    await db.insert(hrOffboardingCases).values({
      id: caseId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      priorEmploymentStatus: employee.employmentStatus,
      reason: input.reason?.trim() || null,
      lastWorkingDate: input.lastWorkingDate ?? null,
    });

    await db.insert(hrOffboardingClearanceItems).values(
      DEFAULT_OFFBOARDING_CLEARANCE.map((item) => ({
        id: createEntityId("hr_off_clr"),
        organizationId: input.organizationId,
        caseId,
        code: item.code,
        title: item.title,
        sortOrder: item.sortOrder,
      })),
    );

    await db
      .update(hrEmployees)
      .set({ employmentStatus: "offboarding" })
      .where(eq(hrEmployees.id, input.employeeId));

    const eventId = await insertOffboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: "offboarding_start",
      previousStatus: employee.employmentStatus,
      newStatus: "offboarding",
      effectiveDate,
      reason: input.reason,
    });

    return { caseId, eventId };
  });
}

export async function listHrOffboardingClearanceItems(input: {
  organizationId: string;
  caseId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db
      .select({
        id: hrOffboardingClearanceItems.id,
        caseId: hrOffboardingClearanceItems.caseId,
        code: hrOffboardingClearanceItems.code,
        title: hrOffboardingClearanceItems.title,
        status: hrOffboardingClearanceItems.status,
        completedAt: hrOffboardingClearanceItems.completedAt,
        sortOrder: hrOffboardingClearanceItems.sortOrder,
      })
      .from(hrOffboardingClearanceItems)
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.caseId, input.caseId),
        ),
      )
      .orderBy(hrOffboardingClearanceItems.sortOrder);
  });
}

export async function completeHrOffboardingClearanceItem(input: {
  organizationId: string;
  itemId: string;
}): Promise<{ itemId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [item] = await db
      .select({ id: hrOffboardingClearanceItems.id })
      .from(hrOffboardingClearanceItems)
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.id, input.itemId),
        ),
      )
      .limit(1);

    if (!item) {
      throw new HrOffboardingCommandError("clearance_item_not_found");
    }

    await db
      .update(hrOffboardingClearanceItems)
      .set({ status: "done", completedAt: new Date() })
      .where(eq(hrOffboardingClearanceItems.id, input.itemId));

    return { itemId: input.itemId };
  });
}

export async function completeHrOffboarding(input: {
  organizationId: string;
  caseId: string;
  effectiveDate?: Date;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [offboardingCase] = await db
      .select({
        id: hrOffboardingCases.id,
        employeeId: hrOffboardingCases.employeeId,
        status: hrOffboardingCases.status,
      })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!offboardingCase) {
      throw new HrOffboardingCommandError("case_not_found");
    }
    if (offboardingCase.status !== "in_progress") {
      throw new HrOffboardingCommandError("case_not_in_progress");
    }

    const [pendingClearance] = await db
      .select({ id: hrOffboardingClearanceItems.id })
      .from(hrOffboardingClearanceItems)
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.caseId, input.caseId),
          eq(hrOffboardingClearanceItems.status, "pending"),
        ),
      )
      .limit(1);

    if (pendingClearance) {
      throw new HrOffboardingCommandError("clearance_incomplete");
    }

    const employee = await assertOffboardingEmployeeWritable(
      db,
      input.organizationId,
      offboardingCase.employeeId,
    );

    assertHrEmploymentStatusTransition(employee.employmentStatus, "separated");

    const effectiveDate = input.effectiveDate ?? new Date();
    const completedAt = new Date();

    await db
      .update(hrOffboardingCases)
      .set({ status: "completed", completedAt })
      .where(eq(hrOffboardingCases.id, input.caseId));

    await db
      .update(hrEmployees)
      .set({ employmentStatus: "separated" })
      .where(eq(hrEmployees.id, offboardingCase.employeeId));

    const eventId = await insertOffboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: offboardingCase.employeeId,
      kind: "offboarding_complete",
      previousStatus: employee.employmentStatus,
      newStatus: "separated",
      effectiveDate,
    });

    return { caseId: input.caseId, eventId };
  });
}

export async function cancelHrOffboarding(input: {
  organizationId: string;
  caseId: string;
  reason?: string | null;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [offboardingCase] = await db
      .select({
        id: hrOffboardingCases.id,
        employeeId: hrOffboardingCases.employeeId,
        status: hrOffboardingCases.status,
        priorEmploymentStatus: hrOffboardingCases.priorEmploymentStatus,
      })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!offboardingCase) {
      throw new HrOffboardingCommandError("case_not_found");
    }
    if (offboardingCase.status !== "in_progress") {
      throw new HrOffboardingCommandError("case_not_in_progress");
    }

    await assertOffboardingEmployeeWritable(
      db,
      input.organizationId,
      offboardingCase.employeeId,
    );

    const cancelledAt = new Date();
    await db
      .update(hrOffboardingCases)
      .set({
        status: "cancelled",
        cancelledAt,
        reason: input.reason?.trim() || undefined,
      })
      .where(eq(hrOffboardingCases.id, input.caseId));

    await db
      .update(hrEmployees)
      .set({ employmentStatus: offboardingCase.priorEmploymentStatus })
      .where(eq(hrEmployees.id, offboardingCase.employeeId));

    const eventId = await insertOffboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: offboardingCase.employeeId,
      kind: "offboarding_cancelled",
      previousStatus: "offboarding",
      newStatus: offboardingCase.priorEmploymentStatus,
      effectiveDate: cancelledAt,
      reason: input.reason,
    });

    return { caseId: input.caseId, eventId };
  });
}

export async function getActiveHrOffboardingCaseForEmployee(input: {
  organizationId: string;
  employeeId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrOffboardingCases.id,
        status: hrOffboardingCases.status,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
        reason: hrOffboardingCases.reason,
      })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.employeeId, input.employeeId),
          eq(hrOffboardingCases.status, "in_progress"),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}
