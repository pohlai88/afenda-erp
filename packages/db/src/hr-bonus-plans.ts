import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  normalizeScopeText,
} from "./hr-benefits.shared";
import { HrBonusCommandError } from "./hr-bonus-incentive.shared";
import { hrBonusPlans } from "./schema/hr-bonus-incentive";

export async function listHrBonusPlansWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planStatus?: (typeof hrBonusPlans.$inferSelect)["planStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrBonusPlans.organizationId, input.organizationId)];

    if (input.planStatus) {
      conditions.push(eq(hrBonusPlans.planStatus, input.planStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusPlans.code, pattern),
          ilike(hrBonusPlans.name, pattern),
          ilike(hrBonusPlans.planType, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusPlans)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusPlans.id,
        code: hrBonusPlans.code,
        name: hrBonusPlans.name,
        planType: hrBonusPlans.planType,
        planStatus: hrBonusPlans.planStatus,
        currencyCode: hrBonusPlans.currencyCode,
        requiresApproval: hrBonusPlans.requiresApproval,
        effectiveFrom: hrBonusPlans.effectiveFrom,
      })
      .from(hrBonusPlans)
      .where(whereClause)
      .orderBy(desc(hrBonusPlans.updatedAt))
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

export async function upsertHrBonusPlanInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    name: string;
    planType: (typeof hrBonusPlans.$inferSelect)["planType"];
    description?: string | null;
    currencyCode?: string;
    requiresApproval?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    planStatus?: (typeof hrBonusPlans.$inferSelect)["planStatus"];
  },
): Promise<{ planId: string }> {
  const code = input.code.trim();
  const [existing] = await db
    .select({ id: hrBonusPlans.id })
    .from(hrBonusPlans)
    .where(
      and(
        eq(hrBonusPlans.organizationId, input.organizationId),
        eq(hrBonusPlans.code, code),
      ),
    )
    .limit(1);

  const payload = {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    planType: input.planType,
    currencyCode: normalizeScopeText(input.currencyCode) ?? "USD",
    requiresApproval: input.requiresApproval ?? true,
    effectiveFrom: input.effectiveFrom ?? new Date(),
    effectiveTo: input.effectiveTo ?? null,
    planStatus: input.planStatus ?? ("active" as const),
    archivedAt: null,
  };

  if (existing) {
    await db
      .update(hrBonusPlans)
      .set(payload)
      .where(eq(hrBonusPlans.id, existing.id));
    return { planId: existing.id };
  }

  const planId = createEntityId("hr_bon_plan");
  await db.insert(hrBonusPlans).values({
    id: planId,
    organizationId: input.organizationId,
    code,
    ...payload,
  });
  return { planId };
}

export async function archiveHrBonusPlanInTx(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
): Promise<{ planId: string }> {
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

  await db
    .update(hrBonusPlans)
    .set({
      planStatus: "archived",
      archivedAt: new Date(),
    })
    .where(eq(hrBonusPlans.id, plan.id));

  return { planId: plan.id };
}
