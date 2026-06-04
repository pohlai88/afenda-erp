import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import {
  assertHrSalaryBenchmarkValuesPresent,
  formatHrSbsNumeric,
  HrSbsCommandError,
  parseNumeric,
} from "./hr-salary-benchmarking.shared";
import {
  hrSbsAuditEvents,
  hrSbsBenchmarkEntries,
  hrSbsBenchmarkVersions,
  hrSbsCurrencyRefs,
} from "./dbx-hr-salary-benchmarking";

export async function appendHrSbsAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    action: string;
    summary?: string;
    metadata?: Record<string, unknown>;
    benchmarkVersionId?: string | null;
    mappingId?: string | null;
    analysisId?: string | null;
    employeeId?: string | null;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_sbs_audit");

  await db.insert(hrSbsAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    benchmarkVersionId: input.benchmarkVersionId ?? null,
    mappingId: input.mappingId ?? null,
    analysisId: input.analysisId ?? null,
    employeeId: input.employeeId ?? null,
    actorUserId: input.actorUserId,
    action: input.action,
    summary: input.summary ?? null,
    metadata: input.metadata ?? null,
    occurredAt: input.occurredAt ?? new Date(),
  });

  return { auditEventId };
}

export async function listHrSbsAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  benchmarkVersionId?: string | null;
  mappingId?: string | null;
  analysisId?: string | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrSbsAuditEvents.organizationId, input.organizationId)];

    if (input.benchmarkVersionId) {
      conditions.push(
        eq(hrSbsAuditEvents.benchmarkVersionId, input.benchmarkVersionId),
      );
    }
    if (input.mappingId) {
      conditions.push(eq(hrSbsAuditEvents.mappingId, input.mappingId));
    }
    if (input.analysisId) {
      conditions.push(eq(hrSbsAuditEvents.analysisId, input.analysisId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrSbsAuditEvents.action, pattern),
          ilike(hrSbsAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrSbsAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrSbsAuditEvents.id,
        action: hrSbsAuditEvents.action,
        summary: hrSbsAuditEvents.summary,
        occurredAt: hrSbsAuditEvents.occurredAt,
        actorUserId: hrSbsAuditEvents.actorUserId,
        benchmarkVersionId: hrSbsAuditEvents.benchmarkVersionId,
        mappingId: hrSbsAuditEvents.mappingId,
        analysisId: hrSbsAuditEvents.analysisId,
        employeeId: hrSbsAuditEvents.employeeId,
      })
      .from(hrSbsAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrSbsAuditEvents.occurredAt))
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

type BenchmarkEntryValues = {
  salaryMinimum?: number | null;
  salaryMaximum?: number | null;
  salaryMedian?: number | null;
  salaryAverage?: number | null;
  salaryMidpoint?: number | null;
  percentile25?: number | null;
  percentile50?: number | null;
  percentile75?: number | null;
  percentile90?: number | null;
};

function mapBenchmarkEntryRow(row: {
  id: string;
  benchmarkVersionId: string;
  industry: string;
  country: string;
  location: string;
  jobFamily: string;
  jobLevel: string;
  currencyCode: string;
  salaryMinimum: string | null;
  salaryMidpoint: string | null;
  salaryMedian: string | null;
  salaryMaximum: string | null;
  salaryAverage: string | null;
  percentile25: string | null;
  percentile50: string | null;
  percentile75: string | null;
  percentile90: string | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    benchmarkVersionId: row.benchmarkVersionId,
    industry: row.industry,
    country: row.country,
    location: row.location,
    jobFamily: row.jobFamily,
    jobLevel: row.jobLevel,
    currencyCode: row.currencyCode,
    salaryMinimum: parseNumeric(row.salaryMinimum),
    salaryMidpoint: parseNumeric(row.salaryMidpoint),
    salaryMedian: parseNumeric(row.salaryMedian),
    salaryMaximum: parseNumeric(row.salaryMaximum),
    salaryAverage: parseNumeric(row.salaryAverage),
    percentile25: parseNumeric(row.percentile25),
    percentile50: parseNumeric(row.percentile50),
    percentile75: parseNumeric(row.percentile75),
    percentile90: parseNumeric(row.percentile90),
    createdAt: row.createdAt,
  };
}

export async function createHrSalaryBenchmarkVersionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    code: string;
    label: string;
    provider: string;
    surveyYear: number;
    effectiveDate: Date;
    sourceReference?: string | null;
    currencyCode?: string;
  },
) {
  const versionId = createEntityId("hr_sbs_version");
  const now = new Date();

  await db.insert(hrSbsBenchmarkVersions).values({
    id: versionId,
    organizationId: input.organizationId,
    code: input.code.trim(),
    label: input.label.trim(),
    provider: input.provider.trim(),
    surveyYear: String(input.surveyYear),
    effectiveDate: input.effectiveDate,
    sourceReference: input.sourceReference ?? null,
    currencyCode: (input.currencyCode ?? "USD").toUpperCase(),
    versionStatus: "draft",
    createdByUserId: input.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.version.create",
    summary: `Created benchmark version ${input.code}`,
    benchmarkVersionId: versionId,
  });

  return { versionId, createdAt: now.toISOString() };
}

export async function updateHrSalaryBenchmarkVersionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    versionId: string;
    label?: string;
    sourceReference?: string | null;
    versionStatus?: "draft" | "active" | "superseded" | "archived";
  },
) {
  const [existing] = await db
    .select({ id: hrSbsBenchmarkVersions.id })
    .from(hrSbsBenchmarkVersions)
    .where(
      and(
        eq(hrSbsBenchmarkVersions.organizationId, input.organizationId),
        eq(hrSbsBenchmarkVersions.id, input.versionId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HrSbsCommandError("benchmark_version_not_found", "Benchmark version not found");
  }

  const now = new Date();
  await db
    .update(hrSbsBenchmarkVersions)
    .set({
      label: input.label?.trim(),
      sourceReference: input.sourceReference,
      versionStatus: input.versionStatus,
      updatedAt: now,
    })
    .where(eq(hrSbsBenchmarkVersions.id, input.versionId));

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.version.update",
    summary: `Updated benchmark version ${input.versionId}`,
    benchmarkVersionId: input.versionId,
    metadata: { versionStatus: input.versionStatus ?? null },
  });

  return { versionId: input.versionId, updatedAt: now.toISOString() };
}

