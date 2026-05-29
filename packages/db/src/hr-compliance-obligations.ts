import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow } from "./hr-compliance.shared";
import {
  appendExactOrNullScopeFilter,
  clampPageSize,
  normalizeScopeCode,
  normalizeScopeText,
} from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrComplianceObligationWindow } from "./hr-compliance.types";
import { hrComplianceObligations, hrDepartments } from "./schema/hr";

export async function listHrComplianceObligationsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrComplianceObligations.$inferSelect)["status"];
  complianceArea?: string;
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  workerCategory?: string | null;
}): Promise<HrComplianceObligationWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceObligations.organizationId, input.organizationId),
    ];

    if (input.status) {
      conditions.push(eq(hrComplianceObligations.status, input.status));
    } else {
      conditions.push(eq(hrComplianceObligations.status, "active"));
    }

    if (input.complianceArea?.trim()) {
      conditions.push(
        eq(hrComplianceObligations.complianceArea, input.complianceArea.trim()),
      );
    }

    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.countryCode,
      input.countryCode,
      (value) => value.toUpperCase(),
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.legalEntityCode,
      input.legalEntityCode,
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.workLocationCode,
      input.workLocationCode,
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.employmentType,
      input.employmentType,
    );
    appendExactOrNullScopeFilter(
      conditions,
      hrComplianceObligations.workerCategory,
      input.workerCategory,
    );

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrComplianceObligations.code, pattern),
          ilike(hrComplianceObligations.title, pattern),
          ilike(hrComplianceObligations.complianceArea, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrComplianceObligations)
      .leftJoin(
        hrDepartments,
        eq(hrComplianceObligations.departmentId, hrDepartments.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrComplianceObligations.id,
        code: hrComplianceObligations.code,
        title: hrComplianceObligations.title,
        description: hrComplianceObligations.description,
        complianceArea: hrComplianceObligations.complianceArea,
        requirementKind: hrComplianceObligations.requirementKind,
        status: hrComplianceObligations.status,
        departmentName: hrDepartments.name,
        dueDate: hrComplianceObligations.dueDate,
        countryCode: hrComplianceObligations.countryCode,
        legalEntityCode: hrComplianceObligations.legalEntityCode,
        workLocationCode: hrComplianceObligations.workLocationCode,
        employmentType: hrComplianceObligations.employmentType,
        workerCategory: hrComplianceObligations.workerCategory,
      })
      .from(hrComplianceObligations)
      .leftJoin(
        hrDepartments,
        eq(hrComplianceObligations.departmentId, hrDepartments.id),
      )
      .where(whereClause)
      .orderBy(desc(hrComplianceObligations.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description,
        complianceArea: row.complianceArea,
        requirementKind: row.requirementKind,
        status: row.status,
        departmentName: row.departmentName,
        dueDate: row.dueDate,
        countryCode: row.countryCode,
        legalEntityCode: row.legalEntityCode,
        workLocationCode: row.workLocationCode,
        employmentType: row.employmentType,
        workerCategory: row.workerCategory,
      })),
      pageSize,
      offset,
      totalCount: actualTotal,
    });
  });
}

export async function upsertHrComplianceObligationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    title: string;
    complianceArea: string;
    requirementKind: string;
    description?: string | null;
    departmentId?: string | null;
    dueDate?: Date | null;
    countryCode?: string | null;
    legalEntityCode?: string | null;
    workLocationCode?: string | null;
    employmentType?: string | null;
    workerCategory?: string | null;
  },
): Promise<{ obligationId: string }> {
  const code = input.code.trim();
  const scopePayload = {
    countryCode: normalizeScopeCode(input.countryCode),
    legalEntityCode: normalizeScopeText(input.legalEntityCode),
    workLocationCode: normalizeScopeText(input.workLocationCode),
    employmentType: normalizeScopeText(input.employmentType),
    workerCategory: normalizeScopeText(input.workerCategory),
  } as const;
  const [existing] = await db
    .select({ id: hrComplianceObligations.id })
    .from(hrComplianceObligations)
    .where(
      and(
        eq(hrComplianceObligations.organizationId, input.organizationId),
        eq(hrComplianceObligations.code, code),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrComplianceObligations)
      .set({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        complianceArea: input.complianceArea.trim(),
        requirementKind: input.requirementKind.trim(),
        departmentId: input.departmentId ?? null,
        dueDate: input.dueDate ?? null,
        ...scopePayload,
        status: "active",
      })
      .where(eq(hrComplianceObligations.id, existing.id));
    return { obligationId: existing.id };
  }

  const obligationId = createEntityId("hr_cmp_obl");
  await db.insert(hrComplianceObligations).values({
    id: obligationId,
    organizationId: input.organizationId,
    code,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    complianceArea: input.complianceArea.trim(),
    requirementKind: input.requirementKind.trim(),
    departmentId: input.departmentId ?? null,
    dueDate: input.dueDate ?? null,
    ...scopePayload,
  });

  return { obligationId };
}

export async function upsertHrComplianceObligation(input: {
  organizationId: string;
  code: string;
  title: string;
  complianceArea: string;
  requirementKind: string;
  description?: string | null;
  departmentId?: string | null;
  dueDate?: Date | null;
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  workerCategory?: string | null;
}): Promise<{ obligationId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    upsertHrComplianceObligationInTx(db, input),
  );
}

export async function archiveHrComplianceObligationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    obligationId: string;
  },
): Promise<{ obligationId: string }> {
  const [obligation] = await db
    .select({ id: hrComplianceObligations.id })
    .from(hrComplianceObligations)
    .where(
      and(
        eq(hrComplianceObligations.organizationId, input.organizationId),
        eq(hrComplianceObligations.id, input.obligationId),
      ),
    )
    .limit(1);

  if (!obligation) {
    throw new HrComplianceCommandError("obligation_not_found");
  }

  await db
    .update(hrComplianceObligations)
    .set({ status: "archived" })
    .where(eq(hrComplianceObligations.id, input.obligationId));

  return { obligationId: input.obligationId };
}

export async function archiveHrComplianceObligation(input: {
  organizationId: string;
  obligationId: string;
}): Promise<{ obligationId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    archiveHrComplianceObligationInTx(db, input),
  );
}
