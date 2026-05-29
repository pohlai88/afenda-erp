import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrComplianceExceptions,
  hrComplianceObligations,
  hrDepartments,
  hrEmployees,
} from "./schema/hr";

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
};

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

export class HrComplianceCommandError extends Error {
  readonly code:
    | "obligation_not_found"
    | "duplicate_obligation_code"
    | "exception_not_found"
    | "exception_not_open";

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

export async function listHrComplianceObligationsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceObligations.$inferSelect)["status"];
  complianceArea?: string;
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

export async function upsertHrComplianceObligation(input: {
  organizationId: string;
  code: string;
  title: string;
  complianceArea: string;
  requirementKind: string;
  description?: string | null;
  departmentId?: string | null;
  dueDate?: Date | null;
}): Promise<{ obligationId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const code = input.code.trim();
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
    });

    return { obligationId };
  });
}

export async function archiveHrComplianceObligation(input: {
  organizationId: string;
  obligationId: string;
}): Promise<{ obligationId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
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
  });
}

function assertExceptionIsOpen(status: string): void {
  if (status === "resolved" || status === "waived") {
    throw new HrComplianceCommandError("exception_not_open");
  }
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
  return runWithOrganizationContext(input.organizationId, async (db) => {
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
  });
}

export async function assignHrComplianceCorrectiveAction(input: {
  organizationId: string;
  exceptionId: string;
  correctiveActionDescription: string;
  correctiveActionDueDate: Date;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
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
  });
}

export async function updateHrComplianceCorrectiveActionProgress(input: {
  organizationId: string;
  exceptionId: string;
  progressNote: string;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
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
  });
}

export async function waiveHrComplianceException(input: {
  organizationId: string;
  exceptionId: string;
  waiverReason: string;
  approvalReference: string;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
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
  });
}

export async function resolveHrComplianceException(input: {
  organizationId: string;
  exceptionId: string;
  resolutionNote?: string | null;
}): Promise<{ exceptionId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
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
  });
}