export async function upsertHrSalaryBenchmarkEntryInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    versionId: string;
    industry: string;
    country: string;
    location: string;
    jobFamily: string;
    jobLevel: string;
    currencyCode?: string;
  } & BenchmarkEntryValues,
) {
  assertHrSalaryBenchmarkValuesPresent(input);

  const [version] = await db
    .select({ id: hrSbsBenchmarkVersions.id })
    .from(hrSbsBenchmarkVersions)
    .where(
      and(
        eq(hrSbsBenchmarkVersions.organizationId, input.organizationId),
        eq(hrSbsBenchmarkVersions.id, input.versionId),
      ),
    )
    .limit(1);

  if (!version) {
    throw new HrSbsCommandError("benchmark_version_not_found", "Benchmark version not found");
  }

  const [existing] = await db
    .select({ id: hrSbsBenchmarkEntries.id })
    .from(hrSbsBenchmarkEntries)
    .where(
      and(
        eq(hrSbsBenchmarkEntries.organizationId, input.organizationId),
        eq(hrSbsBenchmarkEntries.benchmarkVersionId, input.versionId),
        eq(hrSbsBenchmarkEntries.industry, input.industry),
        eq(hrSbsBenchmarkEntries.country, input.country),
        eq(hrSbsBenchmarkEntries.location, input.location),
        eq(hrSbsBenchmarkEntries.jobFamily, input.jobFamily),
        eq(hrSbsBenchmarkEntries.jobLevel, input.jobLevel),
      ),
    )
    .limit(1);

  const now = new Date();
  const values = {
    industry: input.industry.trim(),
    country: input.country.trim(),
    location: input.location.trim(),
    jobFamily: input.jobFamily.trim(),
    jobLevel: input.jobLevel.trim(),
    currencyCode: (input.currencyCode ?? "USD").toUpperCase(),
    salaryMinimum: formatHrSbsNumeric(input.salaryMinimum),
    salaryMidpoint: formatHrSbsNumeric(input.salaryMidpoint),
    salaryMedian: formatHrSbsNumeric(input.salaryMedian),
    salaryMaximum: formatHrSbsNumeric(input.salaryMaximum),
    salaryAverage: formatHrSbsNumeric(input.salaryAverage),
    percentile25: formatHrSbsNumeric(input.percentile25),
    percentile50: formatHrSbsNumeric(input.percentile50),
    percentile75: formatHrSbsNumeric(input.percentile75),
    percentile90: formatHrSbsNumeric(input.percentile90),
    updatedAt: now,
  };

  let entryId: string;
  if (existing) {
    entryId = existing.id;
    await db
      .update(hrSbsBenchmarkEntries)
      .set(values)
      .where(eq(hrSbsBenchmarkEntries.id, existing.id));
  } else {
    entryId = createEntityId("hr_sbs_entry");
    await db.insert(hrSbsBenchmarkEntries).values({
      id: entryId,
      organizationId: input.organizationId,
      benchmarkVersionId: input.versionId,
      createdByUserId: input.actorUserId,
      createdAt: now,
      ...values,
    });
  }

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: existing ? "hr.sbs.entry.update" : "hr.sbs.entry.create",
    summary: `${existing ? "Updated" : "Created"} benchmark entry ${input.jobFamily}/${input.jobLevel}`,
    benchmarkVersionId: input.versionId,
    metadata: { entryId },
  });

  return { entryId, benchmarkVersionId: input.versionId };
}

export async function bulkUpsertHrSalaryBenchmarkEntriesInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    versionId: string;
    entries: readonly (Omit<
      Parameters<typeof upsertHrSalaryBenchmarkEntryInTx>[1],
      "organizationId" | "actorUserId" | "versionId"
    >)[];
  },
) {
  const results = [];
  for (const entry of input.entries) {
    results.push(
      await upsertHrSalaryBenchmarkEntryInTx(db, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        versionId: input.versionId,
        ...entry,
      }),
    );
  }
  return { entryCount: results.length, entries: results };
}

export async function uploadHrSalaryBenchmarkSurveyInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    code: string;
    label: string;
    provider: string;
    surveyYear: number;
    effectiveDate: Date;
    sourceReference?: string | null;
    entries: readonly (Omit<
      Parameters<typeof upsertHrSalaryBenchmarkEntryInTx>[1],
      "organizationId" | "actorUserId" | "versionId"
    >)[];
    currencyRefs?: readonly {
      fromCurrencyCode: string;
      toCurrencyCode: string;
      exchangeRate: number;
      effectiveDate: Date;
      rateSource?: "manual" | "ecb" | "survey_provider" | "internal";
      benchmarkVersionId?: string | null;
    }[];
  },
) {
  const { versionId } = await createHrSalaryBenchmarkVersionInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    code: input.code,
    label: input.label,
    provider: input.provider,
    surveyYear: input.surveyYear,
    effectiveDate: input.effectiveDate,
    sourceReference: input.sourceReference,
  });

  const { entryCount } = await bulkUpsertHrSalaryBenchmarkEntriesInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    versionId,
    entries: input.entries,
  });

  if (input.currencyRefs?.length) {
    for (const ref of input.currencyRefs) {
      await upsertHrSalaryBenchmarkCurrencyRefInTx(db, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        benchmarkVersionId: versionId,
        ...ref,
      });
    }
  }

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.survey.upload",
    summary: `Uploaded survey ${input.code} with ${entryCount} entries`,
    benchmarkVersionId: versionId,
    metadata: { entryCount },
  });

  return { versionId, entryCount };
}

