import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  activeFilingObligationKindCondition,
  isPendingLikeFilingStatus,
  resolveFilingConfirmedAt,
  resolveFilingSubmittedAt,
} from "./hr-compliance-filings.shared";
import { buildPaginatedWindow } from "./hr-compliance.shared";
import { clampPageSize } from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrComplianceFilingWindow } from "./hr-compliance.types";
import {
  hrComplianceFilings,
  hrComplianceObligations,
  hrDepartments,
} from "./hr";

export async function syncHrComplianceFilingsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
  },
): Promise<{
  createdCount: number;
  removedCount: number;
  deadlineUpdatedCount: number;
  totalTracked: number;
}> {
  const [obligations, trackedRows] = await Promise.all([
    db
      .select({
        id: hrComplianceObligations.id,
        dueDate: hrComplianceObligations.dueDate,
      })
      .from(hrComplianceObligations)
      .where(
        and(
          eq(hrComplianceObligations.organizationId, input.organizationId),
          eq(hrComplianceObligations.status, "active"),
          activeFilingObligationKindCondition,
        ),
      ),
    db
      .select({
        id: hrComplianceFilings.id,
        obligationId: hrComplianceFilings.obligationId,
        status: hrComplianceFilings.status,
        filingDeadline: hrComplianceFilings.filingDeadline,
      })
      .from(hrComplianceFilings)
      .where(eq(hrComplianceFilings.organizationId, input.organizationId)),
  ]);

  const obligationIds = new Set(obligations.map((obligation) => obligation.id));
  const trackedByObligationId = new Map(
    trackedRows.map((row) => [row.obligationId, row]),
  );

  const inserts: (typeof hrComplianceFilings.$inferInsert)[] = [];
  const deadlineUpdates: Array<{ id: string; filingDeadline: Date | null }> = [];

  for (const obligation of obligations) {
    const tracked = trackedByObligationId.get(obligation.id);
    if (!tracked) {
      inserts.push({
        id: createEntityId("hr_cmp_fil"),
        organizationId: input.organizationId,
        obligationId: obligation.id,
        status: "pending",
        filingDeadline: obligation.dueDate,
      });
      continue;
    }

    if (!isPendingLikeFilingStatus(tracked.status)) {
      continue;
    }

    const obligationDeadlineMs = obligation.dueDate?.getTime() ?? null;
    const trackedDeadlineMs = tracked.filingDeadline?.getTime() ?? null;
    if (obligationDeadlineMs !== trackedDeadlineMs) {
      deadlineUpdates.push({
        id: tracked.id,
        filingDeadline: obligation.dueDate ?? null,
      });
    }
  }

  const staleIds = trackedRows
    .filter((row) => !obligationIds.has(row.obligationId))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    await db
      .delete(hrComplianceFilings)
      .where(
        and(
          eq(hrComplianceFilings.organizationId, input.organizationId),
          inArray(hrComplianceFilings.id, staleIds),
        ),
      );
  }

  if (inserts.length > 0) {
    await db.insert(hrComplianceFilings).values(inserts);
  }

  if (deadlineUpdates.length > 0) {
    await Promise.all(
      deadlineUpdates.map((update) =>
        db
          .update(hrComplianceFilings)
          .set({ filingDeadline: update.filingDeadline })
          .where(eq(hrComplianceFilings.id, update.id)),
      ),
    );
  }

  return {
    createdCount: inserts.length,
    removedCount: staleIds.length,
    deadlineUpdatedCount: deadlineUpdates.length,
    totalTracked: obligationIds.size,
  };
}

export async function syncHrComplianceFilings(input: {
  organizationId: string;
}): Promise<{
  createdCount: number;
  removedCount: number;
  deadlineUpdatedCount: number;
  totalTracked: number;
}> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    syncHrComplianceFilingsInTx(db, input),
  );
}

