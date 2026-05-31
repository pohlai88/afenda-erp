import {
  boolean,
  date,
  index,
  integer,
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
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

/** MCP-006/007 — pay component tax treatment by country. */
export const hrMcpPayComponentTaxTreatmentEnum = pgEnum(
  "hr_mcp_pay_component_tax_treatment",
  ["taxable", "non_taxable"],
);

/** MCP-006/007 — statutory contribution treatment. */
export const hrMcpPayComponentContributionTreatmentEnum = pgEnum(
  "hr_mcp_pay_component_contribution_treatment",
  ["contributable", "non_contributable"],
);

/** MCP-006/007 — pension treatment. */
export const hrMcpPayComponentPensionTreatmentEnum = pgEnum(
  "hr_mcp_pay_component_pension_treatment",
  ["pensionable", "non_pensionable"],
);

/** MCP-023 — country payroll rule version lifecycle. */
export const hrMcpRuleVersionStatusEnum = pgEnum("hr_mcp_rule_version_status", [
  "draft",
  "published",
  "superseded",
  "archived",
]);

/** MCP-017/018/019 — statutory, tax, and contribution report kinds. */
export const hrMcpReportKindEnum = pgEnum("hr_mcp_report_kind", [
  "statutory",
  "tax",
  "contribution",
]);

export const hrMcpReportGenerationStatusEnum = pgEnum(
  "hr_mcp_report_generation_status",
  ["pending", "completed", "failed"],
);

/** MCP-021/022 — bank and vendor export format kinds. */
export const hrMcpExportFormatKindEnum = pgEnum("hr_mcp_export_format_kind", [
  "bank_payment",
  "statutory_portal",
  "payroll_vendor",
]);

/** MCP-014 — employee tax residency classification. */
export const hrMcpTaxResidencyEnum = pgEnum("hr_mcp_tax_residency", [
  "resident",
  "non_resident",
  "dual",
]);

/** MCP-014 — local worker category. */
export const hrMcpWorkerCategoryEnum = pgEnum("hr_mcp_worker_category", [
  "full_time",
  "part_time",
  "contractor",
  "intern",
  "temporary",
  "director",
  "other",
]);

/** MCP-014 — statutory eligibility. */
export const hrMcpStatutoryEligibilityEnum = pgEnum(
  "hr_mcp_statutory_eligibility",
  ["eligible", "ineligible", "pending"],
);

/** MCP-010 — payroll calendar period frequency. */
export const hrMcpCalendarPeriodKindEnum = pgEnum("hr_mcp_calendar_period_kind", [
  "weekly",
  "biweekly",
  "semi_monthly",
  "monthly",
  "custom",
]);

/** MCP-010 — statutory filing deadline kinds. */
export const hrMcpStatutoryDeadlineKindEnum = pgEnum(
  "hr_mcp_statutory_deadline_kind",
  [
    "tax_filing",
    "contribution_filing",
    "employer_declaration",
    "employee_income_statement",
    "other",
  ],
);

/** MCP-013 — leave payroll impact treatment. */
export const hrMcpLeavePayrollImpactEnum = pgEnum("hr_mcp_leave_payroll_impact", [
  "paid",
  "unpaid",
  "statutory_paid",
  "no_pay",
]);

/** MCP-011 — proration scenario kinds. */
export const hrMcpProrationScenarioEnum = pgEnum("hr_mcp_proration_scenario", [
  "new_joiner",
  "termination",
  "unpaid_leave",
  "mid_period_salary_change",
  "other",
]);

/** MCP-011 — proration calculation basis. */
export const hrMcpProrationBasisEnum = pgEnum("hr_mcp_proration_basis", [
  "calendar_days",
  "working_days",
  "monthly_fraction",
]);

export type HrMcpCountryConfigSettings = {
  readonly locale?: string | null;
  readonly dateFormat?: string | null;
  readonly addressFormat?: string | null;
  readonly taxIdFormat?: string | null;
  readonly statutoryIdFormat?: string | null;
  readonly minimumWageReference?: string | null;
};

export type HrMcpRuleConfigPayload = Record<string, unknown>;

export type HrMcpRuleVersionSnapshotPayload = {
  readonly ruleVersionId: string;
  readonly versionNumber: number;
  readonly countryConfigId: string;
  readonly taxRules?: readonly Record<string, unknown>[];
  readonly statutoryRules?: readonly Record<string, unknown>[];
  readonly employerRules?: readonly Record<string, unknown>[];
  readonly payComponentTreatments?: readonly Record<string, unknown>[];
  readonly prorationRules?: readonly Record<string, unknown>[];
  readonly overtimeRules?: readonly Record<string, unknown>[];
  readonly leaveTreatments?: readonly Record<string, unknown>[];
};

export type HrMcpExportFormatConfig = Record<string, unknown>;

export type HrMcpPayslipFieldConfig = {
  readonly fieldKey: string;
  readonly label: string;
  readonly required: boolean;
  readonly displayOrder: number;
  readonly statutoryBreakdown?: boolean;
};

/** MCP-001 — country payroll configuration. */
export const hrMcpCountryConfigs = pgTable(
  "hr_mcp_country_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryCode: text("country_code").notNull(),
    name: text("name").notNull(),
    defaultCurrencyCode: text("default_currency_code").notNull().default("USD"),
    defaultLocale: text("default_locale"),
    settings: jsonb("settings").$type<HrMcpCountryConfigSettings>(),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_country_configs_org_country_uidx").on(
      table.organizationId,
      table.countryCode,
    ),
    index("hr_mcp_country_configs_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

/** MCP-002 — legal entity payroll setup per country. */
export const hrMcpLegalEntitySetups = pgTable(
  "hr_mcp_legal_entity_setups",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntityCode: text("legal_entity_code").notNull(),
    name: text("name").notNull(),
    registrationNumber: text("registration_number"),
    statutoryEmployerAccount: text("statutory_employer_account"),
    payrollCountryCode: text("payroll_country_code").notNull(),
    payGroupCode: text("pay_group_code"),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_legal_entity_setups_org_country_entity_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.legalEntityCode,
    ),
    index("hr_mcp_legal_entity_setups_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

/** MCP-023 — versioned country payroll rule bundles. */
export const hrMcpRuleVersions = pgTable(
  "hr_mcp_rule_versions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    versionStatus: hrMcpRuleVersionStatusEnum("version_status")
      .notNull()
      .default("draft"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedByUserId: text("published_by_user_id"),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_rule_versions_org_country_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.versionNumber,
    ),
    index("hr_mcp_rule_versions_org_country_status_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.versionStatus,
    ),
  ],
);

/** MCP-003 — country-specific tax rule references. */
export const hrMcpTaxRules = pgTable(
  "hr_mcp_tax_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    referenceCode: text("reference_code"),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>().notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_tax_rules_org_country_code_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.code,
      table.ruleVersionId,
    ),
    index("hr_mcp_tax_rules_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-004 — statutory contribution rules. */
export const hrMcpStatutoryContributionRules = pgTable(
  "hr_mcp_statutory_contribution_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    contributionType: text("contribution_type").notNull(),
    referenceCode: text("reference_code"),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>().notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_statutory_rules_org_country_code_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.code,
      table.ruleVersionId,
    ),
    index("hr_mcp_statutory_rules_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-005 — employer contribution rules. */
export const hrMcpEmployerContributionRules = pgTable(
  "hr_mcp_employer_contribution_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    contributionType: text("contribution_type").notNull(),
    referenceCode: text("reference_code"),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>().notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_employer_rules_org_country_code_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.code,
      table.ruleVersionId,
    ),
    index("hr_mcp_employer_rules_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-006/007 — pay component treatments by country. */
export const hrMcpPayComponentTreatments = pgTable(
  "hr_mcp_pay_component_treatments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    payComponentCode: text("pay_component_code").notNull(),
    payComponentName: text("pay_component_name"),
    taxTreatment: hrMcpPayComponentTaxTreatmentEnum("tax_treatment").notNull(),
    contributionTreatment: hrMcpPayComponentContributionTreatmentEnum(
      "contribution_treatment",
    ).notNull(),
    pensionTreatment: hrMcpPayComponentPensionTreatmentEnum(
      "pension_treatment",
    ).notNull(),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_pay_treatments_org_country_component_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.payComponentCode,
      table.ruleVersionId,
    ),
    index("hr_mcp_pay_treatments_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-008 — payroll currency by country and optional legal entity. */
export const hrMcpCurrencyConfigs = pgTable(
  "hr_mcp_currency_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "cascade" },
    ),
    payrollCurrencyCode: text("payroll_currency_code").notNull(),
    reportingCurrencyCode: text("reporting_currency_code"),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_currency_configs_org_country_entity_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.legalEntitySetupId,
    ),
    index("hr_mcp_currency_configs_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

/** MCP-009 — exchange rate references for reporting and consolidation. */
export const hrMcpExchangeRates = pgTable(
  "hr_mcp_exchange_rates",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    fromCurrencyCode: text("from_currency_code").notNull(),
    toCurrencyCode: text("to_currency_code").notNull(),
    rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
    rateDate: date("rate_date").notNull(),
    sourceReference: text("source_reference"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_exchange_rates_org_pair_date_uidx").on(
      table.organizationId,
      table.fromCurrencyCode,
      table.toCurrencyCode,
      table.rateDate,
    ),
    index("hr_mcp_exchange_rates_org_rate_date_idx").on(
      table.organizationId,
      table.rateDate,
    ),
  ],
);

/** MCP-010 — country payroll calendar definition. */
export const hrMcpPayrollCalendars = pgTable(
  "hr_mcp_payroll_calendars",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "cascade" },
    ),
    code: text("code").notNull(),
    name: text("name").notNull(),
    periodKind: hrMcpCalendarPeriodKindEnum("period_kind").notNull(),
    payGroupCode: text("pay_group_code"),
    calendarYear: integer("calendar_year").notNull(),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_payroll_calendars_org_country_code_year_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.code,
      table.calendarYear,
    ),
    index("hr_mcp_payroll_calendars_org_country_idx").on(
      table.organizationId,
      table.countryConfigId,
    ),
  ],
);

/** MCP-010 — pay period cutoff and pay dates within a calendar. */
export const hrMcpCalendarPeriods = pgTable(
  "hr_mcp_calendar_periods",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    calendarId: text("calendar_id")
      .notNull()
      .references(() => hrMcpPayrollCalendars.id, { onDelete: "cascade" }),
    periodCode: text("period_code").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    cutoffDate: date("cutoff_date").notNull(),
    payDate: date("pay_date").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_calendar_periods_org_calendar_code_uidx").on(
      table.organizationId,
      table.calendarId,
      table.periodCode,
    ),
    index("hr_mcp_calendar_periods_org_pay_date_idx").on(
      table.organizationId,
      table.payDate,
    ),
  ],
);

