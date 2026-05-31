import { and, count, desc, eq, inArray } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import { appendHrSbsAuditEventInTx } from "./hr-salary-benchmarking-survey";
import { HrSbsCommandError, parseNumeric } from "./hr-salary-benchmarking.shared";
import {
  hrCompensationCycleParticipants,
  hrCompensationSalaryBands,
} from "./schema/hr-compensation-planning";
import { hrEmployees } from "./schema/hr";
import {
  hrSbsBenchmarkEntries,
  hrSbsBenchmarkMappings,
  hrSbsBenchmarkVersions,
  hrSbsCompensationAnalyses,
  type HrSbsAnalysisSnapshotPayload,
  type HrSbsThresholdConfigPayload,
} from "./schema/hr-salary-benchmarking";

export {
  HrSbsCommandError,
  assertHrSalaryBenchmarkValuesPresent,
  formatHrSbsNumeric,
} from "./hr-salary-benchmarking.shared";
export * from "./hr-salary-benchmarking-survey";
export * from "./hr-salary-benchmarking-mapping";
export {
  appendHrSbsAuditEventInTx,
  listHrSbsAuditTrailWindow,
} from "./hr-salary-benchmarking-survey";

export type HrSbsInternalSalaryBandRow = {
  grade: string;
  minimum: number;
  midpoint: number;
  maximum: number;
};

export type HrSbsMarketBenchmarkRow = {
  currencyCode: string;
  minimum: number | null;
  midpoint: number | null;
  median: number | null;
  maximum: number | null;
  average: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
};

export type HrSbsEmployeeCompensationRow = {
  employeeId: string;
  baseSalary: number;
  totalCash: number | null;
  totalComp: number | null;
  currencyCode: string;
  jobTitle: string | null;
  jobFamily: string | null;
  grade: string | null;
  departmentId: string | null;
  locationCode: string | null;
  employmentCategory: string | null;
  tenureDays: number | null;
  performanceRating: number | null;
};

export type HrSbsAnalysisContext = {
  benchmarkVersionId: string;
  versionCurrencyCode: string;
  employees: readonly HrSbsEmployeeCompensationRow[];
  benchmarksByEmployeeId: Readonly<Record<string, HrSbsMarketBenchmarkRow>>;
  internalBandsByGrade: Readonly<Record<string, HrSbsInternalSalaryBandRow>>;
};

function mapBenchmarkEntry(row: {
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
}): HrSbsMarketBenchmarkRow {
  return {
    currencyCode: row.currencyCode,
    minimum: parseNumeric(row.salaryMinimum),
    midpoint: parseNumeric(row.salaryMidpoint),
    median: parseNumeric(row.salaryMedian),
    maximum: parseNumeric(row.salaryMaximum),
    average: parseNumeric(row.salaryAverage),
    p25: parseNumeric(row.percentile25),
    p50: parseNumeric(row.percentile50),
    p75: parseNumeric(row.percentile75),
    p90: parseNumeric(row.percentile90),
  };
}