export async function listHrSalaryBenchmarkVersionsWindow(input: {
  organizationId: string;
  search?: string;
  provider?: string;
  surveyYear?: number;
  versionStatus?: "draft" | "active" | "superseded" | "archived";
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrSbsBenchmarkVersions.organizationId, input.organizationId),
    ];

    if (input.provider) {
      conditions.push(eq(hrSbsBenchmarkVersions.provider, input.provider));
    }
    if (input.surveyYear != null) {
      conditions.push(eq(hrSbsBenchmarkVersions.surveyYear, String(input.surveyYear)));
    }
    if (input.versionStatus) {
      conditions.push(eq(hrSbsBenchmarkVersions.versionStatus, input.versionStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrSbsBenchmarkVersions.code, pattern),
          ilike(hrSbsBenchmarkVersions.label, pattern),
          ilike(hrSbsBenchmarkVersions.provider, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrSbsBenchmarkVersions)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrSbsBenchmarkVersions)
      .where(whereClause)
      .orderBy(desc(hrSbsBenchmarkVersions.createdAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        code: row.code,
        label: row.label,
        provider: row.provider,
        surveyYear: Number(row.surveyYear),
        effectiveDate: row.effectiveDate,
        versionStatus: row.versionStatus,
        currencyCode: row.currencyCode,
        createdAt: row.createdAt,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function getHrSalaryBenchmarkVersionSummary(input: {
  organizationId: string;
  versionId: string;
}) {
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrSbsBenchmarkVersions)
      .where(
        and(
          eq(hrSbsBenchmarkVersions.organizationId, input.organizationId),
          eq(hrSbsBenchmarkVersions.id, input.versionId),
        ),
      )
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      code: row.code,
      label: row.label,
      provider: row.provider,
      surveyYear: Number(row.surveyYear),
      effectiveDate: row.effectiveDate,
      sourceReference: row.sourceReference,
      versionStatus: row.versionStatus,
      currencyCode: row.currencyCode,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
    };
  });
}

export async function listHrSalaryBenchmarkEntriesWindow(input: {
  organizationId: string;
  versionId: string;
  search?: string;
  jobFamily?: string;
  jobLevel?: string;
  country?: string;
  currencyCode?: string;
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrSbsBenchmarkEntries.organizationId, input.organizationId),
      eq(hrSbsBenchmarkEntries.benchmarkVersionId, input.versionId),
    ];

    if (input.jobFamily) {
      conditions.push(eq(hrSbsBenchmarkEntries.jobFamily, input.jobFamily));
    }
    if (input.jobLevel) {
      conditions.push(eq(hrSbsBenchmarkEntries.jobLevel, input.jobLevel));
    }
    if (input.country) {
      conditions.push(eq(hrSbsBenchmarkEntries.country, input.country));
    }
    if (input.currencyCode) {
      conditions.push(eq(hrSbsBenchmarkEntries.currencyCode, input.currencyCode));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrSbsBenchmarkEntries.jobFamily, pattern),
          ilike(hrSbsBenchmarkEntries.jobLevel, pattern),
          ilike(hrSbsBenchmarkEntries.location, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrSbsBenchmarkEntries)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrSbsBenchmarkEntries)
      .where(whereClause)
      .orderBy(desc(hrSbsBenchmarkEntries.createdAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map(mapBenchmarkEntryRow),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function getHrSalaryBenchmarkEntryById(input: {
  organizationId: string;
  entryId: string;
}) {
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrSbsBenchmarkEntries)
      .where(
        and(
          eq(hrSbsBenchmarkEntries.organizationId, input.organizationId),
          eq(hrSbsBenchmarkEntries.id, input.entryId),
        ),
      )
      .limit(1);

    return row ? mapBenchmarkEntryRow(row) : null;
  });
}