/** MCP-010 — public holidays by country. */
export const hrMcpPublicHolidays = pgTable(
  "hr_mcp_public_holidays",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    holidayDate: date("holiday_date").notNull(),
    name: text("name").notNull(),
    regionCode: text("region_code"),
    recurringAnnually: boolean("recurring_annually").notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_public_holidays_org_country_date_region_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.holidayDate,
      table.regionCode,
    ),
    index("hr_mcp_public_holidays_org_country_date_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.holidayDate,
    ),
  ],
);

/** MCP-010 — statutory filing and payroll deadlines. */
export const hrMcpStatutoryDeadlines = pgTable(
  "hr_mcp_statutory_deadlines",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    deadlineKind: hrMcpStatutoryDeadlineKindEnum("deadline_kind").notNull(),
    dueDate: date("due_date").notNull(),
    periodRef: text("period_ref"),
    description: text("description"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_mcp_statutory_deadlines_org_country_due_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.dueDate,
    ),
  ],
);

/** MCP-011 — country-specific proration rules. */
export const hrMcpProrationRules = pgTable(
  "hr_mcp_proration_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    scenario: hrMcpProrationScenarioEnum("scenario").notNull(),
    basis: hrMcpProrationBasisEnum("basis").notNull(),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>().notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_proration_rules_org_country_scenario_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.scenario,
      table.ruleVersionId,
    ),
    index("hr_mcp_proration_rules_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-012 — overtime and rest-day calculation rules. */
export const hrMcpOvertimeRules = pgTable(
  "hr_mcp_overtime_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    overtimeRateMultiplier: numeric("overtime_rate_multiplier", {
      precision: 8,
      scale: 4,
    }).notNull(),
    restDayRateMultiplier: numeric("rest_day_rate_multiplier", {
      precision: 8,
      scale: 4,
    }),
    publicHolidayRateMultiplier: numeric("public_holiday_rate_multiplier", {
      precision: 8,
      scale: 4,
    }),
    maxWeeklyHours: numeric("max_weekly_hours", { precision: 6, scale: 2 }),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_overtime_rules_org_country_code_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.code,
      table.ruleVersionId,
    ),
    index("hr_mcp_overtime_rules_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-013 — leave payroll treatment by country. */
export const hrMcpLeavePayrollTreatments = pgTable(
  "hr_mcp_leave_payroll_treatments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    leaveTypeCode: text("leave_type_code").notNull(),
    leaveTypeName: text("leave_type_name"),
    payrollImpact: hrMcpLeavePayrollImpactEnum("payroll_impact").notNull(),
    statutoryLeave: boolean("statutory_leave").notNull().default(false),
    ruleConfig: jsonb("rule_config").$type<HrMcpRuleConfigPayload>(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_leave_treatments_org_country_type_version_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.leaveTypeCode,
      table.ruleVersionId,
    ),
    index("hr_mcp_leave_treatments_org_country_active_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.active,
    ),
  ],
);