function computeTenureDays(
  employmentStartDate: Date | string | null,
): number | null {
  if (!employmentStartDate) return null;
  const start = new Date(employmentStartDate);
  if (Number.isNaN(start.getTime())) return null;
  const diffMs = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export async function loadHrSbsBenchmarkVersionInTx(
  db: AfendaTransaction,
  input: { organizationId: string; benchmarkVersionId: string },
) {
  const [version] = await db
    .select({
      id: hrSbsBenchmarkVersions.id,
      currencyCode: hrSbsBenchmarkVersions.currencyCode,
      versionStatus: hrSbsBenchmarkVersions.versionStatus,
    })
    .from(hrSbsBenchmarkVersions)
    .where(
      and(
        eq(hrSbsBenchmarkVersions.organizationId, input.organizationId),
        eq(hrSbsBenchmarkVersions.id, input.benchmarkVersionId),
      ),
    )
    .limit(1);

  if (!version) {
    throw new HrSbsCommandError(
      "benchmark_version_not_found",
      "Benchmark version not found",
    );
  }

  return version;
}

export async function loadHrSbsAnalysisContextInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    benchmarkVersionId: string;
    compensationCycleId?: string | null;
    employeeIds?: readonly string[] | null;
  },
): Promise<HrSbsAnalysisContext> {
  const version = await loadHrSbsBenchmarkVersionInTx(db, {
    organizationId: input.organizationId,
    benchmarkVersionId: input.benchmarkVersionId,
  });

  const employeeConditions = [
    eq(hrEmployees.organizationId, input.organizationId),
  ];
  if (input.employeeIds?.length) {
    employeeConditions.push(inArray(hrEmployees.id, [...input.employeeIds]));
  }

  const employeeRows = await db
    .select({
      employeeId: hrEmployees.id,
      grade: hrEmployees.grade,
      departmentId: hrEmployees.currentDepartmentId,
      locationCode: hrEmployees.workLocationCode,
      employmentType: hrEmployees.employmentType,
      employmentStartDate: hrEmployees.employmentStartDate,
    })
    .from(hrEmployees)
    .where(and(...employeeConditions));

  const participantSalaries = new Map<
    string,
    { baseSalary: number; totalCash: number | null; performanceRating: number | null }
  >();

  if (input.compensationCycleId) {
    const participantConditions = [
      eq(hrCompensationCycleParticipants.organizationId, input.organizationId),
      eq(hrCompensationCycleParticipants.cycleId, input.compensationCycleId),
    ];
    if (input.employeeIds?.length) {
      participantConditions.push(
        inArray(hrCompensationCycleParticipants.employeeId, [...input.employeeIds]),
      );
    }

    const participants = await db
      .select({
        employeeId: hrCompensationCycleParticipants.employeeId,
        currentSalary: hrCompensationCycleParticipants.currentSalary,
        performanceRating: hrCompensationCycleParticipants.performanceRating,
      })
      .from(hrCompensationCycleParticipants)
      .where(and(...participantConditions));

    for (const row of participants) {
      const salary = parseNumeric(row.currentSalary);
      if (salary == null) continue;
      participantSalaries.set(row.employeeId, {
        baseSalary: salary,
        totalCash: salary,
        performanceRating: parseNumeric(row.performanceRating),
      });
    }
  }

  const mappingRows = await db
    .select({
      employeeId: hrSbsBenchmarkMappings.employeeId,
      grade: hrSbsBenchmarkMappings.grade,
      jobFamily: hrSbsBenchmarkMappings.jobFamily,
      jobTitle: hrSbsBenchmarkMappings.jobTitle,
      locationCode: hrSbsBenchmarkMappings.locationCode,
      employmentCategory: hrSbsBenchmarkMappings.employmentCategory,
      benchmarkEntryId: hrSbsBenchmarkMappings.benchmarkEntryId,
      mappingStatus: hrSbsBenchmarkMappings.mappingStatus,
    })
    .from(hrSbsBenchmarkMappings)
    .where(
      and(
        eq(hrSbsBenchmarkMappings.organizationId, input.organizationId),
        eq(hrSbsBenchmarkMappings.benchmarkVersionId, input.benchmarkVersionId),
        eq(hrSbsBenchmarkMappings.mappingStatus, "approved"),
      ),
    );

  const entryIds = [...new Set(mappingRows.map((row) => row.benchmarkEntryId))];

  const entryById = new Map<string, HrSbsMarketBenchmarkRow>();
  if (entryIds.length > 0) {
    const entries = await db
      .select({
        id: hrSbsBenchmarkEntries.id,
        currencyCode: hrSbsBenchmarkEntries.currencyCode,
        salaryMinimum: hrSbsBenchmarkEntries.salaryMinimum,
        salaryMidpoint: hrSbsBenchmarkEntries.salaryMidpoint,
        salaryMedian: hrSbsBenchmarkEntries.salaryMedian,
        salaryMaximum: hrSbsBenchmarkEntries.salaryMaximum,
        salaryAverage: hrSbsBenchmarkEntries.salaryAverage,
        percentile25: hrSbsBenchmarkEntries.percentile25,
        percentile50: hrSbsBenchmarkEntries.percentile50,
        percentile75: hrSbsBenchmarkEntries.percentile75,
        percentile90: hrSbsBenchmarkEntries.percentile90,
      })
      .from(hrSbsBenchmarkEntries)
      .where(
        and(
          eq(hrSbsBenchmarkEntries.organizationId, input.organizationId),
          inArray(hrSbsBenchmarkEntries.id, entryIds),
        ),
      );

    for (const entry of entries) {
      entryById.set(entry.id, mapBenchmarkEntry(entry));
    }
  }

  const bandRows = await db
    .select({
      grade: hrCompensationSalaryBands.grade,
      bandMinimum: hrCompensationSalaryBands.bandMinimum,
      bandMidpoint: hrCompensationSalaryBands.bandMidpoint,
      bandMaximum: hrCompensationSalaryBands.bandMaximum,
    })
    .from(hrCompensationSalaryBands)
    .where(
      and(
        eq(hrCompensationSalaryBands.organizationId, input.organizationId),
        eq(hrCompensationSalaryBands.active, true),
      ),
    );

  const internalBandsByGrade: Record<string, HrSbsInternalSalaryBandRow> = {};
  for (const band of bandRows) {
    const minimum = parseNumeric(band.bandMinimum);
    const midpoint = parseNumeric(band.bandMidpoint);
    const maximum = parseNumeric(band.bandMaximum);
    if (minimum == null || midpoint == null || maximum == null) continue;
    internalBandsByGrade[band.grade] = { grade: band.grade, minimum, midpoint, maximum };
  }

  const benchmarksByEmployeeId: Record<string, HrSbsMarketBenchmarkRow> = {};
  const employees: HrSbsEmployeeCompensationRow[] = [];

  for (const employee of employeeRows) {
    const salaryRow = participantSalaries.get(employee.employeeId);
    if (!salaryRow) continue;

    const mapping =
      mappingRows.find((m) => m.employeeId === employee.employeeId) ??
      mappingRows.find(
        (m) =>
          !m.employeeId &&
          m.grade === employee.grade &&
          (m.locationCode == null || m.locationCode === employee.locationCode),
      );

    if (!mapping) continue;

    const benchmark = entryById.get(mapping.benchmarkEntryId);
    if (!benchmark) continue;

    benchmarksByEmployeeId[employee.employeeId] = benchmark;

    employees.push({
      employeeId: employee.employeeId,
      baseSalary: salaryRow.baseSalary,
      totalCash: salaryRow.totalCash,
      totalComp: salaryRow.totalCash,
      currencyCode: version.currencyCode,
      jobTitle: mapping.jobTitle ?? null,
      jobFamily: mapping.jobFamily ?? null,
      grade: employee.grade ?? mapping.grade ?? null,
      departmentId: employee.departmentId,
      locationCode: employee.locationCode ?? mapping.locationCode ?? null,
      employmentCategory:
        mapping.employmentCategory ?? employee.employmentType ?? null,
      tenureDays: computeTenureDays(employee.employmentStartDate),
      performanceRating: salaryRow.performanceRating,
    });
  }

  return {
    benchmarkVersionId: version.id,
    versionCurrencyCode: version.currencyCode,
    employees,
    benchmarksByEmployeeId,
    internalBandsByGrade,
  };
}

export async function createHrSbsCompensationAnalysisInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    benchmarkVersionId: string;
    compensationCycleId?: string | null;
    label?: string | null;
    thresholdConfig?: HrSbsThresholdConfigPayload | null;
    snapshot: HrSbsAnalysisSnapshotPayload;
    analyzedEmployeeCount: number;
    flaggedBelowTargetCount: number;
    flaggedAboveRangeCount: number;
  },
) {
  await loadHrSbsBenchmarkVersionInTx(db, {
    organizationId: input.organizationId,
    benchmarkVersionId: input.benchmarkVersionId,
  });

  const analysisId = createEntityId("hr_sbs_analysis");
  const now = new Date();

  await db.insert(hrSbsCompensationAnalyses).values({
    id: analysisId,
    organizationId: input.organizationId,
    benchmarkVersionId: input.benchmarkVersionId,
    label: input.label ?? null,
    compensationCycleId: input.compensationCycleId ?? null,
    thresholdConfig: input.thresholdConfig ?? null,
    snapshot: input.snapshot,
    analyzedEmployeeCount: String(input.analyzedEmployeeCount),
    flaggedBelowTargetCount: String(input.flaggedBelowTargetCount),
    flaggedAboveRangeCount: String(input.flaggedAboveRangeCount),
    createdByUserId: input.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  await appendHrSbsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.sbs.analysis.run",
    summary: `Ran compensation analysis ${analysisId}`,
    benchmarkVersionId: input.benchmarkVersionId,
    analysisId,
    metadata: {
      analyzedEmployeeCount: input.analyzedEmployeeCount,
      flaggedBelowTargetCount: input.flaggedBelowTargetCount,
      flaggedAboveRangeCount: input.flaggedAboveRangeCount,
    },
  });

  return {
    analysisId,
    benchmarkVersionId: input.benchmarkVersionId,
    createdAt: now.toISOString(),
    createdByUserId: input.actorUserId,
  };
}

export async function listHrSbsCompensationAnalysesInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    page?: number;
    pageSize?: number;
    benchmarkVersionId?: string | null;
  },
) {
  const page = input.page ?? 1;
  const pageSize = clampPageSize(input.pageSize);
  const offset = (page - 1) * pageSize;

  const conditions = [
    eq(hrSbsCompensationAnalyses.organizationId, input.organizationId),
  ];
  if (input.benchmarkVersionId) {
    conditions.push(
      eq(hrSbsCompensationAnalyses.benchmarkVersionId, input.benchmarkVersionId),
    );
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrSbsCompensationAnalyses)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrSbsCompensationAnalyses.id,
      benchmarkVersionId: hrSbsCompensationAnalyses.benchmarkVersionId,
      label: hrSbsCompensationAnalyses.label,
      snapshot: hrSbsCompensationAnalyses.snapshot,
      analyzedEmployeeCount: hrSbsCompensationAnalyses.analyzedEmployeeCount,
      flaggedBelowTargetCount: hrSbsCompensationAnalyses.flaggedBelowTargetCount,
      flaggedAboveRangeCount: hrSbsCompensationAnalyses.flaggedAboveRangeCount,
      createdByUserId: hrSbsCompensationAnalyses.createdByUserId,
      createdAt: hrSbsCompensationAnalyses.createdAt,
    })
    .from(hrSbsCompensationAnalyses)
    .where(whereClause)
    .orderBy(desc(hrSbsCompensationAnalyses.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items = rows.map((row) => ({
    analysisId: row.id,
    organizationId: input.organizationId,
    benchmarkVersionId: row.benchmarkVersionId,
    label: row.label,
    snapshot: row.snapshot,
    analyzedEmployeeCount: Number(row.analyzedEmployeeCount ?? 0),
    flaggedBelowTargetCount: Number(row.flaggedBelowTargetCount ?? 0),
    flaggedAboveRangeCount: Number(row.flaggedAboveRangeCount ?? 0),
    createdByUserId: row.createdByUserId,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
  }));

  return buildPaginatedWindow({
    rows: items,
    pageSize,
    offset: (page - 1) * pageSize,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrSbsCompensationAnalysesWindow(input: {
  organizationId: string;
  page?: number;
  pageSize?: number;
  benchmarkVersionId?: string | null;
}) {
  const { runWithOrganizationContext } = await import("./client");
  return runWithOrganizationContext(input.organizationId, (db) =>
    listHrSbsCompensationAnalysesInTx(db, input),
  );
}
