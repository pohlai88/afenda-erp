import { and, count, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  HrBenefitsCommandError,
} from "./hr-benefits.shared";
import type { HrBenefitOpenEnrollmentWindowList } from "./hr-benefits.types";
import {
  hrBenefitOpenEnrollmentPlans,
  hrBenefitOpenEnrollmentWindows,
} from "./schema/hr-benefits";

export function isOpenEnrollmentWindowActive(input: {
  status: (typeof hrBenefitOpenEnrollmentWindows.$inferSelect)["status"];
  enrollmentStartAt: Date;
  enrollmentEndAt: Date;
  asOf?: Date;
}): boolean {
  if (input.status !== "active") {
    return false;
  }
  const asOf = input.asOf ?? new Date();
  return (
    asOf.getTime() >= input.enrollmentStartAt.getTime() &&
    asOf.getTime() <= input.enrollmentEndAt.getTime()
  );
}

export async function assertOpenEnrollmentAllowsPlanInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    windowId: string;
    planId: string;
    asOf?: Date;
  },
): Promise<void> {
  const [window] = await db
    .select({
      id: hrBenefitOpenEnrollmentWindows.id,
      status: hrBenefitOpenEnrollmentWindows.status,
      enrollmentStartAt: hrBenefitOpenEnrollmentWindows.enrollmentStartAt,
      enrollmentEndAt: hrBenefitOpenEnrollmentWindows.enrollmentEndAt,
    })
    .from(hrBenefitOpenEnrollmentWindows)
    .where(
      and(
        eq(hrBenefitOpenEnrollmentWindows.organizationId, input.organizationId),
        eq(hrBenefitOpenEnrollmentWindows.id, input.windowId),
      ),
    )
    .limit(1);

  if (!window) {
    throw new HrBenefitsCommandError("window_not_found");
  }

  if (
    !isOpenEnrollmentWindowActive({
      status: window.status,
      enrollmentStartAt: window.enrollmentStartAt,
      enrollmentEndAt: window.enrollmentEndAt,
      asOf: input.asOf,
    })
  ) {
    throw new HrBenefitsCommandError("open_enrollment_closed");
  }

  const [planLink] = await db
    .select({ id: hrBenefitOpenEnrollmentPlans.id })
    .from(hrBenefitOpenEnrollmentPlans)
    .where(
      and(
        eq(hrBenefitOpenEnrollmentPlans.organizationId, input.organizationId),
        eq(hrBenefitOpenEnrollmentPlans.windowId, input.windowId),
        eq(hrBenefitOpenEnrollmentPlans.planId, input.planId),
      ),
    )
    .limit(1);

  if (!planLink) {
    throw new HrBenefitsCommandError("open_enrollment_plan_not_in_window");
  }
}