/** MCP-014 — employee tax residency and statutory classifications. */
export const hrMcpEmployeeClassifications = pgTable(
  "hr_mcp_employee_classifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "set null" },
    ),
    taxResidency: hrMcpTaxResidencyEnum("tax_residency").notNull(),
    workerCategory: hrMcpWorkerCategoryEnum("worker_category").notNull(),
    statutoryEligibility: hrMcpStatutoryEligibilityEnum("statutory_eligibility")
      .notNull()
      .default("pending"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_mcp_employee_classifications_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_mcp_employee_classifications_org_country_idx").on(
      table.organizationId,
      table.countryConfigId,
    ),
  ],
);

/** MCP-017/018/019 — report generation configuration references. */
export const hrMcpReportConfigs = pgTable(
  "hr_mcp_report_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    reportKind: hrMcpReportKindEnum("report_kind").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    templateReference: text("template_reference"),
    config: jsonb("config").$type<HrMcpRuleConfigPayload>().notNull(),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_report_configs_org_country_kind_code_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.reportKind,
      table.code,
    ),
  ],
);

/** MCP-017/018/019 — generated report records. */
export const hrMcpReportGenerations = pgTable(
  "hr_mcp_report_generations",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    reportConfigId: text("report_config_id")
      .notNull()
      .references(() => hrMcpReportConfigs.id, { onDelete: "cascade" }),
    periodRef: text("period_ref").notNull(),
    generationStatus: hrMcpReportGenerationStatusEnum("generation_status")
      .notNull()
      .default("pending"),
    outputReference: text("output_reference"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    generatedByUserId: text("generated_by_user_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_mcp_report_generations_org_config_period_idx").on(
      table.organizationId,
      table.reportConfigId,
      table.periodRef,
    ),
    index("hr_mcp_report_generations_org_status_idx").on(
      table.organizationId,
      table.generationStatus,
    ),
  ],
);

