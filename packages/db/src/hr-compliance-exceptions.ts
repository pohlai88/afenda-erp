import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import { clampPageSize, loadComplianceExceptionForMutation } from "./hr-compliance.internal";
import type { HrComplianceExceptionWindow } from "./hr-compliance.types";
import { hrComplianceExceptions, hrEmployees } from "./schema/hr";

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

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.employeeId
          ? formatHrEmployeeDisplayName({
              preferredName: row.preferredName,
              legalName: row.legalName,
            })
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
      offset,
      totalCount: actualTotal,
    });
  });
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
  const exception = await loadComplianceExceptionForMutation(db, input);

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "in_progress",
      correctiveActionDescription: input.correctiveActionDescription.trim(),
      correctiveActionDueDate: input.correctiveActionDueDate,
    })
    .where(eq(hrComplianceExceptions.id, exception.id));

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
  const exception = await loadComplianceExceptionForMutation(db, input);

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
    .where(eq(hrComplianceExceptions.id, exception.id));

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
  const exception = await loadComplianceExceptionForMutation(db, input);

  const resolutionNote = `${input.waiverReason.trim()} (ref: ${input.approvalReference.trim()})`;

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "waived",
      resolutionNote,
      resolvedAt: new Date(),
    })
    .where(eq(hrComplianceExceptions.id, exception.id));

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
  const exception = await loadComplianceExceptionForMutation(db, input);

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "resolved",
      resolutionNote: input.resolutionNote?.trim() || null,
      resolvedAt: new Date(),
    })
    .where(eq(hrComplianceExceptions.id, exception.id));

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