export async function listHrBenefitOpenEnrollmentWindowsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrBenefitOpenEnrollmentWindowList> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBenefitOpenEnrollmentWindows.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBenefitOpenEnrollmentWindows.code, pattern),
          ilike(hrBenefitOpenEnrollmentWindows.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBenefitOpenEnrollmentWindows)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBenefitOpenEnrollmentWindows.id,
        code: hrBenefitOpenEnrollmentWindows.code,
        name: hrBenefitOpenEnrollmentWindows.name,
        status: hrBenefitOpenEnrollmentWindows.status,
        enrollmentStartAt: hrBenefitOpenEnrollmentWindows.enrollmentStartAt,
        enrollmentEndAt: hrBenefitOpenEnrollmentWindows.enrollmentEndAt,
        coverageEffectiveFrom:
          hrBenefitOpenEnrollmentWindows.coverageEffectiveFrom,
      })
      .from(hrBenefitOpenEnrollmentWindows)
      .where(whereClause)
      .orderBy(desc(hrBenefitOpenEnrollmentWindows.enrollmentStartAt))
      .limit(pageSize)
      .offset(offset);

    const windowIds = rows.map((row) => row.id);
    const planCounts =
      windowIds.length > 0
        ? await db
            .select({
              windowId: hrBenefitOpenEnrollmentPlans.windowId,
              planCount: count(),
            })
            .from(hrBenefitOpenEnrollmentPlans)
            .where(
              and(
                eq(
                  hrBenefitOpenEnrollmentPlans.organizationId,
                  input.organizationId,
                ),
                inArray(hrBenefitOpenEnrollmentPlans.windowId, windowIds),
              ),
            )
            .groupBy(hrBenefitOpenEnrollmentPlans.windowId)
        : [];

    const planCountByWindow = new Map(
      planCounts.map((row) => [row.windowId, Number(row.planCount)]),
    );

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        ...row,
        planCount: planCountByWindow.get(row.id) ?? 0,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function upsertHrBenefitOpenEnrollmentWindowInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    name: string;
    enrollmentStartAt: Date;
    enrollmentEndAt: Date;
    coverageEffectiveFrom: Date;
    coverageEffectiveTo?: Date | null;
    status?: (typeof hrBenefitOpenEnrollmentWindows.$inferSelect)["status"];
    planIds?: readonly string[];
  },
): Promise<{ windowId: string }> {
  if (input.enrollmentEndAt.getTime() < input.enrollmentStartAt.getTime()) {
    throw new HrBenefitsCommandError("invalid_window_dates");
  }

  const code = input.code.trim();
  const [existing] = await db
    .select({ id: hrBenefitOpenEnrollmentWindows.id })
    .from(hrBenefitOpenEnrollmentWindows)
    .where(
      and(
        eq(hrBenefitOpenEnrollmentWindows.organizationId, input.organizationId),
        eq(hrBenefitOpenEnrollmentWindows.code, code),
      ),
    )
    .limit(1);

  const payload = {
    name: input.name.trim(),
    enrollmentStartAt: input.enrollmentStartAt,
    enrollmentEndAt: input.enrollmentEndAt,
    coverageEffectiveFrom: input.coverageEffectiveFrom,
    coverageEffectiveTo: input.coverageEffectiveTo ?? null,
    status: input.status ?? ("draft" as const),
  };

  let windowId: string;
  if (existing) {
    windowId = existing.id;
    await db
      .update(hrBenefitOpenEnrollmentWindows)
      .set(payload)
      .where(eq(hrBenefitOpenEnrollmentWindows.id, windowId));
  } else {
    windowId = createEntityId("hr_ben_oew");
    await db.insert(hrBenefitOpenEnrollmentWindows).values({
      id: windowId,
      organizationId: input.organizationId,
      code,
      ...payload,
    });
  }

  if (input.planIds?.length) {
    await db
      .delete(hrBenefitOpenEnrollmentPlans)
      .where(
        and(
          eq(hrBenefitOpenEnrollmentPlans.organizationId, input.organizationId),
          eq(hrBenefitOpenEnrollmentPlans.windowId, windowId),
        ),
      );

    await db.insert(hrBenefitOpenEnrollmentPlans).values(
      input.planIds.map((planId) => ({
        id: createEntityId("hr_ben_oep"),
        organizationId: input.organizationId,
        windowId,
        planId,
      })),
    );
  }

  return { windowId };
}

export async function activateHrBenefitOpenEnrollmentWindowInTx(
  db: AfendaTransaction,
  input: { organizationId: string; windowId: string },
): Promise<{ windowId: string }> {
  const [window] = await db
    .select({ id: hrBenefitOpenEnrollmentWindows.id })
    .from(hrBenefitOpenEnrollmentWindows)
    .where(
      and(
        eq(hrBenefitOpenEnrollmentWindows.organizationId, input.organizationId),
        eq(hrBenefitOpenEnrollmentWindows.id, input.windowId),
      ),
    )
    .limit(1);

  if (!window) {
    throw new HrBenefitsCommandError("window_not_found");
  }

  await db
    .update(hrBenefitOpenEnrollmentWindows)
    .set({ status: "active" })
    .where(eq(hrBenefitOpenEnrollmentWindows.id, window.id));

  return { windowId: window.id };
}

export async function findActiveOpenEnrollmentWindowForPlanInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    asOf?: Date;
  },
): Promise<{ windowId: string } | null> {
  const asOf = input.asOf ?? new Date();
  const rows = await db
    .select({
      windowId: hrBenefitOpenEnrollmentWindows.id,
      status: hrBenefitOpenEnrollmentWindows.status,
      enrollmentStartAt: hrBenefitOpenEnrollmentWindows.enrollmentStartAt,
      enrollmentEndAt: hrBenefitOpenEnrollmentWindows.enrollmentEndAt,
    })
    .from(hrBenefitOpenEnrollmentWindows)
    .innerJoin(
      hrBenefitOpenEnrollmentPlans,
      eq(
        hrBenefitOpenEnrollmentPlans.windowId,
        hrBenefitOpenEnrollmentWindows.id,
      ),
    )
    .where(
      and(
        eq(hrBenefitOpenEnrollmentWindows.organizationId, input.organizationId),
        eq(hrBenefitOpenEnrollmentPlans.planId, input.planId),
        eq(hrBenefitOpenEnrollmentWindows.status, "active"),
        lte(hrBenefitOpenEnrollmentWindows.enrollmentStartAt, asOf),
        gte(hrBenefitOpenEnrollmentWindows.enrollmentEndAt, asOf),
      ),
    )
    .limit(1);

  const match = rows[0];
  if (!match) {
    return null;
  }

  return { windowId: match.windowId };
}
