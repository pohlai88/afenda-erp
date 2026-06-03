import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import type { HrBenefitProviderWindow } from "./hr-benefits.types";
import { hrBenefitProviders } from "./hr-benefits";

export async function listHrBenefitProvidersWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrBenefitProviderWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBenefitProviders.organizationId, input.organizationId),
      eq(hrBenefitProviders.active, true),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBenefitProviders.code, pattern),
          ilike(hrBenefitProviders.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBenefitProviders)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBenefitProviders.id,
        code: hrBenefitProviders.code,
        name: hrBenefitProviders.name,
        active: hrBenefitProviders.active,
      })
      .from(hrBenefitProviders)
      .where(whereClause)
      .orderBy(desc(hrBenefitProviders.updatedAt))
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

export async function upsertHrBenefitProviderInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    name: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
    externalReference?: string | null;
  },
): Promise<{ providerId: string }> {
  const code = input.code.trim();
  const [existing] = await db
    .select({ id: hrBenefitProviders.id })
    .from(hrBenefitProviders)
    .where(
      and(
        eq(hrBenefitProviders.organizationId, input.organizationId),
        eq(hrBenefitProviders.code, code),
      ),
    )
    .limit(1);

  const payload = {
    name: input.name.trim(),
    contactEmail: input.contactEmail?.trim() || null,
    contactPhone: input.contactPhone?.trim() || null,
    externalReference: input.externalReference?.trim() || null,
    active: true,
    archivedAt: null,
  };

  if (existing) {
    await db
      .update(hrBenefitProviders)
      .set(payload)
      .where(eq(hrBenefitProviders.id, existing.id));
    return { providerId: existing.id };
  }

  const providerId = createEntityId("hr_ben_prov");
  await db.insert(hrBenefitProviders).values({
    id: providerId,
    organizationId: input.organizationId,
    code,
    ...payload,
  });
  return { providerId };
}
