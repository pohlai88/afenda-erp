import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  assertHrEmploymentStatusTransition,
  type HrEmploymentStatus,
} from "./hr-lifecycle";
import {
  hrEmployees,
  hrLifecycleEvents,
  hrOnboardingCases,
  hrOnboardingChecklistItems,
} from "./hr";

export const DEFAULT_ONBOARDING_CHECKLIST = [
  { code: "identity_docs", title: "Identity documents submitted", sortOrder: 10 },
  { code: "payroll_setup", title: "Payroll bank details captured", sortOrder: 20 },
  { code: "policy_ack", title: "Policy acknowledgement signed", sortOrder: 30 },
  { code: "it_provision", title: "IT access provisioned", sortOrder: 40 },
] as const;

export type HrOnboardingCaseRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  status: (typeof hrOnboardingCases.$inferSelect)["status"];
  priorEmploymentStatus: HrEmploymentStatus;
  targetStatus: HrEmploymentStatus;
  reason: string | null;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
};

export type HrOnboardingCaseWindow = {
  rows: readonly HrOnboardingCaseRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrOnboardingChecklistItemRow = {
  id: string;
  caseId: string;
  code: string;
  title: string;
  status: (typeof hrOnboardingChecklistItems.$inferSelect)["status"];
  completedAt: Date | null;
  sortOrder: number;
};

export class HrOnboardingCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "employee_archived"
    | "employee_not_onboarding"
    | "case_not_found"
    | "case_not_in_progress"
    | "active_case_exists"
    | "checklist_incomplete"
    | "invalid_status_transition";

  constructor(code: HrOnboardingCommandError["code"], message?: string) {
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

async function insertOnboardingLifecycleEvent(
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

async function seedOnboardingChecklist(
  db: AfendaTransaction,
  organizationId: string,
  caseId: string,
) {
  await db.insert(hrOnboardingChecklistItems).values(
    DEFAULT_ONBOARDING_CHECKLIST.map((item) => ({
      id: createEntityId("hr_on_chk"),
      organizationId,
      caseId,
      code: item.code,
      title: item.title,
      sortOrder: item.sortOrder,
    })),
  );
}

export async function listHrOnboardingCasesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrOnboardingCases.$inferSelect)["status"];
}): Promise<HrOnboardingCaseWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrOnboardingCases.organizationId, input.organizationId)];

    if (input.status) {
      conditions.push(eq(hrOnboardingCases.status, input.status));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrOnboardingCases.reason, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOnboardingCases)
      .innerJoin(hrEmployees, eq(hrOnboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOnboardingCases.id,
        employeeId: hrOnboardingCases.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        status: hrOnboardingCases.status,
        priorEmploymentStatus: hrOnboardingCases.priorEmploymentStatus,
        targetStatus: hrOnboardingCases.targetStatus,
        reason: hrOnboardingCases.reason,
        startedAt: hrOnboardingCases.createdAt,
        completedAt: hrOnboardingCases.completedAt,
        cancelledAt: hrOnboardingCases.cancelledAt,
      })
      .from(hrOnboardingCases)
      .innerJoin(hrEmployees, eq(hrOnboardingCases.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrOnboardingCases.createdAt))
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
        targetStatus: row.targetStatus,
        reason: row.reason,
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

export async function listHrOnboardingChecklistItems(input: {
  organizationId: string;
  caseId: string;
}): Promise<readonly HrOnboardingChecklistItemRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrOnboardingChecklistItems.id,
        caseId: hrOnboardingChecklistItems.caseId,
        code: hrOnboardingChecklistItems.code,
        title: hrOnboardingChecklistItems.title,
        status: hrOnboardingChecklistItems.status,
        completedAt: hrOnboardingChecklistItems.completedAt,
        sortOrder: hrOnboardingChecklistItems.sortOrder,
      })
      .from(hrOnboardingChecklistItems)
      .where(
        and(
          eq(hrOnboardingChecklistItems.organizationId, input.organizationId),
          eq(hrOnboardingChecklistItems.caseId, input.caseId),
        ),
      )
      .orderBy(hrOnboardingChecklistItems.sortOrder);

    return rows;
  });
}

export async function startHrOnboarding(input: {
  organizationId: string;
  employeeId: string;
  reason?: string | null;
  targetStatus?: HrEmploymentStatus;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        archivedAt: hrEmployees.archivedAt,
        employmentStatus: hrEmployees.employmentStatus,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrOnboardingCommandError("employee_not_found");
    }
    if (employee.archivedAt) {
      throw new HrOnboardingCommandError("employee_archived");
    }
    if (employee.employmentStatus !== "onboarding") {
      throw new HrOnboardingCommandError("employee_not_onboarding");
    }

    const [activeCase] = await db
      .select({ id: hrOnboardingCases.id })
      .from(hrOnboardingCases)
      .where(
        and(
          eq(hrOnboardingCases.organizationId, input.organizationId),
          eq(hrOnboardingCases.employeeId, input.employeeId),
          eq(hrOnboardingCases.status, "in_progress"),
        ),
      )
      .limit(1);

    if (activeCase) {
      throw new HrOnboardingCommandError("active_case_exists");
    }

    const caseId = createEntityId("hr_onb");
    const targetStatus = input.targetStatus ?? "active";

    await db.insert(hrOnboardingCases).values({
      id: caseId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      priorEmploymentStatus: employee.employmentStatus,
      targetStatus,
      reason: input.reason?.trim() || null,
    });

    await seedOnboardingChecklist(db, input.organizationId, caseId);

    const eventId = await insertOnboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: "onboarding_start",
      previousStatus: employee.employmentStatus,
      newStatus: employee.employmentStatus,
      effectiveDate: new Date(),
      reason: input.reason,
    });

    return { caseId, eventId };
  });
}

