import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { HrBonusCommandError } from "./hr-bonus-incentive.shared";
import { hrBonusCycles, hrBonusPlans } from "./dbx-hr-bonus-incentive";

export async function listHrBonusCyclesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planId?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrBonusCycles.organizationId, input.organizationId)];

    if (input.planId?.trim()) {
      conditions.push(eq(hrBonusCycles.planId, input.planId.trim()));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusCycles.code, pattern),
          ilike(hrBonusCycles.name, pattern),
          ilike(hrBonusPlans.code, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusCycles)
      .innerJoin(hrBonusPlans, eq(hrBonusCycles.planId, hrBonusPlans.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusCycles.id,
        planCode: hrBonusPlans.code,
        planName: hrBonusPlans.name,
        code: hrBonusCycles.code,
        name: hrBonusCycles.name,
        cycleStatus: hrBonusCycles.cycleStatus,
        periodStartAt: hrBonusCycles.periodStartAt,
        periodEndAt: hrBonusCycles.periodEndAt,
        cutoffAt: hrBonusCycles.cutoffAt,
        approvalAt: hrBonusCycles.approvalAt,
        payoutAt: hrBonusCycles.payoutAt,
      })
      .from(hrBonusCycles)
      .innerJoin(hrBonusPlans, eq(hrBonusCycles.planId, hrBonusPlans.id))
      .where(whereClause)
      .orderBy(desc(hrBonusCycles.periodStartAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows,
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function upsertHrBonusCycleInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    code: string;
    name: string;
    periodStartAt: Date;
    periodEndAt: Date;
    cutoffAt?: Date | null;
    approvalAt?: Date | null;
    payoutAt?: Date | null;
    cycleStatus?: (typeof hrBonusCycles.$inferSelect)["cycleStatus"];
  },
): Promise<{ cycleId: string }> {
  if (input.periodEndAt.getTime() < input.periodStartAt.getTime()) {
    throw new HrBonusCommandError(
      "invalid_cycle_dates",
      "Cycle period end must be on or after period start.",
    );
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

  const code = input.code.trim();
  const [existing] = await db
    .select({ id: hrBonusCycles.id })
    .from(hrBonusCycles)
    .where(
      and(
        eq(hrBonusCycles.organizationId, input.organizationId),
        eq(hrBonusCycles.planId, input.planId),
        eq(hrBonusCycles.code, code),
      ),
    )
    .limit(1);

  const payload = {
    name: input.name.trim(),
    periodStartAt: input.periodStartAt,
    periodEndAt: input.periodEndAt,
    cutoffAt: input.cutoffAt ?? null,
    approvalAt: input.approvalAt ?? null,
    payoutAt: input.payoutAt ?? null,
    cycleStatus: input.cycleStatus ?? ("draft" as const),
  };

  if (existing) {
    await db
      .update(hrBonusCycles)
      .set(payload)
      .where(eq(hrBonusCycles.id, existing.id));
    return { cycleId: existing.id };
  }

  const cycleId = createEntityId("hr_bon_cycle");
  await db.insert(hrBonusCycles).values({
    id: cycleId,
    organizationId: input.organizationId,
    planId: input.planId,
    code,
    ...payload,
  });
  return { cycleId };
}

