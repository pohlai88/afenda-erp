import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import { appendHrSbsAuditEventInTx } from "./hr-salary-benchmarking-survey";
import { HrSbsCommandError, parseNumeric } from "./hr-salary-benchmarking.shared";
import {
  hrSbsBenchmarkEntries,
  hrSbsBenchmarkMappings,
  hrSbsBenchmarkVersions,
  hrSbsCpmRecommendationRefs,
  hrSbsMappingApprovals,
} from "./dbx-hr-salary-benchmarking";

export type CreateHrSbsBenchmarkMappingInput = {
  organizationId: string;
  actorUserId: string;
  benchmarkVersionId: string;
  benchmarkEntryId: string;
  employeeId?: string | null;
  legalEntityCode?: string | null;
  country?: string | null;
  locationCode?: string | null;
  jobFamily?: string | null;
  jobTitle?: string | null;
  grade?: string | null;
  employmentCategory?: string | null;
  submitForApproval?: boolean;
};

export async function createHrSbsBenchmarkMappingInTx(
  db: AfendaTransaction,
  input: CreateHrSbsBenchmarkMappingInput,
) {
  const [version] = await db
    .select({ id: hrSbsBenchmarkVersions.id })
    .from(hrSbsBenchmarkVersions)
    .where(
      and(
        eq(hrSbsBenchmarkVersions.organizationId, input.organizationId),
        eq(hrSbsBenchmarkVersions.id, input.benchmarkVersionId),
      ),
    )
    .limit(1);

  if (!version) {
    throw new HrSbsCommandError("benchmark_version_not_found", "Benchmark version not found");
  }

  const [entry] = await db
    .select({ id: hrSbsBenchmarkEntries.id })
    .from(hrSbsBenchmarkEntries)
    .where(
      and(
        eq(hrSbsBenchmarkEntries.organizationId, input.organizationId),
        eq(hrSbsBenchmarkEntries.id, input.benchmarkEntryId),
      ),
    )
    .limit(1);

  if (!entry) {
    throw new HrSbsCommandError("benchmark_entry_not_found", "Benchmark entry not found");
  }

  const mappingId = createEntityId("hr_sbs_mapping");
  const now = new Date();
  const mappingStatus = input.submitForApproval ? "pending_approval" : "draft";

  await db.insert(hrSbsBenchmarkMappings).values({
    id: mappingId,
    organizationId: input.organizationId,
    benchmarkVersionId: input.benchmarkVersionId,
    benchmarkEntryId: input.benchmarkEntryId,
    employeeId: input.employeeId ?? null,
    legalEntityCode: input.legalEntityCode ?? null,
    country: input.country ?? null,
    locationCode: input.locationCode ?? null,
    jobFamily: input.jobFamily ?? null,
    jobTitle: input.jobTitle ?? null,
    grade: input.grade ?? null,
    employmentCategory: input.employmentCategory ?? null,
    mappingStatus,
    createdByUserId: input.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  if (input.submitForApproval) {
    await db.insert(hrSbsMappingApprovals).values({
      id: createEntityId("hr_sbs_map_appr"),
      organizationId: input.organizationId,
      mappingId,
      requestedByUserId: input.actorUserId,
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.mapping.create",
    summary: `Created benchmark mapping ${mappingId}`,
    benchmarkVersionId: input.benchmarkVersionId,
    mappingId,
  });

  return { mappingId, mappingStatus };
}

export async function submitHrSbsBenchmarkMappingForApprovalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    mappingId: string;
  },
) {
  const [mapping] = await db
    .select({
      id: hrSbsBenchmarkMappings.id,
      mappingStatus: hrSbsBenchmarkMappings.mappingStatus,
      benchmarkVersionId: hrSbsBenchmarkMappings.benchmarkVersionId,
    })
    .from(hrSbsBenchmarkMappings)
    .where(
      and(
        eq(hrSbsBenchmarkMappings.organizationId, input.organizationId),
        eq(hrSbsBenchmarkMappings.id, input.mappingId),
      ),
    )
    .limit(1);

  if (!mapping) {
    throw new HrSbsCommandError("mapping_not_found", "Benchmark mapping not found");
  }

  if (mapping.mappingStatus === "approved") {
    throw new HrSbsCommandError("mapping_already_approved", "Mapping is already approved");
  }

  const now = new Date();
  await db
    .update(hrSbsBenchmarkMappings)
    .set({ mappingStatus: "pending_approval", updatedAt: now })
    .where(eq(hrSbsBenchmarkMappings.id, input.mappingId));

  await db.insert(hrSbsMappingApprovals).values({
    id: createEntityId("hr_sbs_map_appr"),
    organizationId: input.organizationId,
    mappingId: input.mappingId,
    requestedByUserId: input.actorUserId,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.mapping.submit",
    summary: `Submitted mapping ${input.mappingId} for approval`,
    benchmarkVersionId: mapping.benchmarkVersionId,
    mappingId: input.mappingId,
  });

  return { mappingId: input.mappingId, mappingStatus: "pending_approval" as const };
}

export async function reviewHrSbsBenchmarkMappingInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    mappingId: string;
    decision: "approved" | "rejected";
    decisionNote?: string | null;
  },
) {
  const [mapping] = await db
    .select({
      id: hrSbsBenchmarkMappings.id,
      mappingStatus: hrSbsBenchmarkMappings.mappingStatus,
      benchmarkVersionId: hrSbsBenchmarkMappings.benchmarkVersionId,
    })
    .from(hrSbsBenchmarkMappings)
    .where(
      and(
        eq(hrSbsBenchmarkMappings.organizationId, input.organizationId),
        eq(hrSbsBenchmarkMappings.id, input.mappingId),
      ),
    )
    .limit(1);

  if (!mapping) {
    throw new HrSbsCommandError("mapping_not_found", "Benchmark mapping not found");
  }

  if (mapping.mappingStatus !== "pending_approval") {
    throw new HrSbsCommandError(
      "mapping_not_pending",
      "Only pending mappings can be reviewed",
    );
  }

  const now = new Date();
  const mappingStatus = input.decision === "approved" ? "approved" : "rejected";

  await db
    .update(hrSbsBenchmarkMappings)
    .set({
      mappingStatus,
      approvedByUserId: input.decision === "approved" ? input.actorUserId : null,
      approvedAt: input.decision === "approved" ? now : null,
      updatedAt: now,
    })
    .where(eq(hrSbsBenchmarkMappings.id, input.mappingId));

  const [pendingApproval] = await db
    .select({ id: hrSbsMappingApprovals.id })
    .from(hrSbsMappingApprovals)
    .where(
      and(
        eq(hrSbsMappingApprovals.organizationId, input.organizationId),
        eq(hrSbsMappingApprovals.mappingId, input.mappingId),
        isNull(hrSbsMappingApprovals.decision),
      ),
    )
    .orderBy(desc(hrSbsMappingApprovals.requestedAt))
    .limit(1);

  if (pendingApproval) {
    await db
      .update(hrSbsMappingApprovals)
      .set({
        reviewedByUserId: input.actorUserId,
        decision: input.decision,
        decisionNote: input.decisionNote ?? null,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(hrSbsMappingApprovals.id, pendingApproval.id));
  }

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: `hr.sbs.mapping.${input.decision}`,
    summary: `${input.decision === "approved" ? "Approved" : "Rejected"} mapping ${input.mappingId}`,
    benchmarkVersionId: mapping.benchmarkVersionId,
    mappingId: input.mappingId,
    metadata: { decisionNote: input.decisionNote ?? null },
  });

  return { mappingId: input.mappingId, mappingStatus };
}