export async function listHrComplianceFilingsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceFilings.$inferSelect)["status"];
}): Promise<HrComplianceFilingWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceFilings.organizationId, input.organizationId),
      activeFilingObligationKindCondition,
      eq(hrComplianceObligations.status, "active"),
    ];

    if (input.status) {
      conditions.push(eq(hrComplianceFilings.status, input.status));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrComplianceObligations.code, pattern),
          ilike(hrComplianceObligations.title, pattern),
          ilike(hrComplianceObligations.complianceArea, pattern),
          ilike(hrComplianceObligations.countryCode, pattern),
          ilike(hrComplianceObligations.legalEntityCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow, rows] = await Promise.all([
      db
        .select({ total: count() })
        .from(hrComplianceFilings)
        .innerJoin(
          hrComplianceObligations,
          eq(hrComplianceFilings.obligationId, hrComplianceObligations.id),
        )
        .leftJoin(
          hrDepartments,
          eq(hrComplianceObligations.departmentId, hrDepartments.id),
        )
        .where(whereClause),
      db
        .select({
          id: hrComplianceFilings.id,
          obligationId: hrComplianceFilings.obligationId,
          obligationCode: hrComplianceObligations.code,
          obligationTitle: hrComplianceObligations.title,
          complianceArea: hrComplianceObligations.complianceArea,
          countryCode: hrComplianceObligations.countryCode,
          legalEntityCode: hrComplianceObligations.legalEntityCode,
          workLocationCode: hrComplianceObligations.workLocationCode,
          employmentType: hrComplianceObligations.employmentType,
          workerCategory: hrComplianceObligations.workerCategory,
          departmentName: hrDepartments.name,
          status: hrComplianceFilings.status,
          filingDeadline: hrComplianceFilings.filingDeadline,
          submittedAt: hrComplianceFilings.submittedAt,
          confirmedAt: hrComplianceFilings.confirmedAt,
          reviewNotes: hrComplianceFilings.reviewNotes,
        })
        .from(hrComplianceFilings)
        .innerJoin(
          hrComplianceObligations,
          eq(hrComplianceFilings.obligationId, hrComplianceObligations.id),
        )
        .leftJoin(
          hrDepartments,
          eq(hrComplianceObligations.departmentId, hrDepartments.id),
        )
        .where(whereClause)
        .orderBy(
          asc(hrComplianceFilings.filingDeadline),
          desc(hrComplianceFilings.updatedAt),
        )
        .limit(pageSize)
        .offset(offset),
    ]);

    const actualTotal = Number(totalRow[0]?.total ?? 0);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        obligationId: row.obligationId,
        obligationCode: row.obligationCode,
        obligationTitle: row.obligationTitle,
        complianceArea: row.complianceArea,
        countryCode: row.countryCode,
        legalEntityCode: row.legalEntityCode,
        workLocationCode: row.workLocationCode,
        employmentType: row.employmentType,
        workerCategory: row.workerCategory,
        departmentName: row.departmentName,
        status: row.status,
        filingDeadline: row.filingDeadline,
        submittedAt: row.submittedAt,
        confirmedAt: row.confirmedAt,
        reviewNotes: row.reviewNotes,
      })),
      pageSize,
      offset,
      totalCount: actualTotal,
    });
  });
}

export async function updateHrComplianceFilingInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    filingId: string;
    status: (typeof hrComplianceFilings.$inferSelect)["status"];
    filingDeadline?: Date | null;
    reviewNotes?: string | null;
  },
): Promise<{ filingId: string }> {
  const [record] = await db
    .select({
      id: hrComplianceFilings.id,
      status: hrComplianceFilings.status,
      submittedAt: hrComplianceFilings.submittedAt,
      confirmedAt: hrComplianceFilings.confirmedAt,
    })
    .from(hrComplianceFilings)
    .innerJoin(
      hrComplianceObligations,
      eq(hrComplianceFilings.obligationId, hrComplianceObligations.id),
    )
    .where(
      and(
        eq(hrComplianceFilings.organizationId, input.organizationId),
        eq(hrComplianceFilings.id, input.filingId),
        activeFilingObligationKindCondition,
      ),
    )
    .limit(1);

  if (!record) {
    throw new HrComplianceCommandError("filing_not_found");
  }

  const storedStatus = input.status === "overdue" ? "pending" : input.status;
  const submittedAt = resolveFilingSubmittedAt({
    status: storedStatus,
    existingSubmittedAt: record.submittedAt,
  });
  const confirmedAt = resolveFilingConfirmedAt({
    status: storedStatus,
    existingConfirmedAt: record.confirmedAt,
  });

  const updateValues: Partial<typeof hrComplianceFilings.$inferInsert> = {
    status: storedStatus,
    submittedAt,
    confirmedAt,
    reviewNotes: input.reviewNotes?.trim() || null,
  };

  if (input.filingDeadline !== undefined) {
    updateValues.filingDeadline = input.filingDeadline;
  }

  await db
    .update(hrComplianceFilings)
    .set(updateValues)
    .where(eq(hrComplianceFilings.id, input.filingId));

  return { filingId: input.filingId };
}

export async function updateHrComplianceFiling(input: {
  organizationId: string;
  filingId: string;
  status: (typeof hrComplianceFilings.$inferSelect)["status"];
  filingDeadline?: Date | null;
  reviewNotes?: string | null;
}): Promise<{ filingId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrComplianceFilingInTx(db, input),
  );
}