/** MCP-020 — payslip field configuration per country. */
export const hrMcpPayslipFieldConfigs = pgTable(
  "hr_mcp_payslip_field_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    label: text("label").notNull(),
    required: boolean("required").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    statutoryBreakdown: boolean("statutory_breakdown").notNull().default(false),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_payslip_fields_org_country_key_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.fieldKey,
    ),
    index("hr_mcp_payslip_fields_org_country_order_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.displayOrder,
    ),
  ],
);

/** MCP-021 — bank payment file format configuration. */
export const hrMcpBankExportConfigs = pgTable(
  "hr_mcp_bank_export_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "cascade" },
    ),
    formatCode: text("format_code").notNull(),
    name: text("name").notNull(),
    formatKind: hrMcpExportFormatKindEnum("format_kind")
      .notNull()
      .default("bank_payment"),
    config: jsonb("config").$type<HrMcpExportFormatConfig>().notNull(),
    enabled: boolean("enabled").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_bank_export_configs_org_country_format_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.formatCode,
      table.legalEntitySetupId,
    ),
  ],
);

/** MCP-022 — statutory portal and payroll vendor export formats. */
export const hrMcpVendorExportConfigs = pgTable(
  "hr_mcp_vendor_export_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    vendorCode: text("vendor_code").notNull(),
    formatCode: text("format_code").notNull(),
    name: text("name").notNull(),
    formatKind: hrMcpExportFormatKindEnum("format_kind").notNull(),
    config: jsonb("config").$type<HrMcpExportFormatConfig>().notNull(),
    enabled: boolean("enabled").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_vendor_export_configs_org_country_vendor_format_uidx").on(
      table.organizationId,
      table.countryConfigId,
      table.vendorCode,
      table.formatCode,
    ),
  ],
);