export async function completeHrOnboardingChecklistItem(input: {
  organizationId: string;
  itemId: string;
}): Promise<{ itemId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [item] = await db
      .select({ id: hrOnboardingChecklistItems.id })
      .from(hrOnboardingChecklistItems)
      .where(
        and(
          eq(hrOnboardingChecklistItems.organizationId, input.organizationId),
          eq(hrOnboardingChecklistItems.id, input.itemId),
        ),
      )
      .limit(1);

    if (!item) {
      throw new HrOnboardingCommandError("case_not_found");
    }

    await db
      .update(hrOnboardingChecklistItems)
      .set({ status: "done", completedAt: new Date() })
      .where(eq(hrOnboardingChecklistItems.id, input.itemId));

    return { itemId: input.itemId };
  });
}

async function assertOnboardingChecklistComplete(
  db: AfendaTransaction,
  organizationId: string,
  caseId: string,
) {
  const pending = await db
    .select({ id: hrOnboardingChecklistItems.id })
    .from(hrOnboardingChecklistItems)
    .where(
      and(
        eq(hrOnboardingChecklistItems.organizationId, organizationId),
        eq(hrOnboardingChecklistItems.caseId, caseId),
        eq(hrOnboardingChecklistItems.status, "pending"),
      ),
    )
    .limit(1);

  if (pending.length > 0) {
    throw new HrOnboardingCommandError("checklist_incomplete");
  }
}

export async function completeHrOnboarding(input: {
  organizationId: string;
  caseId: string;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [onboardingCase] = await db
      .select({
        id: hrOnboardingCases.id,
        employeeId: hrOnboardingCases.employeeId,
        status: hrOnboardingCases.status,
        targetStatus: hrOnboardingCases.targetStatus,
      })
      .from(hrOnboardingCases)
      .where(
        and(
          eq(hrOnboardingCases.organizationId, input.organizationId),
          eq(hrOnboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!onboardingCase) {
      throw new HrOnboardingCommandError("case_not_found");
    }
    if (onboardingCase.status !== "in_progress") {
      throw new HrOnboardingCommandError("case_not_in_progress");
    }

    await assertOnboardingChecklistComplete(
      db,
      input.organizationId,
      input.caseId,
    );

    const [employee] = await db
      .select({ employmentStatus: hrEmployees.employmentStatus })
      .from(hrEmployees)
      .where(eq(hrEmployees.id, onboardingCase.employeeId))
      .limit(1);

    if (!employee) {
      throw new HrOnboardingCommandError("employee_not_found");
    }

    assertHrEmploymentStatusTransition(
      employee.employmentStatus,
      onboardingCase.targetStatus,
    );

    const effectiveDate = new Date();
    const completedAt = new Date();

    await db
      .update(hrOnboardingCases)
      .set({ status: "completed", completedAt })
      .where(eq(hrOnboardingCases.id, input.caseId));

    await db
      .update(hrEmployees)
      .set({ employmentStatus: onboardingCase.targetStatus })
      .where(eq(hrEmployees.id, onboardingCase.employeeId));

    const eventId = await insertOnboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: onboardingCase.employeeId,
      kind: "onboarding_complete",
      previousStatus: employee.employmentStatus,
      newStatus: onboardingCase.targetStatus,
      effectiveDate,
    });

    return { caseId: input.caseId, eventId };
  });
}

export async function cancelHrOnboarding(input: {
  organizationId: string;
  caseId: string;
  reason?: string | null;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [onboardingCase] = await db
      .select({
        id: hrOnboardingCases.id,
        employeeId: hrOnboardingCases.employeeId,
        status: hrOnboardingCases.status,
        priorEmploymentStatus: hrOnboardingCases.priorEmploymentStatus,
      })
      .from(hrOnboardingCases)
      .where(
        and(
          eq(hrOnboardingCases.organizationId, input.organizationId),
          eq(hrOnboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!onboardingCase) {
      throw new HrOnboardingCommandError("case_not_found");
    }
    if (onboardingCase.status !== "in_progress") {
      throw new HrOnboardingCommandError("case_not_in_progress");
    }

    const cancelledAt = new Date();
    await db
      .update(hrOnboardingCases)
      .set({
        status: "cancelled",
        cancelledAt,
        reason: input.reason?.trim() || undefined,
      })
      .where(eq(hrOnboardingCases.id, input.caseId));

    const eventId = await insertOnboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: onboardingCase.employeeId,
      kind: "onboarding_cancelled",
      previousStatus: "onboarding",
      newStatus: onboardingCase.priorEmploymentStatus,
      effectiveDate: cancelledAt,
      reason: input.reason,
    });

    return { caseId: input.caseId, eventId };
  });
}
