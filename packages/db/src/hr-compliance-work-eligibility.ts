import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  formatHrEmployeeDisplayName,
  resolveWorkEligibilityVerifiedAt,
} from "./hr-compliance.shared";
import { activeEmployeeFilters, clampPageSize } from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrWorkEligibilityWindow } from "./hr-compliance.types";
import { hrComplianceWorkEligibility, hrEmployees } from "./hr";

export async function ensureHrWorkEligibilityTrackingInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
  },
): Promise<{
  createdCount: number;
  removedCount: number;
  totalTracked: number;
}> {
  const [employees, trackedRows] = await Promise.all([
    db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(activeEmployeeFilters(input.organizationId)),
    db
      .select({
        id: hrComplianceWorkEligibility.id,
        employeeId: hrComplianceWorkEligibility.employeeId,
      })
      .from(hrComplianceWorkEligibility)
      .where(
        eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
      ),
  ]);

  const activeEmployeeIds = new Set(employees.map((employee) => employee.id));
  const trackedByEmployeeId = new Map(
    trackedRows.map((row) => [row.employeeId, row]),
  );

  const inserts: (typeof hrComplianceWorkEligibility.$inferInsert)[] = [];
  for (const employee of employees) {
    if (!trackedByEmployeeId.has(employee.id)) {
      inserts.push({
        id: createEntityId("hr_cmp_we"),
        organizationId: input.organizationId,
        employeeId: employee.id,
        status: "pending_verification",
      });
    }
  }

  if (inserts.length > 0) {
    await db.insert(hrComplianceWorkEligibility).values(inserts);
  }

  return {
    createdCount: inserts.length,
    removedCount: 0,
    totalTracked: activeEmployeeIds.size,
  };
}

export async function ensureHrWorkEligibilityTracking(input: {
  organizationId: string;
}): Promise<{
  createdCount: number;
  removedCount: number;
  totalTracked: number;
}> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    ensureHrWorkEligibilityTrackingInTx(db, input),
  );
}

export async function listHrWorkEligibilityWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceWorkEligibility.$inferSelect)["status"];
}): Promise<HrWorkEligibilityWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
      activeEmployeeFilters(input.organizationId),
    ];

    if (input.status) {
      conditions.push(eq(hrComplianceWorkEligibility.status, input.status));
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

    const [totalRow, rows] = await Promise.all([
      db
        .select({ total: count() })
        .from(hrComplianceWorkEligibility)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id),
        )
        .where(whereClause),
      db
        .select({
          id: hrComplianceWorkEligibility.id,
          employeeId: hrComplianceWorkEligibility.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          legalName: hrEmployees.legalName,
          preferredName: hrEmployees.preferredName,
          status: hrComplianceWorkEligibility.status,
          verifiedAt: hrComplianceWorkEligibility.verifiedAt,
          expiresAt: hrComplianceWorkEligibility.expiresAt,
          reviewNotes: hrComplianceWorkEligibility.reviewNotes,
        })
        .from(hrComplianceWorkEligibility)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id),
        )
        .where(whereClause)
        .orderBy(desc(hrComplianceWorkEligibility.updatedAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const actualTotal = Number(totalRow[0]?.total ?? 0);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: formatHrEmployeeDisplayName({
          preferredName: row.preferredName,
          legalName: row.legalName,
        }),
        status: row.status,
        verifiedAt: row.verifiedAt,
        expiresAt: row.expiresAt,
        reviewNotes: row.reviewNotes,
      })),
      pageSize,
      offset,
      totalCount: actualTotal,
    });
  });
}

export async function updateHrWorkEligibilityStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    workEligibilityId: string;
    status: (typeof hrComplianceWorkEligibility.$inferSelect)["status"];
    verifiedAt?: Date | null;
    expiresAt?: Date | null;
    reviewNotes?: string | null;
  },
): Promise<{ workEligibilityId: string }> {
  const [record] = await db
    .select({
      id: hrComplianceWorkEligibility.id,
      status: hrComplianceWorkEligibility.status,
      verifiedAt: hrComplianceWorkEligibility.verifiedAt,
    })
    .from(hrComplianceWorkEligibility)
    .innerJoin(
      hrEmployees,
      eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id),
    )
    .where(
      and(
        eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
        eq(hrComplianceWorkEligibility.id, input.workEligibilityId),
        activeEmployeeFilters(input.organizationId),
      ),
    )
    .limit(1);

  if (!record) {
    throw new HrComplianceCommandError("work_eligibility_not_found");
  }

  const verifiedAt = resolveWorkEligibilityVerifiedAt({
    status: input.status,
    verifiedAt: input.verifiedAt,
    existingVerifiedAt: record.verifiedAt,
  });

  await db
    .update(hrComplianceWorkEligibility)
    .set({
      status: input.status,
      verifiedAt,
      expiresAt: input.expiresAt ?? null,
      reviewNotes: input.reviewNotes?.trim() || null,
    })
    .where(
      and(
        eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
        eq(hrComplianceWorkEligibility.id, input.workEligibilityId),
      ),
    );

  return { workEligibilityId: input.workEligibilityId };
}

export async function updateHrWorkEligibilityStatus(input: {
  organizationId: string;
  workEligibilityId: string;
  status: (typeof hrComplianceWorkEligibility.$inferSelect)["status"];
  verifiedAt?: Date | null;
  expiresAt?: Date | null;
  reviewNotes?: string | null;
}): Promise<{ workEligibilityId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrWorkEligibilityStatusInTx(db, input),
  );
}