export async function listHrSbsBenchmarkMappingsWindow(input: {
  organizationId: string;
  benchmarkVersionId?: string;
  mappingStatus?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrSbsBenchmarkMappings.organizationId, input.organizationId),
    ];

    if (input.benchmarkVersionId) {
      conditions.push(
        eq(hrSbsBenchmarkMappings.benchmarkVersionId, input.benchmarkVersionId),
      );
    }
    if (input.mappingStatus) {
      conditions.push(
        eq(
          hrSbsBenchmarkMappings.mappingStatus,
          input.mappingStatus as "draft" | "pending_approval" | "approved" | "rejected" | "superseded",
        ),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrSbsBenchmarkMappings.jobFamily, pattern),
          ilike(hrSbsBenchmarkMappings.jobTitle, pattern),
          ilike(hrSbsBenchmarkMappings.grade, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrSbsBenchmarkMappings)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrSbsBenchmarkMappings)
      .where(whereClause)
      .orderBy(desc(hrSbsBenchmarkMappings.updatedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        benchmarkVersionId: row.benchmarkVersionId,
        benchmarkEntryId: row.benchmarkEntryId,
        employeeId: row.employeeId,
        legalEntityCode: row.legalEntityCode,
        country: row.country,
        locationCode: row.locationCode,
        jobFamily: row.jobFamily,
        jobTitle: row.jobTitle,
        grade: row.grade,
        employmentCategory: row.employmentCategory,
        mappingStatus: row.mappingStatus,
        approvedAt: row.approvedAt,
        updatedAt: row.updatedAt,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function createHrSbsCpmRecommendationRefsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    analysisId: string;
    benchmarkVersionId: string;
    recommendations: readonly {
      employeeId: string;
      marketPosition: string;
      marketRatio?: number | null;
      suggestedAdjustmentPercent?: number | null;
      bandAdjustmentIndicator?: string | null;
      compensationRecommendationId?: string | null;
    }[];
  },
) {
  const now = new Date();
  const refs = [];

  for (const rec of input.recommendations) {
    const refId = createEntityId("hr_sbs_cpm_ref");
    await db.insert(hrSbsCpmRecommendationRefs).values({
      id: refId,
      organizationId: input.organizationId,
      analysisId: input.analysisId,
      employeeId: rec.employeeId,
      compensationRecommendationId: rec.compensationRecommendationId ?? null,
      benchmarkVersionId: input.benchmarkVersionId,
      marketPosition: rec.marketPosition,
      marketRatio:
        rec.marketRatio != null ? String(rec.marketRatio) : null,
      suggestedAdjustmentPercent:
        rec.suggestedAdjustmentPercent != null
          ? String(rec.suggestedAdjustmentPercent)
          : null,
      bandAdjustmentIndicator: rec.bandAdjustmentIndicator ?? null,
      createdByUserId: input.actorUserId,
      createdAt: now,
      updatedAt: now,
    });
    refs.push(refId);
  }

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.recommendation.generate",
    summary: `Generated ${refs.length} CPM recommendation references`,
    analysisId: input.analysisId,
    benchmarkVersionId: input.benchmarkVersionId,
    metadata: { refCount: refs.length },
  });

  return { refIds: refs };
}

export async function listHrSbsCpmRecommendationRefsWindow(input: {
  organizationId: string;
  analysisId?: string;
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const { runWithOrganizationContext } = await import("./client");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrSbsCpmRecommendationRefs.organizationId, input.organizationId),
    ];
    if (input.analysisId) {
      conditions.push(eq(hrSbsCpmRecommendationRefs.analysisId, input.analysisId));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrSbsCpmRecommendationRefs)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrSbsCpmRecommendationRefs)
      .where(whereClause)
      .orderBy(desc(hrSbsCpmRecommendationRefs.createdAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        analysisId: row.analysisId,
        employeeId: row.employeeId,
        compensationRecommendationId: row.compensationRecommendationId,
        marketPosition: row.marketPosition,
        marketRatio: parseNumeric(row.marketRatio),
        suggestedAdjustmentPercent: parseNumeric(row.suggestedAdjustmentPercent),
        bandAdjustmentIndicator: row.bandAdjustmentIndicator,
        createdAt: row.createdAt,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

