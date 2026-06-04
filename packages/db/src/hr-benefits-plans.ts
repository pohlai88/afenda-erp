import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  HrBenefitsCommandError,
  normalizeScopeText,
} from "./hr-benefits.shared";
import type { HrBenefitPlanWindow } from "./hr-benefits.types";
import {
  hrBenefitPlans,
  hrBenefitProviders,
} from "./dbx-hr-benefits";

export async function listHrBenefitPlansWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planStatus?: (typeof hrBenefitPlans.$inferSelect)["planStatus"];
}): Promise<HrBenefitPlanWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBenefitPlans.organizationId, input.organizationId),
    ];

    if (input.planStatus) {
      conditions.push(eq(hrBenefitPlans.planStatus, input.planStatus));
    } else {
      conditions.push(eq(hrBenefitPlans.planStatus, "active"));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBenefitPlans.code, pattern),
          ilike(hrBenefitPlans.name, pattern),
          ilike(hrBenefitPlans.category, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBenefitPlans)
      .leftJoin(
        hrBenefitProviders,
        eq(hrBenefitPlans.providerId, hrBenefitProviders.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBenefitPlans.id,
        code: hrBenefitPlans.code,
        name: hrBenefitPlans.name,
        category: hrBenefitPlans.category,
        providerName: hrBenefitProviders.name,
        planStatus: hrBenefitPlans.planStatus,
        effectiveFrom: hrBenefitPlans.effectiveFrom,
      })
      .from(hrBenefitPlans)
      .leftJoin(
        hrBenefitProviders,
        eq(hrBenefitPlans.providerId, hrBenefitProviders.id),
      )
      .where(whereClause)
      .orderBy(desc(hrBenefitPlans.updatedAt))
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

export async function upsertHrBenefitPlanInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    name: string;
    category: (typeof hrBenefitPlans.$inferSelect)["category"];
    description?: string | null;
    providerId?: string | null;
    allowsDependents?: boolean;
    defaultCoverageLevel?: (typeof hrBenefitPlans.$inferSelect)["defaultCoverageLevel"];
    employerContributionAmount?: string | null;
    employeeContributionAmount?: string | null;
    currencyCode?: string;
    requiresApproval?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  },
): Promise<{ planId: string }> {
  const code = input.code.trim();
  const [existing] = await db
    .select({ id: hrBenefitPlans.id })
    .from(hrBenefitPlans)
    .where(
      and(
        eq(hrBenefitPlans.organizationId, input.organizationId),
        eq(hrBenefitPlans.code, code),
      ),
    )
    .limit(1);

  const payload = {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    category: input.category,
    providerId: input.providerId ?? null,
    allowsDependents: input.allowsDependents ?? false,
    defaultCoverageLevel: input.defaultCoverageLevel ?? "employee_only",
    employerContributionAmount: input.employerContributionAmount ?? null,
    employeeContributionAmount: input.employeeContributionAmount ?? null,
    currencyCode: normalizeScopeText(input.currencyCode) ?? "USD",
    requiresApproval: input.requiresApproval ?? false,
    effectiveFrom: input.effectiveFrom ?? new Date(),
    effectiveTo: input.effectiveTo ?? null,
    planStatus: "active" as const,
    archivedAt: null,
  };

  if (existing) {
    await db
      .update(hrBenefitPlans)
      .set(payload)
      .where(eq(hrBenefitPlans.id, existing.id));
    return { planId: existing.id };
  }

  const planId = createEntityId("hr_ben_plan");
  await db.insert(hrBenefitPlans).values({
    id: planId,
    organizationId: input.organizationId,
    code,
    ...payload,
  });
  return { planId };
}

export async function upsertHrBenefitPlan(input: {
  organizationId: string;
  code: string;
  name: string;
  category: (typeof hrBenefitPlans.$inferSelect)["category"];
  description?: string | null;
  providerId?: string | null;
  allowsDependents?: boolean;
  defaultCoverageLevel?: (typeof hrBenefitPlans.$inferSelect)["defaultCoverageLevel"];
  employerContributionAmount?: string | null;
  employeeContributionAmount?: string | null;
  currencyCode?: string;
  requiresApproval?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}): Promise<{ planId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    upsertHrBenefitPlanInTx(db, input),
  );
}

export async function archiveHrBenefitPlanInTx(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
): Promise<{ planId: string }> {
  const [plan] = await db
    .select({ id: hrBenefitPlans.id })
    .from(hrBenefitPlans)
    .where(
      and(
        eq(hrBenefitPlans.organizationId, input.organizationId),
        eq(hrBenefitPlans.id, input.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBenefitsCommandError("plan_not_found");
  }

  await db
    .update(hrBenefitPlans)
    .set({
      planStatus: "archived",
      archivedAt: new Date(),
    })
    .where(eq(hrBenefitPlans.id, plan.id));

  return { planId: plan.id };
}

