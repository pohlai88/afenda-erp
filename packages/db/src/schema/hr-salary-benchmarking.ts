import {
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./common";
import { hrEmployees } from "./hr";
import { hrCompensationRecommendations } from "./hr-compensation-planning";
import { organizations } from "./organizations";

/** JSON payload persisted from @afenda/feature-hr-suite SBS analysis engine. */
export type HrSbsAnalysisSnapshotPayload = Record<string, unknown>;

export type HrSbsThresholdConfigPayload = Record<string, unknown>;

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

/** SBS-022 — benchmark dataset version metadata. */
export const hrSbsBenchmarkVersionStatusEnum = pgEnum(
  "hr_sbs_benchmark_version_status",
  ["draft", "active", "superseded", "archived"],
);

export const hrSbsBenchmarkVersions = pgTable(
  "hr_sbs_benchmark_versions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    label: text("label").notNull(),
    provider: text("provider").notNull(),
    surveyYear: numeric("survey_year", { precision: 4, scale: 0 }).notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    sourceReference: text("source_reference"),
    currencyCode: text("currency_code").notNull().default("USD"),
    versionStatus: hrSbsBenchmarkVersionStatusEnum("version_status")
      .notNull()
      .default("draft"),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_sbs_benchmark_versions_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_sbs_benchmark_versions_org_status_idx").on(
      table.organizationId,
      table.versionStatus,
    ),
  ],
);

/** SBS-002/003/004 — market salary reference rows for a benchmark version. */
export const hrSbsBenchmarkEntries = pgTable(
  "hr_sbs_benchmark_entries",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    benchmarkVersionId: text("benchmark_version_id")
      .notNull()
      .references(() => hrSbsBenchmarkVersions.id, { onDelete: "cascade" }),
    industry: text("industry").notNull(),
    country: text("country").notNull(),
    location: text("location").notNull(),
    jobFamily: text("job_family").notNull(),
    jobLevel: text("job_level").notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    salaryMinimum: numeric("salary_minimum", { precision: 14, scale: 2 }),
    salaryMidpoint: numeric("salary_midpoint", { precision: 14, scale: 2 }),
    salaryMedian: numeric("salary_median", { precision: 14, scale: 2 }),
    salaryMaximum: numeric("salary_maximum", { precision: 14, scale: 2 }),
    salaryAverage: numeric("salary_average", { precision: 14, scale: 2 }),
    percentile25: numeric("percentile_25", { precision: 14, scale: 2 }),
    percentile50: numeric("percentile_50", { precision: 14, scale: 2 }),
    percentile75: numeric("percentile_75", { precision: 14, scale: 2 }),
    percentile90: numeric("percentile_90", { precision: 14, scale: 2 }),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_sbs_benchmark_entries_org_version_dims_uidx").on(
      table.organizationId,
      table.benchmarkVersionId,
      table.industry,
      table.country,
      table.location,
      table.jobFamily,
      table.jobLevel,
    ),
    index("hr_sbs_benchmark_entries_org_version_idx").on(
      table.organizationId,
      table.benchmarkVersionId,
    ),
  ],
);

/** SBS-024 — currency conversion reference records. */
export const hrSbsCurrencyRateSourceEnum = pgEnum(
  "hr_sbs_currency_rate_source",
  ["manual", "ecb", "survey_provider", "internal"],
);

export const hrSbsCurrencyRefs = pgTable(
  "hr_sbs_currency_refs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    benchmarkVersionId: text("benchmark_version_id").references(
      () => hrSbsBenchmarkVersions.id,
      { onDelete: "cascade" },
    ),
    fromCurrencyCode: text("from_currency_code").notNull(),
    toCurrencyCode: text("to_currency_code").notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 18, scale: 8 }).notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    rateSource: hrSbsCurrencyRateSourceEnum("rate_source")
      .notNull()
      .default("manual"),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_sbs_currency_refs_org_pair_date_idx").on(
      table.organizationId,
      table.fromCurrencyCode,
      table.toCurrencyCode,
      table.effectiveDate,
    ),
  ],
);

/** SBS-005..008 — internal job/grade mapping to benchmark entry. */
export const hrSbsMappingStatusEnum = pgEnum("hr_sbs_mapping_status", [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "superseded",
]);

