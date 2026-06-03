import { and, count, desc, eq, ilike, inArray, isNotNull, lt, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  HR_COMPLIANCE_EXCEPTION_GAP_KINDS,
  type HrComplianceExceptionGapKind,
} from "./hr-compliance-exception-sync.shared";
import { utcComplianceDayBounds } from "./hr-compliance-calendar.shared";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import { clampPageSize, loadComplianceExceptionForMutation, assertComplianceOwnerEmployeeInOrg } from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrComplianceExceptionWindow } from "./hr-compliance.types";
import { hrComplianceExceptions, hrEmployees } from "./hr";

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
    const ownerEmployee = alias(hrEmployees, "corrective_action_owner");
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
      const normalizedSearch = trimmedSearch.toLowerCase().replace(/[\s-]+/g, "_");
      if (normalizedSearch === "overdue") {
        const { start: startOfToday } = utcComplianceDayBounds(new Date());
        conditions.push(
          and(
            eq(hrComplianceExceptions.status, "in_progress"),
            isNotNull(hrComplianceExceptions.correctiveActionDueDate),
            lt(hrComplianceExceptions.correctiveActionDueDate, startOfToday),
          )!,
        );
      } else {
        const pattern = `%${trimmedSearch}%`;
        conditions.push(
          or(
            ilike(hrComplianceExceptions.title, pattern),
            ilike(hrComplianceExceptions.complianceArea, pattern),
            ilike(hrComplianceExceptions.itemType, pattern),
            ilike(hrComplianceExceptions.gapKind, pattern),
            ilike(hrEmployees.employeeNumber, pattern),
            ilike(hrEmployees.legalName, pattern),
            ilike(hrEmployees.preferredName, pattern),
            ilike(ownerEmployee.employeeNumber, pattern),
            ilike(ownerEmployee.legalName, pattern),
            ilike(ownerEmployee.preferredName, pattern),
          )!,
        );
      }
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrComplianceExceptions)
      .leftJoin(
        hrEmployees,
        eq(hrComplianceExceptions.employeeId, hrEmployees.id),
      )
      .leftJoin(
        ownerEmployee,
        eq(
          hrComplianceExceptions.correctiveActionOwnerEmployeeId,
          ownerEmployee.id,
        ),
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
        gapKind: hrComplianceExceptions.gapKind,
        title: hrComplianceExceptions.title,
        severity: hrComplianceExceptions.severity,
        status: hrComplianceExceptions.status,
        correctiveActionOwnerEmployeeId:
          hrComplianceExceptions.correctiveActionOwnerEmployeeId,
        ownerEmployeeNumber: ownerEmployee.employeeNumber,
        ownerLegalName: ownerEmployee.legalName,
        ownerPreferredName: ownerEmployee.preferredName,
        correctiveActionDueDate: hrComplianceExceptions.correctiveActionDueDate,
        correctiveActionDescription:
          hrComplianceExceptions.correctiveActionDescription,
        createdAt: hrComplianceExceptions.createdAt,
      })
      .from(hrComplianceExceptions)
      .leftJoin(
        hrEmployees,
        eq(hrComplianceExceptions.employeeId, hrEmployees.id),
      )
      .leftJoin(
        ownerEmployee,
        eq(
          hrComplianceExceptions.correctiveActionOwnerEmployeeId,
          ownerEmployee.id,
        ),
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
        gapKind: row.gapKind,
        title: row.title,
        severity: row.severity,
        status: row.status,
        correctiveActionOwnerEmployeeId: row.correctiveActionOwnerEmployeeId,
        correctiveActionOwnerEmployeeNumber: row.ownerEmployeeNumber,
        correctiveActionOwnerDisplayName: row.correctiveActionOwnerEmployeeId
          ? formatHrEmployeeDisplayName({
              preferredName: row.ownerPreferredName,
              legalName: row.ownerLegalName,
            })
          : null,
        correctiveActionDueDate: row.correctiveActionDueDate,
        correctiveActionDescription: row.correctiveActionDescription,
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
    correctiveActionOwnerEmployeeId?: string | null;
    correctiveActionDueDate?: Date | null;
    sourceReferenceId?: string | null;
    gapKind?: string | null;
  },
): Promise<{ exceptionId: string }> {
  const gapKind = input.gapKind?.trim() || null;
  if (
    gapKind &&
    !HR_COMPLIANCE_EXCEPTION_GAP_KINDS.includes(
      gapKind as HrComplianceExceptionGapKind,
    )
  ) {
    throw new HrComplianceCommandError("invalid_exception_gap_kind");
  }

  const exceptionId = createEntityId("hr_cmp_exc");
  const hasOwner = input.correctiveActionOwnerEmployeeId != null;
  const hasDueDate = input.correctiveActionDueDate != null;
  if (hasOwner !== hasDueDate) {
    throw new HrComplianceCommandError("corrective_action_assignment_incomplete");
  }

  const hasAssignedCorrectiveAction = hasOwner && hasDueDate;

  if (input.correctiveActionOwnerEmployeeId) {
    await assertComplianceOwnerEmployeeInOrg(db, {
      organizationId: input.organizationId,
      employeeId: input.correctiveActionOwnerEmployeeId,
    });
  }

  await db.insert(hrComplianceExceptions).values({
    id: exceptionId,
    organizationId: input.organizationId,
    employeeId: input.employeeId ?? null,
    title: input.title.trim(),
    complianceArea: input.complianceArea.trim(),
    itemType: input.itemType.trim(),
    severity: input.severity ?? "medium",
    status: hasAssignedCorrectiveAction ? "in_progress" : "open",
    correctiveActionDescription:
      input.correctiveActionDescription?.trim() || null,
    correctiveActionOwnerEmployeeId:
      input.correctiveActionOwnerEmployeeId ?? null,
    correctiveActionDueDate: input.correctiveActionDueDate ?? null,
    sourceReferenceId: input.sourceReferenceId?.trim() || null,
    gapKind,
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
  correctiveActionOwnerEmployeeId?: string | null;
  correctiveActionDueDate?: Date | null;
  sourceReferenceId?: string | null;
  gapKind?: string | null;
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
    correctiveActionOwnerEmployeeId: string;
    correctiveActionDueDate: Date;
  },
): Promise<{ exceptionId: string }> {
  await loadComplianceExceptionForMutation(db, input);
  await assertComplianceOwnerEmployeeInOrg(db, {
    organizationId: input.organizationId,
    employeeId: input.correctiveActionOwnerEmployeeId,
  });

  await db
    .update(hrComplianceExceptions)
    .set({
      status: "in_progress",
      correctiveActionDescription: input.correctiveActionDescription.trim(),
      correctiveActionOwnerEmployeeId: input.correctiveActionOwnerEmployeeId,
      correctiveActionDueDate: input.correctiveActionDueDate,
    })
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        eq(hrComplianceExceptions.id, input.exceptionId),
      ),
    );

  return { exceptionId: input.exceptionId };
}

export async function assignHrComplianceCorrectiveAction(input: {
  organizationId: string;
  exceptionId: string;
  correctiveActionDescription: string;
  correctiveActionOwnerEmployeeId: string;
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

  if (exception.status !== "in_progress") {
    throw new HrComplianceCommandError("corrective_action_not_assigned");
  }

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
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        eq(hrComplianceExceptions.id, exception.id),
      ),
    );

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
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        eq(hrComplianceExceptions.id, exception.id),
      ),
    );

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
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        eq(hrComplianceExceptions.id, exception.id),
      ),
    );

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