export async function upsertHrSalaryBenchmarkCurrencyRefInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    fromCurrencyCode: string;
    toCurrencyCode: string;
    exchangeRate: number;
    effectiveDate: Date;
    rateSource?: "manual" | "ecb" | "survey_provider" | "internal";
    benchmarkVersionId?: string | null;
  },
) {
  const refId = createEntityId("hr_sbs_currency");
  const now = new Date();

  await db.insert(hrSbsCurrencyRefs).values({
    id: refId,
    organizationId: input.organizationId,
    benchmarkVersionId: input.benchmarkVersionId ?? null,
    fromCurrencyCode: input.fromCurrencyCode.toUpperCase(),
    toCurrencyCode: input.toCurrencyCode.toUpperCase(),
    exchangeRate: String(input.exchangeRate),
    effectiveDate: input.effectiveDate,
    rateSource: input.rateSource ?? "manual",
    createdByUserId: input.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  return { refId };
}

export async function getHrSalaryBenchmarkCurrencyRef(input: {
  organizationId: string;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  effectiveDate: Date;
}) {
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrSbsCurrencyRefs)
      .where(
        and(
          eq(hrSbsCurrencyRefs.organizationId, input.organizationId),
          eq(hrSbsCurrencyRefs.fromCurrencyCode, input.fromCurrencyCode.toUpperCase()),
          eq(hrSbsCurrencyRefs.toCurrencyCode, input.toCurrencyCode.toUpperCase()),
          lte(hrSbsCurrencyRefs.effectiveDate, input.effectiveDate),
        ),
      )
      .orderBy(desc(hrSbsCurrencyRefs.effectiveDate))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      fromCurrencyCode: row.fromCurrencyCode,
      toCurrencyCode: row.toCurrencyCode,
      exchangeRate: parseNumeric(row.exchangeRate),
      effectiveDate: row.effectiveDate,
      rateSource: row.rateSource,
      benchmarkVersionId: row.benchmarkVersionId,
    };
  });
}

export async function listHrSalaryBenchmarkCurrencyRefsWindow(input: {
  organizationId: string;
  fromCurrencyCode?: string;
  toCurrencyCode?: string;
  benchmarkVersionId?: string;
  effectiveOnOrBefore?: Date;
  effectiveOnOrAfter?: Date;
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrSbsCurrencyRefs.organizationId, input.organizationId)];

    if (input.fromCurrencyCode) {
      conditions.push(
        eq(hrSbsCurrencyRefs.fromCurrencyCode, input.fromCurrencyCode.toUpperCase()),
      );
    }
    if (input.toCurrencyCode) {
      conditions.push(
        eq(hrSbsCurrencyRefs.toCurrencyCode, input.toCurrencyCode.toUpperCase()),
      );
    }
    if (input.benchmarkVersionId) {
      conditions.push(
        eq(hrSbsCurrencyRefs.benchmarkVersionId, input.benchmarkVersionId),
      );
    }
    if (input.effectiveOnOrBefore) {
      conditions.push(lte(hrSbsCurrencyRefs.effectiveDate, input.effectiveOnOrBefore));
    }
    if (input.effectiveOnOrAfter) {
      conditions.push(gte(hrSbsCurrencyRefs.effectiveDate, input.effectiveOnOrAfter));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrSbsCurrencyRefs)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrSbsCurrencyRefs)
      .where(whereClause)
      .orderBy(desc(hrSbsCurrencyRefs.effectiveDate))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        fromCurrencyCode: row.fromCurrencyCode,
        toCurrencyCode: row.toCurrencyCode,
        exchangeRate: parseNumeric(row.exchangeRate),
        effectiveDate: row.effectiveDate,
        rateSource: row.rateSource,
        benchmarkVersionId: row.benchmarkVersionId,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

