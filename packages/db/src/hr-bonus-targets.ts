import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  formatEmployeeLabel,
} from "./hr-benefits.shared";
import { buildBonusTargetScopeKey } from "./hr-bonus-scope.shared";
import { HrBonusCommandError, parseNumeric } from "./hr-bonus-incentive.shared";
import {
  hrBonusCycles,
  hrBonusPlans,
  hrBonusTargets,
} from "./dbx-hr-bonus-incentive";
import { hrDepartments, hrEmployees } from "./hr";

export async function listHrBonusTargetsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planId?: string;
  cycleId?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrBonusTargets.organizationId, input.organizationId)];

    if (input.planId?.trim()) {
      conditions.push(eq(hrBonusTargets.planId, input.planId.trim()));
    }
    if (input.cycleId?.trim()) {
      conditions.push(eq(hrBonusTargets.cycleId, input.cycleId.trim()));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusTargets.label, pattern),
          ilike(hrBonusTargets.targetKind, pattern),
          ilike(hrBonusPlans.code, pattern),
          ilike(hrBonusCycles.code, pattern),
          ilike(hrEmployees.legalName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusTargets)
      .innerJoin(hrBonusPlans, eq(hrBonusTargets.planId, hrBonusPlans.id))
      .innerJoin(hrBonusCycles, eq(hrBonusTargets.cycleId, hrBonusCycles.id))
      .leftJoin(hrEmployees, eq(hrBonusTargets.employeeId, hrEmployees.id))
      .leftJoin(hrDepartments, eq(hrBonusTargets.departmentId, hrDepartments.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusTargets.id,
        planCode: hrBonusPlans.code,
        cycleCode: hrBonusCycles.code,
        targetKind: hrBonusTargets.targetKind,
        label: hrBonusTargets.label,
        scopeKey: hrBonusTargets.scopeKey,
        targetValue: hrBonusTargets.targetValue,
        currencyCode: hrBonusTargets.currencyCode,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentName: hrDepartments.name,
        teamRef: hrBonusTargets.teamRef,
        projectRef: hrBonusTargets.projectRef,
      })
      .from(hrBonusTargets)
      .innerJoin(hrBonusPlans, eq(hrBonusTargets.planId, hrBonusPlans.id))
      .innerJoin(hrBonusCycles, eq(hrBonusTargets.cycleId, hrBonusCycles.id))
      .leftJoin(hrEmployees, eq(hrBonusTargets.employeeId, hrEmployees.id))
      .leftJoin(hrDepartments, eq(hrBonusTargets.departmentId, hrDepartments.id))
      .where(whereClause)
      .orderBy(desc(hrBonusTargets.updatedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        planCode: row.planCode,
        cycleCode: row.cycleCode,
        targetKind: row.targetKind,
        scopeLabel:
          row.label ??
          (row.employeeNumber
            ? formatEmployeeLabel({
                employeeNumber: row.employeeNumber,
                legalName: row.legalName ?? row.employeeNumber ?? "Employee",
                preferredName: row.preferredName,
              })
            : row.departmentName ?? row.teamRef ?? row.projectRef ?? row.scopeKey),
        targetValue: row.targetValue,
        currencyCode: row.currencyCode,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function upsertHrBonusTargetInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    cycleId: string;
    targetKind: (typeof hrBonusTargets.$inferSelect)["targetKind"];
    targetValue: string;
    label?: string | null;
    employeeId?: string | null;
    departmentId?: string | null;
    teamRef?: string | null;
    projectRef?: string | null;
    currencyCode?: string | null;
    targetId?: string;
  },
): Promise<{ targetId: string }> {
  const targetNumeric = parseNumeric(input.targetValue);
  if (targetNumeric === null || targetNumeric < 0) {
    throw new HrBonusCommandError("invalid_target_value");
  }

  const [plan] = await db
    .select({ id: hrBonusPlans.id })
    .from(hrBonusPlans)
    .where(
      and(
        eq(hrBonusPlans.organizationId, input.organizationId),
        eq(hrBonusPlans.id, input.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBonusCommandError("plan_not_found");
  }

  const [cycle] = await db
    .select({ id: hrBonusCycles.id })
    .from(hrBonusCycles)
    .where(
      and(
        eq(hrBonusCycles.organizationId, input.organizationId),
        eq(hrBonusCycles.id, input.cycleId),
        eq(hrBonusCycles.planId, input.planId),
      ),
    )
    .limit(1);

  if (!cycle) {
    throw new HrBonusCommandError("cycle_not_found");
  }

  let scopeKey: string;
  try {
    scopeKey = buildBonusTargetScopeKey({
      targetKind: input.targetKind,
      employeeId: input.employeeId,
      departmentId: input.departmentId,
      teamRef: input.teamRef,
      projectRef: input.projectRef,
      label: input.label,
    });
  } catch {
    throw new HrBonusCommandError(
      "invalid_target_scope",
      "Target scope is incomplete for the selected target kind.",
    );
  }

  const payload = {
    planId: input.planId,
    cycleId: input.cycleId,
    targetKind: input.targetKind,
    scopeKey,
    label: input.label?.trim() || null,
    employeeId: input.employeeId?.trim() || null,
    departmentId: input.departmentId?.trim() || null,
    teamRef: input.teamRef?.trim() || null,
    projectRef: input.projectRef?.trim() || null,
    targetValue: input.targetValue,
    currencyCode: input.currencyCode?.trim() || null,
  };

  if (input.targetId?.trim()) {
    const [existing] = await db
      .select({ id: hrBonusTargets.id })
      .from(hrBonusTargets)
      .where(
        and(
          eq(hrBonusTargets.organizationId, input.organizationId),
          eq(hrBonusTargets.id, input.targetId.trim()),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrBonusCommandError("target_not_found");
    }

    await db
      .update(hrBonusTargets)
      .set(payload)
      .where(eq(hrBonusTargets.id, existing.id));
    return { targetId: existing.id };
  }

  const [existingScope] = await db
    .select({ id: hrBonusTargets.id })
    .from(hrBonusTargets)
    .where(
      and(
        eq(hrBonusTargets.organizationId, input.organizationId),
        eq(hrBonusTargets.cycleId, input.cycleId),
        eq(hrBonusTargets.targetKind, input.targetKind),
        eq(hrBonusTargets.scopeKey, scopeKey),
      ),
    )
    .limit(1);

  if (existingScope) {
    await db
      .update(hrBonusTargets)
      .set(payload)
      .where(eq(hrBonusTargets.id, existingScope.id));
    return { targetId: existingScope.id };
  }

  const targetId = createEntityId("hr_bon_target");
  await db.insert(hrBonusTargets).values({
    id: targetId,
    organizationId: input.organizationId,
    ...payload,
  });
  return { targetId };
}