export const hrSbsBenchmarkMappings = pgTable(
  "hr_sbs_benchmark_mappings",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    benchmarkVersionId: text("benchmark_version_id")
      .notNull()
      .references(() => hrSbsBenchmarkVersions.id, { onDelete: "cascade" }),
    benchmarkEntryId: text("benchmark_entry_id")
      .notNull()
      .references(() => hrSbsBenchmarkEntries.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "cascade",
    }),
    legalEntityCode: text("legal_entity_code"),
    country: text("country"),
    locationCode: text("location_code"),
    jobFamily: text("job_family"),
    jobTitle: text("job_title"),
    grade: text("grade"),
    employmentCategory: text("employment_category"),
    mappingStatus: hrSbsMappingStatusEnum("mapping_status")
      .notNull()
      .default("draft"),
    createdByUserId: text("created_by_user_id").notNull(),
    approvedByUserId: text("approved_by_user_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_sbs_benchmark_mappings_org_version_idx").on(
      table.organizationId,
      table.benchmarkVersionId,
    ),
    index("hr_sbs_benchmark_mappings_org_status_idx").on(
      table.organizationId,
      table.mappingStatus,
    ),
    index("hr_sbs_benchmark_mappings_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

/** SBS-008 — approval workflow for benchmark mapping changes. */
export const hrSbsMappingApprovals = pgTable(
  "hr_sbs_mapping_approvals",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    mappingId: text("mapping_id")
      .notNull()
      .references(() => hrSbsBenchmarkMappings.id, { onDelete: "cascade" }),
    requestedByUserId: text("requested_by_user_id").notNull(),
    reviewedByUserId: text("reviewed_by_user_id"),
    decision: text("decision"),
    decisionNote: text("decision_note"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_sbs_mapping_approvals_org_mapping_idx").on(
      table.organizationId,
      table.mappingId,
    ),
  ],
);

/** SBS-023 — persisted compensation analysis with benchmark version reference. */
export const hrSbsCompensationAnalyses = pgTable(
  "hr_sbs_compensation_analyses",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    benchmarkVersionId: text("benchmark_version_id")
      .notNull()
      .references(() => hrSbsBenchmarkVersions.id, { onDelete: "restrict" }),
    label: text("label"),
    compensationCycleId: text("compensation_cycle_id"),
    thresholdConfig: jsonb("threshold_config").$type<HrSbsThresholdConfigPayload>(),
    snapshot: jsonb("snapshot").$type<HrSbsAnalysisSnapshotPayload>().notNull(),
    analyzedEmployeeCount: numeric("analyzed_employee_count", {
      precision: 8,
      scale: 0,
    }).notNull(),
    flaggedBelowTargetCount: numeric("flagged_below_target_count", {
      precision: 8,
      scale: 0,
    }).notNull(),
    flaggedAboveRangeCount: numeric("flagged_above_range_count", {
      precision: 8,
      scale: 0,
    }).notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_sbs_comp_analyses_org_version_idx").on(
      table.organizationId,
      table.benchmarkVersionId,
    ),
    index("hr_sbs_comp_analyses_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
  ],
);

/** SBS-021 — market adjustment recommendation references for CPM handoff. */
export const hrSbsCpmRecommendationRefs = pgTable(
  "hr_sbs_cpm_recommendation_refs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    analysisId: text("analysis_id")
      .notNull()
      .references(() => hrSbsCompensationAnalyses.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    compensationRecommendationId: text("compensation_recommendation_id").references(
      () => hrCompensationRecommendations.id,
      { onDelete: "set null" },
    ),
    benchmarkVersionId: text("benchmark_version_id")
      .notNull()
      .references(() => hrSbsBenchmarkVersions.id, { onDelete: "restrict" }),
    marketPosition: text("market_position").notNull(),
    marketRatio: numeric("market_ratio", { precision: 8, scale: 4 }),
    suggestedAdjustmentPercent: numeric("suggested_adjustment_percent", {
      precision: 8,
      scale: 4,
    }),
    bandAdjustmentIndicator: text("band_adjustment_indicator"),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_sbs_cpm_rec_refs_org_analysis_idx").on(
      table.organizationId,
      table.analysisId,
    ),
    index("hr_sbs_cpm_rec_refs_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

/** SBS-028 — audit trail for survey, mapping, analysis, and recommendation actions. */
export const hrSbsAuditEvents = pgTable(
  "hr_sbs_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    benchmarkVersionId: text("benchmark_version_id").references(
      () => hrSbsBenchmarkVersions.id,
      { onDelete: "set null" },
    ),
    mappingId: text("mapping_id").references(() => hrSbsBenchmarkMappings.id, {
      onDelete: "set null",
    }),
    analysisId: text("analysis_id").references(
      () => hrSbsCompensationAnalyses.id,
      { onDelete: "set null" },
    ),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_sbs_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_sbs_audit_events_org_action_idx").on(
      table.organizationId,
      table.action,
    ),
  ],
);

/** @deprecated Use hrSbsBenchmarkEntries */
export const hrSbsBenchmarkRecords = hrSbsBenchmarkEntries;
