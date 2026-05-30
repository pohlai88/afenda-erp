import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appliesComplianceObligationToEmployee } from "./hr-compliance-scope.shared";
import { buildEmployeeObligationTrackingKey } from "./hr-compliance-labor-law.shared";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import {
  activeEmployeeFilters,
  appendEmployeeRequirementWindowSearchCondition,
  clampPageSize,
  normalizeStoredRequirementStatusForMutation,
  resolveTrackedRequirementDueDateSync,
} from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrEmployeeWorkplaceSafetyRequirementWindow } from "./hr-compliance.types";
import {
  activeWorkplaceSafetyObligationKindCondition,
} from "./hr-compliance-workplace-safety.shared";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceObligations,
  hrEmployees,
} from "./schema/hr";

export async function syncHrEmployeeWorkplaceSafetyRequirementsInTx(
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
          activeWorkplaceSafetyObligationKindCondition,
        ),
      ),
    db
      .select({
        id: hrComplianceEmployeeRequirements.id,
        employeeId: hrComplianceEmployeeRequirements.employeeId,
        obligationId: hrComplianceEmployeeRequirements.obligationId,
        status: hrComplianceEmployeeRequirements.status,
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
          activeWorkplaceSafetyObligationKindCondition,
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

      const dueDateSync = resolveTrackedRequirementDueDateSync({
        trackedId: tracked.id,
        trackedStatus: tracked.status,
        trackedDueDate: tracked.dueDate,
        obligationDueDate: obligation.dueDate,
        syncDueDateWhenNotPending: false,
      });
      if (dueDateSync) {
        dueDateUpdates.push(dueDateSync);
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

export async function syncHrEmployeeWorkplaceSafetyRequirements(input: {
  organizationId: string;
}): Promise<{
  createdCount: number;
  removedCount: number;
  dueDateUpdatedCount: number;
  totalTracked: number;
}> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    syncHrEmployeeWorkplaceSafetyRequirementsInTx(db, input),
  );
}

export async function listHrEmployeeWorkplaceSafetyRequirementsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
}): Promise<HrEmployeeWorkplaceSafetyRequirementWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceEmployeeRequirements.organizationId, input.organizationId),
      activeWorkplaceSafetyObligationKindCondition,
      eq(hrComplianceObligations.status, "active"),
      activeEmployeeFilters(input.organizationId),
    ];

    if (input.status) {
      conditions.push(eq(hrComplianceEmployeeRequirements.status, input.status));
    }

    appendEmployeeRequirementWindowSearchCondition(conditions, {
      search: input.search,
      employeeNumber: hrEmployees.employeeNumber,
      legalName: hrEmployees.legalName,
      preferredName: hrEmployees.preferredName,
      obligationCode: hrComplianceObligations.code,
      obligationTitle: hrComplianceObligations.title,
      complianceArea: hrComplianceObligations.complianceArea,
      requirementStatus: hrComplianceEmployeeRequirements.status,
      requirementDueDate: hrComplianceEmployeeRequirements.dueDate,
    });

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

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: formatHrEmployeeDisplayName({
          preferredName: row.preferredName,
          legalName: row.legalName,
        }),
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
      offset,
      totalCount: actualTotal,
    });
  });
}

export async function updateHrEmployeeWorkplaceSafetyRequirementStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    requirementId: string;
    status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
    reviewNotes?: string | null;
    certificationExpiresAt?: Date | null;
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
        activeWorkplaceSafetyObligationKindCondition,
      ),
    )
    .limit(1);

  if (!requirement) {
    throw new HrComplianceCommandError("requirement_not_found");
  }

  const storedStatus = normalizeStoredRequirementStatusForMutation(input.status);
  const completedAt = storedStatus === "compliant" ? new Date() : null;

  await db
    .update(hrComplianceEmployeeRequirements)
    .set({
      status: storedStatus,
      reviewNotes: input.reviewNotes?.trim() || null,
      completedAt,
      ...(input.certificationExpiresAt !== undefined
        ? { dueDate: input.certificationExpiresAt }
        : {}),
    })
    .where(eq(hrComplianceEmployeeRequirements.id, input.requirementId));

  return { requirementId: input.requirementId };
}

export async function updateHrEmployeeWorkplaceSafetyRequirementStatus(input: {
  organizationId: string;
  requirementId: string;
  status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
  reviewNotes?: string | null;
  certificationExpiresAt?: Date | null;
}): Promise<{ requirementId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrEmployeeWorkplaceSafetyRequirementStatusInTx(db, input),
  );
}