/** MCP-024 — finalized payroll rule version snapshots linked to payroll run. */
export const hrMcpFinalizedRuleSnapshots = pgTable(
  "hr_mcp_finalized_rule_snapshots",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "set null" },
    ),
    ruleVersionId: text("rule_version_id")
      .notNull()
      .references(() => hrMcpRuleVersions.id, { onDelete: "restrict" }),
    payrollRunRef: text("payroll_run_ref").notNull(),
    periodRef: text("period_ref"),
    snapshot: jsonb("snapshot")
      .$type<HrMcpRuleVersionSnapshotPayload>()
      .notNull(),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_finalized_snapshots_org_run_uidx").on(
      table.organizationId,
      table.payrollRunRef,
    ),
    index("hr_mcp_finalized_snapshots_org_country_idx").on(
      table.organizationId,
      table.countryConfigId,
    ),
  ],
);

/** MCP-026/027 — cross-country payroll cost reporting period anchors. */
export const hrMcpCrossCountryReportPeriods = pgTable(
  "hr_mcp_cross_country_report_periods",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    periodRef: text("period_ref").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    reportingCurrencyCode: text("reporting_currency_code").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_mcp_cross_country_periods_org_ref_uidx").on(
      table.organizationId,
      table.periodRef,
    ),
  ],
);

/** MCP-026/027 — consolidated employer cost lines by country/entity/currency. */
export const hrMcpCrossCountryCostLines = pgTable(
  "hr_mcp_cross_country_cost_lines",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    reportPeriodId: text("report_period_id")
      .notNull()
      .references(() => hrMcpCrossCountryReportPeriods.id, {
        onDelete: "cascade",
      }),
    countryConfigId: text("country_config_id")
      .notNull()
      .references(() => hrMcpCountryConfigs.id, { onDelete: "cascade" }),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "set null" },
    ),
    payGroupCode: text("pay_group_code"),
    currencyCode: text("currency_code").notNull(),
    employerCostTotal: numeric("employer_cost_total", {
      precision: 16,
      scale: 2,
    }).notNull(),
    headcount: integer("headcount").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_mcp_cross_country_cost_lines_org_period_idx").on(
      table.organizationId,
      table.reportPeriodId,
    ),
    index("hr_mcp_cross_country_cost_lines_org_country_idx").on(
      table.organizationId,
      table.countryConfigId,
      table.currencyCode,
    ),
  ],
);

/** MCP-028 — country payroll setup and rule change audit trail. */
export const hrMcpAuditEvents = pgTable(
  "hr_mcp_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    countryConfigId: text("country_config_id").references(
      () => hrMcpCountryConfigs.id,
      { onDelete: "set null" },
    ),
    legalEntitySetupId: text("legal_entity_setup_id").references(
      () => hrMcpLegalEntitySetups.id,
      { onDelete: "set null" },
    ),
    ruleVersionId: text("rule_version_id").references(() => hrMcpRuleVersions.id, {
      onDelete: "set null",
    }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    payrollRunRef: text("payroll_run_ref"),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_mcp_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_mcp_audit_events_org_country_idx").on(
      table.organizationId,
      table.countryConfigId,
    ),
  ],
);
