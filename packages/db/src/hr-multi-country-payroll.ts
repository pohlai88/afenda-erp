import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import {
  assertEffectiveDateRange,
  assertHrMcpRuleVersionStatusTransition,
  formatNumeric,
  HrMcpCommandError,
  isHrMcpRuleVersionLocked,
} from "./hr-multi-country-payroll.shared";
import {
  hrMcpAuditEvents,
  hrMcpBankExportConfigs,
  hrMcpCalendarPeriods,
  hrMcpCountryConfigs,
  hrMcpCrossCountryCostLines,
  hrMcpCrossCountryReportPeriods,
  hrMcpCurrencyConfigs,
  hrMcpEmployeeClassifications,
  hrMcpEmployerContributionRules,
  hrMcpExchangeRates,
  hrMcpFinalizedRuleSnapshots,
  hrMcpLeavePayrollTreatments,
  hrMcpLegalEntitySetups,
  hrMcpOvertimeRules,
  hrMcpPayComponentTreatments,
  hrMcpPayrollCalendars,
  hrMcpPayslipFieldConfigs,
  hrMcpProrationRules,
  hrMcpPublicHolidays,
  hrMcpReportConfigs,
  hrMcpReportGenerations,
  hrMcpRuleVersions,
  hrMcpStatutoryContributionRules,
  hrMcpStatutoryDeadlines,
  hrMcpTaxRules,
  hrMcpVendorExportConfigs,
  type HrMcpCountryConfigSettings,
  type HrMcpExportFormatConfig,
  type HrMcpRuleConfigPayload,
  type HrMcpRuleVersionSnapshotPayload,
} from "./dbx-hr-multi-country-payroll";
import { hrEmployees } from "./hr";

export {
  HrMcpCommandError,
  formatNumeric,
  parseNumeric,
  assertEffectiveDateRange,
  assertHrMcpRuleVersionStatusTransition,
  isHrMcpRuleVersionLocked,
  HR_MCP_EDITABLE_RULE_VERSION_STATUSES,
  HR_MCP_PUBLISHED_RULE_VERSION_STATUSES,
} from "./hr-multi-country-payroll.shared";

// ---------------------------------------------------------------------------
// Audit (MCP-028)
// ---------------------------------------------------------------------------

export async function appendHrMcpAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    action: string;
    summary?: string;
    metadata?: Record<string, unknown>;
    countryConfigId?: string | null;
    legalEntitySetupId?: string | null;
    ruleVersionId?: string | null;
    employeeId?: string | null;
    payrollRunRef?: string | null;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_mcp_audit");

  await db.insert(hrMcpAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    countryConfigId: input.countryConfigId ?? null,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    ruleVersionId: input.ruleVersionId ?? null,
    employeeId: input.employeeId ?? null,
    payrollRunRef: input.payrollRunRef ?? null,
    actorUserId: input.actorUserId,
    action: input.action,
    summary: input.summary ?? null,
    metadata: input.metadata ?? null,
    occurredAt: input.occurredAt ?? new Date(),
  });

  return { auditEventId };
}

export async function listHrMcpAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  countryConfigId?: string | null;
  legalEntitySetupId?: string | null;
  ruleVersionId?: string | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpAuditEvents.organizationId, input.organizationId),
    ];

    if (input.countryConfigId) {
      conditions.push(
        eq(hrMcpAuditEvents.countryConfigId, input.countryConfigId),
      );
    }
    if (input.legalEntitySetupId) {
      conditions.push(
        eq(hrMcpAuditEvents.legalEntitySetupId, input.legalEntitySetupId),
      );
    }
    if (input.ruleVersionId) {
      conditions.push(eq(hrMcpAuditEvents.ruleVersionId, input.ruleVersionId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrMcpAuditEvents.action, pattern),
          ilike(hrMcpAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrMcpAuditEvents.id,
        action: hrMcpAuditEvents.action,
        summary: hrMcpAuditEvents.summary,
        occurredAt: hrMcpAuditEvents.occurredAt,
        actorUserId: hrMcpAuditEvents.actorUserId,
        countryConfigId: hrMcpAuditEvents.countryConfigId,
        legalEntitySetupId: hrMcpAuditEvents.legalEntitySetupId,
        ruleVersionId: hrMcpAuditEvents.ruleVersionId,
        payrollRunRef: hrMcpAuditEvents.payrollRunRef,
      })
      .from(hrMcpAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrMcpAuditEvents.occurredAt))
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

// ---------------------------------------------------------------------------
// Country config & legal entity (MCP-001/002)
// ---------------------------------------------------------------------------

async function assertHrMcpCountryConfigExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  countryConfigId: string,
) {
  const [row] = await db
    .select()
    .from(hrMcpCountryConfigs)
    .where(
      and(
        eq(hrMcpCountryConfigs.organizationId, organizationId),
        eq(hrMcpCountryConfigs.id, countryConfigId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new HrMcpCommandError("country_config_not_found");
  }

  return row;
}

async function assertHrMcpLegalEntitySetupExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  legalEntitySetupId: string,
) {
  const [row] = await db
    .select()
    .from(hrMcpLegalEntitySetups)
    .where(
      and(
        eq(hrMcpLegalEntitySetups.organizationId, organizationId),
        eq(hrMcpLegalEntitySetups.id, legalEntitySetupId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new HrMcpCommandError("legal_entity_setup_not_found");
  }

  return row;
}

export type CreateHrMcpCountryConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryCode: string;
  name: string;
  defaultCurrencyCode?: string;
  defaultLocale?: string | null;
  settings?: HrMcpCountryConfigSettings | null;
};

export async function createHrMcpCountryConfigInTx(
  db: AfendaTransaction,
  input: CreateHrMcpCountryConfigInput,
): Promise<{ countryConfigId: string }> {
  const countryConfigId = createEntityId("hr_mcp_country");

  await db.insert(hrMcpCountryConfigs).values({
    id: countryConfigId,
    organizationId: input.organizationId,
    countryCode: input.countryCode,
    name: input.name,
    defaultCurrencyCode: input.defaultCurrencyCode ?? "USD",
    defaultLocale: input.defaultLocale ?? null,
    settings: input.settings ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.country_config.create",
    countryConfigId,
    summary: `Created country payroll config ${input.countryCode}`,
  });

  return { countryConfigId };
}

export type UpdateHrMcpCountryConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  name?: string;
  defaultCurrencyCode?: string;
  defaultLocale?: string | null;
  settings?: HrMcpCountryConfigSettings | null;
  active?: boolean;
};

export async function updateHrMcpCountryConfigInTx(
  db: AfendaTransaction,
  input: UpdateHrMcpCountryConfigInput,
): Promise<{ countryConfigId: string }> {
  const existing = await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const updates: Partial<typeof hrMcpCountryConfigs.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.name !== undefined) updates.name = input.name;
  if (input.defaultCurrencyCode !== undefined) {
    updates.defaultCurrencyCode = input.defaultCurrencyCode;
  }
  if (input.defaultLocale !== undefined) updates.defaultLocale = input.defaultLocale;
  if (input.settings !== undefined) updates.settings = input.settings;
  if (input.active !== undefined) updates.active = input.active;

  await db
    .update(hrMcpCountryConfigs)
    .set(updates)
    .where(
      and(
        eq(hrMcpCountryConfigs.organizationId, input.organizationId),
        eq(hrMcpCountryConfigs.id, input.countryConfigId),
      ),
    );

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.country_config.update",
    countryConfigId: input.countryConfigId,
    summary: `Updated country payroll config ${existing.countryCode}`,
    metadata: { updates: Object.keys(updates).filter((k) => k !== "updatedAt") },
  });

  return { countryConfigId: input.countryConfigId };
}

export async function getHrMcpCountryConfigById(input: {
  organizationId: string;
  countryConfigId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrMcpCountryConfigs)
      .where(
        and(
          eq(hrMcpCountryConfigs.organizationId, input.organizationId),
          eq(hrMcpCountryConfigs.id, input.countryConfigId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function listHrMcpCountryConfigsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  activeOnly?: boolean;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpCountryConfigs.organizationId, input.organizationId),
    ];

    if (input.activeOnly) {
      conditions.push(eq(hrMcpCountryConfigs.active, true));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrMcpCountryConfigs.countryCode, pattern),
          ilike(hrMcpCountryConfigs.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpCountryConfigs)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrMcpCountryConfigs.id,
        countryCode: hrMcpCountryConfigs.countryCode,
        name: hrMcpCountryConfigs.name,
        defaultCurrencyCode: hrMcpCountryConfigs.defaultCurrencyCode,
        active: hrMcpCountryConfigs.active,
      })
      .from(hrMcpCountryConfigs)
      .where(whereClause)
      .orderBy(hrMcpCountryConfigs.countryCode)
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

export type CreateHrMcpLegalEntitySetupInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  legalEntityCode: string;
  name: string;
  registrationNumber?: string | null;
  statutoryEmployerAccount?: string | null;
  payrollCountryCode: string;
  payGroupCode?: string | null;
};

export async function createHrMcpLegalEntitySetupInTx(
  db: AfendaTransaction,
  input: CreateHrMcpLegalEntitySetupInput,
): Promise<{ legalEntitySetupId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const legalEntitySetupId = createEntityId("hr_mcp_entity");

  await db.insert(hrMcpLegalEntitySetups).values({
    id: legalEntitySetupId,
    organizationId: input.organizationId,
    countryConfigId: input.countryConfigId,
    legalEntityCode: input.legalEntityCode,
    name: input.name,
    registrationNumber: input.registrationNumber ?? null,
    statutoryEmployerAccount: input.statutoryEmployerAccount ?? null,
    payrollCountryCode: input.payrollCountryCode,
    payGroupCode: input.payGroupCode ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.legal_entity.create",
    countryConfigId: input.countryConfigId,
    legalEntitySetupId,
    summary: `Created legal entity setup ${input.legalEntityCode}`,
  });

  return { legalEntitySetupId };
}

export type UpdateHrMcpLegalEntitySetupInput = {
  organizationId: string;
  actorUserId: string;
  legalEntitySetupId: string;
  name?: string;
  registrationNumber?: string | null;
  statutoryEmployerAccount?: string | null;
  payGroupCode?: string | null;
  active?: boolean;
};

export async function updateHrMcpLegalEntitySetupInTx(
  db: AfendaTransaction,
  input: UpdateHrMcpLegalEntitySetupInput,
): Promise<{ legalEntitySetupId: string }> {
  const existing = await assertHrMcpLegalEntitySetupExistsInTx(
    db,
    input.organizationId,
    input.legalEntitySetupId,
  );

  const updates: Partial<typeof hrMcpLegalEntitySetups.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.name !== undefined) updates.name = input.name;
  if (input.registrationNumber !== undefined) {
    updates.registrationNumber = input.registrationNumber;
  }
  if (input.statutoryEmployerAccount !== undefined) {
    updates.statutoryEmployerAccount = input.statutoryEmployerAccount;
  }
  if (input.payGroupCode !== undefined) updates.payGroupCode = input.payGroupCode;
  if (input.active !== undefined) updates.active = input.active;

  await db
    .update(hrMcpLegalEntitySetups)
    .set(updates)
    .where(
      and(
        eq(hrMcpLegalEntitySetups.organizationId, input.organizationId),
        eq(hrMcpLegalEntitySetups.id, input.legalEntitySetupId),
      ),
    );

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.legal_entity.update",
    countryConfigId: existing.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId,
    summary: `Updated legal entity setup ${existing.legalEntityCode}`,
  });

  return { legalEntitySetupId: input.legalEntitySetupId };
}

export async function listHrMcpLegalEntitySetupsWindow(input: {
  organizationId: string;
  countryConfigId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  activeOnly?: boolean;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpLegalEntitySetups.organizationId, input.organizationId),
    ];

    if (input.countryConfigId) {
      conditions.push(
        eq(hrMcpLegalEntitySetups.countryConfigId, input.countryConfigId),
      );
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpLegalEntitySetups.active, true));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrMcpLegalEntitySetups.legalEntityCode, pattern),
          ilike(hrMcpLegalEntitySetups.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpLegalEntitySetups)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrMcpLegalEntitySetups.id,
        countryConfigId: hrMcpLegalEntitySetups.countryConfigId,
        legalEntityCode: hrMcpLegalEntitySetups.legalEntityCode,
        name: hrMcpLegalEntitySetups.name,
        payrollCountryCode: hrMcpLegalEntitySetups.payrollCountryCode,
        payGroupCode: hrMcpLegalEntitySetups.payGroupCode,
        active: hrMcpLegalEntitySetups.active,
      })
      .from(hrMcpLegalEntitySetups)
      .where(whereClause)
      .orderBy(hrMcpLegalEntitySetups.legalEntityCode)
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

// ---------------------------------------------------------------------------
// Rule versioning (MCP-023)
// ---------------------------------------------------------------------------

async function assertHrMcpRuleVersionExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  ruleVersionId: string,
) {
  const [row] = await db
    .select()
    .from(hrMcpRuleVersions)
    .where(
      and(
        eq(hrMcpRuleVersions.organizationId, organizationId),
        eq(hrMcpRuleVersions.id, ruleVersionId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new HrMcpCommandError("rule_version_not_found");
  }

  return row;
}

export async function getNextHrMcpRuleVersionNumberInTx(
  db: AfendaTransaction,
  organizationId: string,
  countryConfigId: string,
): Promise<number> {
  const [row] = await db
    .select({
      maxVersion: sql<number>`coalesce(max(${hrMcpRuleVersions.versionNumber}), 0)`,
    })
    .from(hrMcpRuleVersions)
    .where(
      and(
        eq(hrMcpRuleVersions.organizationId, organizationId),
        eq(hrMcpRuleVersions.countryConfigId, countryConfigId),
      ),
    );

  return Number(row?.maxVersion ?? 0) + 1;
}

export type CreateHrMcpRuleVersionInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  notes?: string | null;
};

export async function createHrMcpRuleVersionInTx(
  db: AfendaTransaction,
  input: CreateHrMcpRuleVersionInput,
): Promise<{ ruleVersionId: string; versionNumber: number }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const versionNumber = await getNextHrMcpRuleVersionNumberInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  const ruleVersionId = createEntityId("hr_mcp_rulever");

  await db.insert(hrMcpRuleVersions).values({
    id: ruleVersionId,
    organizationId: input.organizationId,
    countryConfigId: input.countryConfigId,
    versionNumber,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo ?? null,
    notes: input.notes ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.rule_version.create",
    countryConfigId: input.countryConfigId,
    ruleVersionId,
    summary: `Created country rule version v${versionNumber}`,
  });

  return { ruleVersionId, versionNumber };
}

export type PublishHrMcpRuleVersionInput = {
  organizationId: string;
  actorUserId: string;
  ruleVersionId: string;
};

export async function publishHrMcpRuleVersionInTx(
  db: AfendaTransaction,
  input: PublishHrMcpRuleVersionInput,
): Promise<{ ruleVersionId: string }> {
  const version = await assertHrMcpRuleVersionExistsInTx(
    db,
    input.organizationId,
    input.ruleVersionId,
  );

  if (isHrMcpRuleVersionLocked(version.versionStatus)) {
    throw new HrMcpCommandError("rule_version_locked");
  }

  assertHrMcpRuleVersionStatusTransition(version.versionStatus, "published");

  await db
    .update(hrMcpRuleVersions)
    .set({
      versionStatus: "published",
      publishedAt: new Date(),
      publishedByUserId: input.actorUserId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrMcpRuleVersions.organizationId, input.organizationId),
        eq(hrMcpRuleVersions.id, input.ruleVersionId),
      ),
    );

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.rule_version.publish",
    countryConfigId: version.countryConfigId,
    ruleVersionId: input.ruleVersionId,
    summary: `Published country rule version v${version.versionNumber}`,
  });

  return { ruleVersionId: input.ruleVersionId };
}

export async function listHrMcpRuleVersionsWindow(input: {
  organizationId: string;
  countryConfigId: string;
  limit?: number;
  offset?: number;
  versionStatus?: (typeof hrMcpRuleVersions.$inferSelect)["versionStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpRuleVersions.organizationId, input.organizationId),
      eq(hrMcpRuleVersions.countryConfigId, input.countryConfigId),
    ];

    if (input.versionStatus) {
      conditions.push(eq(hrMcpRuleVersions.versionStatus, input.versionStatus));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpRuleVersions)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrMcpRuleVersions.id,
        versionNumber: hrMcpRuleVersions.versionNumber,
        versionStatus: hrMcpRuleVersions.versionStatus,
        effectiveFrom: hrMcpRuleVersions.effectiveFrom,
        effectiveTo: hrMcpRuleVersions.effectiveTo,
        publishedAt: hrMcpRuleVersions.publishedAt,
      })
      .from(hrMcpRuleVersions)
      .where(whereClause)
      .orderBy(desc(hrMcpRuleVersions.versionNumber))
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

// ---------------------------------------------------------------------------
// Tax / statutory / employer rules (MCP-003/004/005)
// ---------------------------------------------------------------------------

export type UpsertHrMcpTaxRuleInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  code: string;
  name: string;
  ruleConfig: HrMcpRuleConfigPayload;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  referenceCode?: string | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpTaxRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpTaxRuleInput,
): Promise<{ taxRuleId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const taxRuleId = createEntityId("hr_mcp_tax");

  await db
    .insert(hrMcpTaxRules)
    .values({
      id: taxRuleId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      code: input.code,
      name: input.name,
      referenceCode: input.referenceCode ?? null,
      ruleConfig: input.ruleConfig,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpTaxRules.organizationId,
        hrMcpTaxRules.countryConfigId,
        hrMcpTaxRules.code,
        hrMcpTaxRules.ruleVersionId,
      ],
      set: {
        name: input.name,
        referenceCode: input.referenceCode ?? null,
        ruleConfig: input.ruleConfig,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpTaxRules.id })
    .from(hrMcpTaxRules)
    .where(
      and(
        eq(hrMcpTaxRules.organizationId, input.organizationId),
        eq(hrMcpTaxRules.countryConfigId, input.countryConfigId),
        eq(hrMcpTaxRules.code, input.code),
        input.ruleVersionId
          ? eq(hrMcpTaxRules.ruleVersionId, input.ruleVersionId)
          : sql`${hrMcpTaxRules.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? taxRuleId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.tax_rule.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted tax rule ${input.code}`,
    metadata: { taxRuleId: resolvedId },
  });

  return { taxRuleId: resolvedId };
}

export async function listHrMcpTaxRules(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpTaxRules.organizationId, input.organizationId),
      eq(hrMcpTaxRules.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(eq(hrMcpTaxRules.ruleVersionId, input.ruleVersionId));
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpTaxRules.active, true));
    }

    return db
      .select()
      .from(hrMcpTaxRules)
      .where(and(...conditions))
      .orderBy(hrMcpTaxRules.code);
  });
}

export type UpsertHrMcpStatutoryContributionRuleInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  code: string;
  name: string;
  contributionType: string;
  ruleConfig: HrMcpRuleConfigPayload;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  referenceCode?: string | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpStatutoryContributionRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpStatutoryContributionRuleInput,
): Promise<{ statutoryRuleId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const statutoryRuleId = createEntityId("hr_mcp_stat");

  await db
    .insert(hrMcpStatutoryContributionRules)
    .values({
      id: statutoryRuleId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      code: input.code,
      name: input.name,
      contributionType: input.contributionType,
      referenceCode: input.referenceCode ?? null,
      ruleConfig: input.ruleConfig,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpStatutoryContributionRules.organizationId,
        hrMcpStatutoryContributionRules.countryConfigId,
        hrMcpStatutoryContributionRules.code,
        hrMcpStatutoryContributionRules.ruleVersionId,
      ],
      set: {
        name: input.name,
        contributionType: input.contributionType,
        referenceCode: input.referenceCode ?? null,
        ruleConfig: input.ruleConfig,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpStatutoryContributionRules.id })
    .from(hrMcpStatutoryContributionRules)
    .where(
      and(
        eq(hrMcpStatutoryContributionRules.organizationId, input.organizationId),
        eq(hrMcpStatutoryContributionRules.countryConfigId, input.countryConfigId),
        eq(hrMcpStatutoryContributionRules.code, input.code),
        input.ruleVersionId
          ? eq(
              hrMcpStatutoryContributionRules.ruleVersionId,
              input.ruleVersionId,
            )
          : sql`${hrMcpStatutoryContributionRules.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? statutoryRuleId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.statutory_rule.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted statutory rule ${input.code}`,
  });

  return { statutoryRuleId: resolvedId };
}

export async function listHrMcpStatutoryContributionRules(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpStatutoryContributionRules.organizationId, input.organizationId),
      eq(hrMcpStatutoryContributionRules.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(
        eq(hrMcpStatutoryContributionRules.ruleVersionId, input.ruleVersionId),
      );
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpStatutoryContributionRules.active, true));
    }

    return db
      .select()
      .from(hrMcpStatutoryContributionRules)
      .where(and(...conditions))
      .orderBy(hrMcpStatutoryContributionRules.code);
  });
}

export type UpsertHrMcpEmployerContributionRuleInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  code: string;
  name: string;
  contributionType: string;
  ruleConfig: HrMcpRuleConfigPayload;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  referenceCode?: string | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpEmployerContributionRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpEmployerContributionRuleInput,
): Promise<{ employerRuleId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const employerRuleId = createEntityId("hr_mcp_empr");

  await db
    .insert(hrMcpEmployerContributionRules)
    .values({
      id: employerRuleId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      code: input.code,
      name: input.name,
      contributionType: input.contributionType,
      referenceCode: input.referenceCode ?? null,
      ruleConfig: input.ruleConfig,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpEmployerContributionRules.organizationId,
        hrMcpEmployerContributionRules.countryConfigId,
        hrMcpEmployerContributionRules.code,
        hrMcpEmployerContributionRules.ruleVersionId,
      ],
      set: {
        name: input.name,
        contributionType: input.contributionType,
        referenceCode: input.referenceCode ?? null,
        ruleConfig: input.ruleConfig,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpEmployerContributionRules.id })
    .from(hrMcpEmployerContributionRules)
    .where(
      and(
        eq(hrMcpEmployerContributionRules.organizationId, input.organizationId),
        eq(hrMcpEmployerContributionRules.countryConfigId, input.countryConfigId),
        eq(hrMcpEmployerContributionRules.code, input.code),
        input.ruleVersionId
          ? eq(
              hrMcpEmployerContributionRules.ruleVersionId,
              input.ruleVersionId,
            )
          : sql`${hrMcpEmployerContributionRules.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? employerRuleId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.employer_rule.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted employer rule ${input.code}`,
  });

  return { employerRuleId: resolvedId };
}

export async function listHrMcpEmployerContributionRules(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpEmployerContributionRules.organizationId, input.organizationId),
      eq(hrMcpEmployerContributionRules.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(
        eq(hrMcpEmployerContributionRules.ruleVersionId, input.ruleVersionId),
      );
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpEmployerContributionRules.active, true));
    }

    return db
      .select()
      .from(hrMcpEmployerContributionRules)
      .where(and(...conditions))
      .orderBy(hrMcpEmployerContributionRules.code);
  });
}

// ---------------------------------------------------------------------------
// Pay component treatments (MCP-006/007)
// ---------------------------------------------------------------------------

export type UpsertHrMcpPayComponentTreatmentInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  payComponentCode: string;
  taxTreatment: (typeof hrMcpPayComponentTreatments.$inferInsert)["taxTreatment"];
  contributionTreatment: (typeof hrMcpPayComponentTreatments.$inferInsert)["contributionTreatment"];
  pensionTreatment: (typeof hrMcpPayComponentTreatments.$inferInsert)["pensionTreatment"];
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  payComponentName?: string | null;
  ruleConfig?: HrMcpRuleConfigPayload | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpPayComponentTreatmentInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpPayComponentTreatmentInput,
): Promise<{ treatmentId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const treatmentId = createEntityId("hr_mcp_paytx");

  await db
    .insert(hrMcpPayComponentTreatments)
    .values({
      id: treatmentId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      payComponentCode: input.payComponentCode,
      payComponentName: input.payComponentName ?? null,
      taxTreatment: input.taxTreatment,
      contributionTreatment: input.contributionTreatment,
      pensionTreatment: input.pensionTreatment,
      ruleConfig: input.ruleConfig ?? null,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpPayComponentTreatments.organizationId,
        hrMcpPayComponentTreatments.countryConfigId,
        hrMcpPayComponentTreatments.payComponentCode,
        hrMcpPayComponentTreatments.ruleVersionId,
      ],
      set: {
        payComponentName: input.payComponentName ?? null,
        taxTreatment: input.taxTreatment,
        contributionTreatment: input.contributionTreatment,
        pensionTreatment: input.pensionTreatment,
        ruleConfig: input.ruleConfig ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpPayComponentTreatments.id })
    .from(hrMcpPayComponentTreatments)
    .where(
      and(
        eq(hrMcpPayComponentTreatments.organizationId, input.organizationId),
        eq(hrMcpPayComponentTreatments.countryConfigId, input.countryConfigId),
        eq(hrMcpPayComponentTreatments.payComponentCode, input.payComponentCode),
        input.ruleVersionId
          ? eq(
              hrMcpPayComponentTreatments.ruleVersionId,
              input.ruleVersionId,
            )
          : sql`${hrMcpPayComponentTreatments.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? treatmentId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.pay_component_treatment.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted pay component treatment ${input.payComponentCode}`,
  });

  return { treatmentId: resolvedId };
}

export async function listHrMcpPayComponentTreatments(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpPayComponentTreatments.organizationId, input.organizationId),
      eq(hrMcpPayComponentTreatments.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(
        eq(hrMcpPayComponentTreatments.ruleVersionId, input.ruleVersionId),
      );
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpPayComponentTreatments.active, true));
    }

    return db
      .select()
      .from(hrMcpPayComponentTreatments)
      .where(and(...conditions))
      .orderBy(hrMcpPayComponentTreatments.payComponentCode);
  });
}

// ---------------------------------------------------------------------------
// Calendar / holidays / deadlines (MCP-010)
// ---------------------------------------------------------------------------

export async function listHrMcpPayrollCalendars(input: {
  organizationId: string;
  countryConfigId: string;
  calendarYear?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpPayrollCalendars.organizationId, input.organizationId),
      eq(hrMcpPayrollCalendars.countryConfigId, input.countryConfigId),
      eq(hrMcpPayrollCalendars.active, true),
    ];

    if (input.calendarYear !== undefined) {
      conditions.push(
        eq(hrMcpPayrollCalendars.calendarYear, input.calendarYear),
      );
    }

    return db
      .select()
      .from(hrMcpPayrollCalendars)
      .where(and(...conditions))
      .orderBy(hrMcpPayrollCalendars.code);
  });
}

export async function listHrMcpCalendarPeriods(input: {
  organizationId: string;
  calendarId: string;
  payDateFrom?: string;
  payDateTo?: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpCalendarPeriods.organizationId, input.organizationId),
      eq(hrMcpCalendarPeriods.calendarId, input.calendarId),
    ];

    if (input.payDateFrom) {
      conditions.push(gte(hrMcpCalendarPeriods.payDate, input.payDateFrom));
    }
    if (input.payDateTo) {
      conditions.push(lte(hrMcpCalendarPeriods.payDate, input.payDateTo));
    }

    return db
      .select()
      .from(hrMcpCalendarPeriods)
      .where(and(...conditions))
      .orderBy(hrMcpCalendarPeriods.payDate);
  });
}

export async function listHrMcpPublicHolidays(input: {
  organizationId: string;
  countryConfigId: string;
  holidayDateFrom?: string;
  holidayDateTo?: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpPublicHolidays.organizationId, input.organizationId),
      eq(hrMcpPublicHolidays.countryConfigId, input.countryConfigId),
    ];

    if (input.holidayDateFrom) {
      conditions.push(
        gte(hrMcpPublicHolidays.holidayDate, input.holidayDateFrom),
      );
    }
    if (input.holidayDateTo) {
      conditions.push(lte(hrMcpPublicHolidays.holidayDate, input.holidayDateTo));
    }

    return db
      .select()
      .from(hrMcpPublicHolidays)
      .where(and(...conditions))
      .orderBy(hrMcpPublicHolidays.holidayDate);
  });
}

export async function listHrMcpStatutoryDeadlines(input: {
  organizationId: string;
  countryConfigId: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpStatutoryDeadlines.organizationId, input.organizationId),
      eq(hrMcpStatutoryDeadlines.countryConfigId, input.countryConfigId),
    ];

    if (input.dueDateFrom) {
      conditions.push(gte(hrMcpStatutoryDeadlines.dueDate, input.dueDateFrom));
    }
    if (input.dueDateTo) {
      conditions.push(lte(hrMcpStatutoryDeadlines.dueDate, input.dueDateTo));
    }

    return db
      .select()
      .from(hrMcpStatutoryDeadlines)
      .where(and(...conditions))
      .orderBy(hrMcpStatutoryDeadlines.dueDate);
  });
}

// ---------------------------------------------------------------------------
// Finalized rule snapshots (MCP-024)
// ---------------------------------------------------------------------------

export type PersistHrMcpFinalizedRuleSnapshotInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  ruleVersionId: string;
  payrollRunRef: string;
  snapshot: HrMcpRuleVersionSnapshotPayload;
  legalEntitySetupId?: string | null;
  periodRef?: string | null;
};

export async function persistHrMcpFinalizedRuleSnapshotInTx(
  db: AfendaTransaction,
  input: PersistHrMcpFinalizedRuleSnapshotInput,
): Promise<{ snapshotId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  const version = await assertHrMcpRuleVersionExistsInTx(
    db,
    input.organizationId,
    input.ruleVersionId,
  );

  if (version.versionStatus !== "published") {
    throw new HrMcpCommandError(
      "rule_version_locked",
      "Only published rule versions may be snapshotted for finalized payroll",
    );
  }

  const snapshotId = createEntityId("hr_mcp_snap");

  await db
    .insert(hrMcpFinalizedRuleSnapshots)
    .values({
      id: snapshotId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      legalEntitySetupId: input.legalEntitySetupId ?? null,
      ruleVersionId: input.ruleVersionId,
      payrollRunRef: input.payrollRunRef,
      periodRef: input.periodRef ?? null,
      snapshot: input.snapshot,
      finalizedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        hrMcpFinalizedRuleSnapshots.organizationId,
        hrMcpFinalizedRuleSnapshots.payrollRunRef,
      ],
      set: {
        snapshot: input.snapshot,
        ruleVersionId: input.ruleVersionId,
        periodRef: input.periodRef ?? null,
        finalizedAt: new Date(),
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpFinalizedRuleSnapshots.id })
    .from(hrMcpFinalizedRuleSnapshots)
    .where(
      and(
        eq(hrMcpFinalizedRuleSnapshots.organizationId, input.organizationId),
        eq(hrMcpFinalizedRuleSnapshots.payrollRunRef, input.payrollRunRef),
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? snapshotId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.rule_snapshot.persist",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId,
    payrollRunRef: input.payrollRunRef,
    summary: `Persisted finalized rule snapshot for payroll run ${input.payrollRunRef}`,
  });

  return { snapshotId: resolvedId };
}

export async function lookupHrMcpFinalizedRuleSnapshot(input: {
  organizationId: string;
  payrollRunRef: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrMcpFinalizedRuleSnapshots)
      .where(
        and(
          eq(hrMcpFinalizedRuleSnapshots.organizationId, input.organizationId),
          eq(hrMcpFinalizedRuleSnapshots.payrollRunRef, input.payrollRunRef),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrMcpCommandError("snapshot_not_found");
    }

    return row;
  });
}

// ---------------------------------------------------------------------------
// Cross-country reporting foundation (MCP-026/027)
// ---------------------------------------------------------------------------

export async function listHrMcpCrossCountryCostAggregateWindow(input: {
  organizationId: string;
  periodRef: string;
  limit?: number;
  offset?: number;
  countryConfigId?: string;
  legalEntitySetupId?: string;
  currencyCode?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [period] = await db
      .select()
      .from(hrMcpCrossCountryReportPeriods)
      .where(
        and(
          eq(hrMcpCrossCountryReportPeriods.organizationId, input.organizationId),
          eq(hrMcpCrossCountryReportPeriods.periodRef, input.periodRef),
        ),
      )
      .limit(1);

    if (!period) {
      return buildPaginatedWindow({
        rows: [],
        pageSize,
        offset,
        totalCount: 0,
      });
    }

    const conditions = [
      eq(hrMcpCrossCountryCostLines.organizationId, input.organizationId),
      eq(hrMcpCrossCountryCostLines.reportPeriodId, period.id),
    ];

    if (input.countryConfigId) {
      conditions.push(
        eq(hrMcpCrossCountryCostLines.countryConfigId, input.countryConfigId),
      );
    }
    if (input.legalEntitySetupId) {
      conditions.push(
        eq(
          hrMcpCrossCountryCostLines.legalEntitySetupId,
          input.legalEntitySetupId,
        ),
      );
    }
    if (input.currencyCode) {
      conditions.push(
        eq(hrMcpCrossCountryCostLines.currencyCode, input.currencyCode),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpCrossCountryCostLines)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrMcpCrossCountryCostLines.id,
        countryConfigId: hrMcpCrossCountryCostLines.countryConfigId,
        legalEntitySetupId: hrMcpCrossCountryCostLines.legalEntitySetupId,
        payGroupCode: hrMcpCrossCountryCostLines.payGroupCode,
        currencyCode: hrMcpCrossCountryCostLines.currencyCode,
        employerCostTotal: hrMcpCrossCountryCostLines.employerCostTotal,
        headcount: hrMcpCrossCountryCostLines.headcount,
        countryCode: hrMcpCountryConfigs.countryCode,
        countryName: hrMcpCountryConfigs.name,
        legalEntityCode: hrMcpLegalEntitySetups.legalEntityCode,
      })
      .from(hrMcpCrossCountryCostLines)
      .innerJoin(
        hrMcpCountryConfigs,
        eq(hrMcpCrossCountryCostLines.countryConfigId, hrMcpCountryConfigs.id),
      )
      .leftJoin(
        hrMcpLegalEntitySetups,
        eq(
          hrMcpCrossCountryCostLines.legalEntitySetupId,
          hrMcpLegalEntitySetups.id,
        ),
      )
      .where(whereClause)
      .orderBy(
        hrMcpCountryConfigs.countryCode,
        hrMcpLegalEntitySetups.legalEntityCode,
      )
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

export async function listHrMcpCrossCountryReportingScopeWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpLegalEntitySetups.organizationId, input.organizationId),
    ];

    if (input.activeOnly) {
      conditions.push(eq(hrMcpLegalEntitySetups.active, true));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpLegalEntitySetups)
      .where(whereClause);

    const rows = await db
      .select({
        legalEntitySetupId: hrMcpLegalEntitySetups.id,
        legalEntityCode: hrMcpLegalEntitySetups.legalEntityCode,
        legalEntityName: hrMcpLegalEntitySetups.name,
        payGroupCode: hrMcpLegalEntitySetups.payGroupCode,
        countryConfigId: hrMcpCountryConfigs.id,
        countryCode: hrMcpCountryConfigs.countryCode,
        countryName: hrMcpCountryConfigs.name,
        payrollCurrencyCode: hrMcpCurrencyConfigs.payrollCurrencyCode,
        reportingCurrencyCode: hrMcpCurrencyConfigs.reportingCurrencyCode,
      })
      .from(hrMcpLegalEntitySetups)
      .innerJoin(
        hrMcpCountryConfigs,
        eq(hrMcpLegalEntitySetups.countryConfigId, hrMcpCountryConfigs.id),
      )
      .leftJoin(
        hrMcpCurrencyConfigs,
        and(
          eq(hrMcpCurrencyConfigs.organizationId, input.organizationId),
          eq(
            hrMcpCurrencyConfigs.legalEntitySetupId,
            hrMcpLegalEntitySetups.id,
          ),
        ),
      )
      .where(whereClause)
      .orderBy(
        hrMcpCountryConfigs.countryCode,
        hrMcpLegalEntitySetups.legalEntityCode,
      )
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

export type UpsertHrMcpEmployeeClassificationInput = {
  organizationId: string;
  actorUserId: string;
  employeeId: string;
  countryConfigId: string;
  taxResidency: (typeof hrMcpEmployeeClassifications.$inferInsert)["taxResidency"];
  workerCategory: (typeof hrMcpEmployeeClassifications.$inferInsert)["workerCategory"];
  statutoryEligibility?: (typeof hrMcpEmployeeClassifications.$inferInsert)["statutoryEligibility"];
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  legalEntitySetupId?: string | null;
};

export async function upsertHrMcpEmployeeClassificationInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpEmployeeClassificationInput,
): Promise<{ classificationId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrMcpCommandError("employee_not_found");
  }

  const classificationId = createEntityId("hr_mcp_class");

  await db.insert(hrMcpEmployeeClassifications).values({
    id: classificationId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    taxResidency: input.taxResidency,
    workerCategory: input.workerCategory,
    statutoryEligibility: input.statutoryEligibility ?? "pending",
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.employee_classification.upsert",
    countryConfigId: input.countryConfigId,
    employeeId: input.employeeId,
    summary: `Set employee classification for country payroll`,
  });

  return { classificationId };
}

export async function upsertHrMcpExchangeRateInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    fromCurrencyCode: string;
    toCurrencyCode: string;
    rate: number;
    rateDate: string;
    sourceReference?: string | null;
  },
): Promise<{ exchangeRateId: string }> {
  const exchangeRateId = createEntityId("hr_mcp_fx");

  await db
    .insert(hrMcpExchangeRates)
    .values({
      id: exchangeRateId,
      organizationId: input.organizationId,
      fromCurrencyCode: input.fromCurrencyCode,
      toCurrencyCode: input.toCurrencyCode,
      rate: formatNumeric(input.rate, 8),
      rateDate: input.rateDate,
      sourceReference: input.sourceReference ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpExchangeRates.organizationId,
        hrMcpExchangeRates.fromCurrencyCode,
        hrMcpExchangeRates.toCurrencyCode,
        hrMcpExchangeRates.rateDate,
      ],
      set: {
        rate: formatNumeric(input.rate, 8),
        sourceReference: input.sourceReference ?? null,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpExchangeRates.id })
    .from(hrMcpExchangeRates)
    .where(
      and(
        eq(hrMcpExchangeRates.organizationId, input.organizationId),
        eq(hrMcpExchangeRates.fromCurrencyCode, input.fromCurrencyCode),
        eq(hrMcpExchangeRates.toCurrencyCode, input.toCurrencyCode),
        eq(hrMcpExchangeRates.rateDate, input.rateDate),
      ),
    )
    .limit(1);

  return { exchangeRateId: existing?.id ?? exchangeRateId };
}

// ---------------------------------------------------------------------------
// Currency (MCP-008)
// ---------------------------------------------------------------------------

export type UpsertHrMcpCurrencyConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  payrollCurrencyCode: string;
  reportingCurrencyCode?: string | null;
  legalEntitySetupId?: string | null;
};

export async function upsertHrMcpCurrencyConfigInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpCurrencyConfigInput,
): Promise<{ currencyConfigId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  if (input.legalEntitySetupId) {
    await assertHrMcpLegalEntitySetupExistsInTx(
      db,
      input.organizationId,
      input.legalEntitySetupId,
    );
  }

  const currencyConfigId = createEntityId("hr_mcp_curr");

  await db
    .insert(hrMcpCurrencyConfigs)
    .values({
      id: currencyConfigId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      legalEntitySetupId: input.legalEntitySetupId ?? null,
      payrollCurrencyCode: input.payrollCurrencyCode,
      reportingCurrencyCode: input.reportingCurrencyCode ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpCurrencyConfigs.organizationId,
        hrMcpCurrencyConfigs.countryConfigId,
        hrMcpCurrencyConfigs.legalEntitySetupId,
      ],
      set: {
        payrollCurrencyCode: input.payrollCurrencyCode,
        reportingCurrencyCode: input.reportingCurrencyCode ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpCurrencyConfigs.id })
    .from(hrMcpCurrencyConfigs)
    .where(
      and(
        eq(hrMcpCurrencyConfigs.organizationId, input.organizationId),
        eq(hrMcpCurrencyConfigs.countryConfigId, input.countryConfigId),
        input.legalEntitySetupId
          ? eq(hrMcpCurrencyConfigs.legalEntitySetupId, input.legalEntitySetupId)
          : sql`${hrMcpCurrencyConfigs.legalEntitySetupId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? currencyConfigId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.currency_config.upsert",
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    summary: `Upserted payroll currency ${input.payrollCurrencyCode}`,
  });

  return { currencyConfigId: resolvedId };
}

export async function listHrMcpCurrencyConfigs(input: {
  organizationId: string;
  countryConfigId: string;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpCurrencyConfigs.organizationId, input.organizationId),
      eq(hrMcpCurrencyConfigs.countryConfigId, input.countryConfigId),
    ];

    if (input.activeOnly) {
      conditions.push(eq(hrMcpCurrencyConfigs.active, true));
    }

    return db
      .select()
      .from(hrMcpCurrencyConfigs)
      .where(and(...conditions))
      .orderBy(hrMcpCurrencyConfigs.payrollCurrencyCode);
  });
}

// ---------------------------------------------------------------------------
// Proration / overtime / leave (MCP-011/012/013)
// ---------------------------------------------------------------------------

export type UpsertHrMcpProrationRuleInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  scenario: (typeof hrMcpProrationRules.$inferInsert)["scenario"];
  basis: (typeof hrMcpProrationRules.$inferInsert)["basis"];
  ruleConfig: HrMcpRuleConfigPayload;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpProrationRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpProrationRuleInput,
): Promise<{ prorationRuleId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const prorationRuleId = createEntityId("hr_mcp_pror");

  await db
    .insert(hrMcpProrationRules)
    .values({
      id: prorationRuleId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      scenario: input.scenario,
      basis: input.basis,
      ruleConfig: input.ruleConfig,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpProrationRules.organizationId,
        hrMcpProrationRules.countryConfigId,
        hrMcpProrationRules.scenario,
        hrMcpProrationRules.ruleVersionId,
      ],
      set: {
        basis: input.basis,
        ruleConfig: input.ruleConfig,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpProrationRules.id })
    .from(hrMcpProrationRules)
    .where(
      and(
        eq(hrMcpProrationRules.organizationId, input.organizationId),
        eq(hrMcpProrationRules.countryConfigId, input.countryConfigId),
        eq(hrMcpProrationRules.scenario, input.scenario),
        input.ruleVersionId
          ? eq(hrMcpProrationRules.ruleVersionId, input.ruleVersionId)
          : sql`${hrMcpProrationRules.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? prorationRuleId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.proration_rule.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted proration rule ${input.scenario}`,
  });

  return { prorationRuleId: resolvedId };
}

export async function listHrMcpProrationRules(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpProrationRules.organizationId, input.organizationId),
      eq(hrMcpProrationRules.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(eq(hrMcpProrationRules.ruleVersionId, input.ruleVersionId));
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpProrationRules.active, true));
    }

    return db
      .select()
      .from(hrMcpProrationRules)
      .where(and(...conditions))
      .orderBy(hrMcpProrationRules.scenario);
  });
}

export type UpsertHrMcpOvertimeRuleInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  code: string;
  name: string;
  overtimeRateMultiplier: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  restDayRateMultiplier?: number | null;
  publicHolidayRateMultiplier?: number | null;
  maxWeeklyHours?: number | null;
  ruleConfig?: HrMcpRuleConfigPayload | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpOvertimeRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpOvertimeRuleInput,
): Promise<{ overtimeRuleId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const overtimeRuleId = createEntityId("hr_mcp_ot");

  await db
    .insert(hrMcpOvertimeRules)
    .values({
      id: overtimeRuleId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      code: input.code,
      name: input.name,
      overtimeRateMultiplier: formatNumeric(input.overtimeRateMultiplier, 4),
      restDayRateMultiplier:
        input.restDayRateMultiplier != null
          ? formatNumeric(input.restDayRateMultiplier, 4)
          : null,
      publicHolidayRateMultiplier:
        input.publicHolidayRateMultiplier != null
          ? formatNumeric(input.publicHolidayRateMultiplier, 4)
          : null,
      maxWeeklyHours:
        input.maxWeeklyHours != null
          ? formatNumeric(input.maxWeeklyHours, 2)
          : null,
      ruleConfig: input.ruleConfig ?? null,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpOvertimeRules.organizationId,
        hrMcpOvertimeRules.countryConfigId,
        hrMcpOvertimeRules.code,
        hrMcpOvertimeRules.ruleVersionId,
      ],
      set: {
        name: input.name,
        overtimeRateMultiplier: formatNumeric(input.overtimeRateMultiplier, 4),
        restDayRateMultiplier:
          input.restDayRateMultiplier != null
            ? formatNumeric(input.restDayRateMultiplier, 4)
            : null,
        publicHolidayRateMultiplier:
          input.publicHolidayRateMultiplier != null
            ? formatNumeric(input.publicHolidayRateMultiplier, 4)
            : null,
        maxWeeklyHours:
          input.maxWeeklyHours != null
            ? formatNumeric(input.maxWeeklyHours, 2)
            : null,
        ruleConfig: input.ruleConfig ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpOvertimeRules.id })
    .from(hrMcpOvertimeRules)
    .where(
      and(
        eq(hrMcpOvertimeRules.organizationId, input.organizationId),
        eq(hrMcpOvertimeRules.countryConfigId, input.countryConfigId),
        eq(hrMcpOvertimeRules.code, input.code),
        input.ruleVersionId
          ? eq(hrMcpOvertimeRules.ruleVersionId, input.ruleVersionId)
          : sql`${hrMcpOvertimeRules.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? overtimeRuleId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.overtime_rule.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted overtime rule ${input.code}`,
  });

  return { overtimeRuleId: resolvedId };
}

export async function listHrMcpOvertimeRules(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpOvertimeRules.organizationId, input.organizationId),
      eq(hrMcpOvertimeRules.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(eq(hrMcpOvertimeRules.ruleVersionId, input.ruleVersionId));
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpOvertimeRules.active, true));
    }

    return db
      .select()
      .from(hrMcpOvertimeRules)
      .where(and(...conditions))
      .orderBy(hrMcpOvertimeRules.code);
  });
}

export type UpsertHrMcpLeavePayrollTreatmentInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  leaveTypeCode: string;
  payrollImpact: (typeof hrMcpLeavePayrollTreatments.$inferInsert)["payrollImpact"];
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  leaveTypeName?: string | null;
  statutoryLeave?: boolean;
  ruleConfig?: HrMcpRuleConfigPayload | null;
  ruleVersionId?: string | null;
};

export async function upsertHrMcpLeavePayrollTreatmentInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpLeavePayrollTreatmentInput,
): Promise<{ leaveTreatmentId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );
  assertEffectiveDateRange(input.effectiveFrom, input.effectiveTo);

  const leaveTreatmentId = createEntityId("hr_mcp_leave");

  await db
    .insert(hrMcpLeavePayrollTreatments)
    .values({
      id: leaveTreatmentId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      ruleVersionId: input.ruleVersionId ?? null,
      leaveTypeCode: input.leaveTypeCode,
      leaveTypeName: input.leaveTypeName ?? null,
      payrollImpact: input.payrollImpact,
      statutoryLeave: input.statutoryLeave ?? false,
      ruleConfig: input.ruleConfig ?? null,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpLeavePayrollTreatments.organizationId,
        hrMcpLeavePayrollTreatments.countryConfigId,
        hrMcpLeavePayrollTreatments.leaveTypeCode,
        hrMcpLeavePayrollTreatments.ruleVersionId,
      ],
      set: {
        leaveTypeName: input.leaveTypeName ?? null,
        payrollImpact: input.payrollImpact,
        statutoryLeave: input.statutoryLeave ?? false,
        ruleConfig: input.ruleConfig ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpLeavePayrollTreatments.id })
    .from(hrMcpLeavePayrollTreatments)
    .where(
      and(
        eq(hrMcpLeavePayrollTreatments.organizationId, input.organizationId),
        eq(hrMcpLeavePayrollTreatments.countryConfigId, input.countryConfigId),
        eq(hrMcpLeavePayrollTreatments.leaveTypeCode, input.leaveTypeCode),
        input.ruleVersionId
          ? eq(
              hrMcpLeavePayrollTreatments.ruleVersionId,
              input.ruleVersionId,
            )
          : sql`${hrMcpLeavePayrollTreatments.ruleVersionId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? leaveTreatmentId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.leave_treatment.upsert",
    countryConfigId: input.countryConfigId,
    ruleVersionId: input.ruleVersionId ?? null,
    summary: `Upserted leave payroll treatment ${input.leaveTypeCode}`,
  });

  return { leaveTreatmentId: resolvedId };
}

export async function listHrMcpLeavePayrollTreatments(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionId?: string | null;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpLeavePayrollTreatments.organizationId, input.organizationId),
      eq(hrMcpLeavePayrollTreatments.countryConfigId, input.countryConfigId),
    ];

    if (input.ruleVersionId) {
      conditions.push(
        eq(hrMcpLeavePayrollTreatments.ruleVersionId, input.ruleVersionId),
      );
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpLeavePayrollTreatments.active, true));
    }

    return db
      .select()
      .from(hrMcpLeavePayrollTreatments)
      .where(and(...conditions))
      .orderBy(hrMcpLeavePayrollTreatments.leaveTypeCode);
  });
}

// ---------------------------------------------------------------------------
// Calendar mutations (MCP-010)
// ---------------------------------------------------------------------------

export type CreateHrMcpPayrollCalendarInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  code: string;
  name: string;
  periodKind: (typeof hrMcpPayrollCalendars.$inferInsert)["periodKind"];
  calendarYear: number;
  legalEntitySetupId?: string | null;
  payGroupCode?: string | null;
};

export async function createHrMcpPayrollCalendarInTx(
  db: AfendaTransaction,
  input: CreateHrMcpPayrollCalendarInput,
): Promise<{ calendarId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const calendarId = createEntityId("hr_mcp_cal");

  await db.insert(hrMcpPayrollCalendars).values({
    id: calendarId,
    organizationId: input.organizationId,
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    code: input.code,
    name: input.name,
    periodKind: input.periodKind,
    payGroupCode: input.payGroupCode ?? null,
    calendarYear: input.calendarYear,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.payroll_calendar.create",
    countryConfigId: input.countryConfigId,
    summary: `Created payroll calendar ${input.code} (${input.calendarYear})`,
  });

  return { calendarId };
}

export type CreateHrMcpCalendarPeriodInput = {
  organizationId: string;
  actorUserId: string;
  calendarId: string;
  periodCode: string;
  periodStart: string;
  periodEnd: string;
  cutoffDate: string;
  payDate: string;
};

export async function createHrMcpCalendarPeriodInTx(
  db: AfendaTransaction,
  input: CreateHrMcpCalendarPeriodInput,
): Promise<{ periodId: string }> {
  if (input.periodEnd < input.periodStart) {
    throw new HrMcpCommandError(
      "invalid_effective_range",
      "period_end must be on or after period_start",
    );
  }

  const periodId = createEntityId("hr_mcp_period");

  await db.insert(hrMcpCalendarPeriods).values({
    id: periodId,
    organizationId: input.organizationId,
    calendarId: input.calendarId,
    periodCode: input.periodCode,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    cutoffDate: input.cutoffDate,
    payDate: input.payDate,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.calendar_period.create",
    summary: `Created calendar period ${input.periodCode}`,
    metadata: { calendarId: input.calendarId, periodId },
  });

  return { periodId };
}

export type CreateHrMcpPublicHolidayInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  holidayDate: string;
  name: string;
  regionCode?: string | null;
  recurringAnnually?: boolean;
};

export async function createHrMcpPublicHolidayInTx(
  db: AfendaTransaction,
  input: CreateHrMcpPublicHolidayInput,
): Promise<{ holidayId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const holidayId = createEntityId("hr_mcp_hol");

  await db
    .insert(hrMcpPublicHolidays)
    .values({
      id: holidayId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      holidayDate: input.holidayDate,
      name: input.name,
      regionCode: input.regionCode ?? null,
      recurringAnnually: input.recurringAnnually ?? false,
    })
    .onConflictDoNothing();

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.public_holiday.create",
    countryConfigId: input.countryConfigId,
    summary: `Recorded public holiday ${input.name}`,
  });

  return { holidayId };
}

export type CreateHrMcpStatutoryDeadlineInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  deadlineKind: (typeof hrMcpStatutoryDeadlines.$inferInsert)["deadlineKind"];
  dueDate: string;
  periodRef?: string | null;
  description?: string | null;
};

export async function createHrMcpStatutoryDeadlineInTx(
  db: AfendaTransaction,
  input: CreateHrMcpStatutoryDeadlineInput,
): Promise<{ deadlineId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const deadlineId = createEntityId("hr_mcp_dead");

  await db.insert(hrMcpStatutoryDeadlines).values({
    id: deadlineId,
    organizationId: input.organizationId,
    countryConfigId: input.countryConfigId,
    deadlineKind: input.deadlineKind,
    dueDate: input.dueDate,
    periodRef: input.periodRef ?? null,
    description: input.description ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.statutory_deadline.create",
    countryConfigId: input.countryConfigId,
    summary: `Recorded statutory deadline ${input.deadlineKind}`,
  });

  return { deadlineId };
}

// ---------------------------------------------------------------------------
// Reports (MCP-017/018/019)
// ---------------------------------------------------------------------------

export type UpsertHrMcpReportConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  reportKind: (typeof hrMcpReportConfigs.$inferInsert)["reportKind"];
  code: string;
  name: string;
  config: HrMcpRuleConfigPayload;
  templateReference?: string | null;
};

export async function upsertHrMcpReportConfigInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpReportConfigInput,
): Promise<{ reportConfigId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const reportConfigId = createEntityId("hr_mcp_rptcfg");

  await db
    .insert(hrMcpReportConfigs)
    .values({
      id: reportConfigId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      reportKind: input.reportKind,
      code: input.code,
      name: input.name,
      templateReference: input.templateReference ?? null,
      config: input.config,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpReportConfigs.organizationId,
        hrMcpReportConfigs.countryConfigId,
        hrMcpReportConfigs.reportKind,
        hrMcpReportConfigs.code,
      ],
      set: {
        name: input.name,
        templateReference: input.templateReference ?? null,
        config: input.config,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpReportConfigs.id })
    .from(hrMcpReportConfigs)
    .where(
      and(
        eq(hrMcpReportConfigs.organizationId, input.organizationId),
        eq(hrMcpReportConfigs.countryConfigId, input.countryConfigId),
        eq(hrMcpReportConfigs.reportKind, input.reportKind),
        eq(hrMcpReportConfigs.code, input.code),
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? reportConfigId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.report_config.upsert",
    countryConfigId: input.countryConfigId,
    summary: `Upserted ${input.reportKind} report config ${input.code}`,
  });

  return { reportConfigId: resolvedId };
}

export async function listHrMcpReportConfigs(input: {
  organizationId: string;
  countryConfigId: string;
  reportKind?: (typeof hrMcpReportConfigs.$inferSelect)["reportKind"];
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpReportConfigs.organizationId, input.organizationId),
      eq(hrMcpReportConfigs.countryConfigId, input.countryConfigId),
    ];

    if (input.reportKind) {
      conditions.push(eq(hrMcpReportConfigs.reportKind, input.reportKind));
    }
    if (input.activeOnly) {
      conditions.push(eq(hrMcpReportConfigs.active, true));
    }

    return db
      .select()
      .from(hrMcpReportConfigs)
      .where(and(...conditions))
      .orderBy(hrMcpReportConfigs.reportKind, hrMcpReportConfigs.code);
  });
}

export type RecordHrMcpReportGenerationInput = {
  organizationId: string;
  actorUserId: string;
  reportConfigId: string;
  periodRef: string;
  generationStatus?: (typeof hrMcpReportGenerations.$inferInsert)["generationStatus"];
  outputReference?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function recordHrMcpReportGenerationInTx(
  db: AfendaTransaction,
  input: RecordHrMcpReportGenerationInput,
): Promise<{ generationId: string }> {
  const [config] = await db
    .select()
    .from(hrMcpReportConfigs)
    .where(
      and(
        eq(hrMcpReportConfigs.organizationId, input.organizationId),
        eq(hrMcpReportConfigs.id, input.reportConfigId),
      ),
    )
    .limit(1);

  if (!config) {
    throw new HrMcpCommandError("report_config_not_found");
  }

  const generationId = createEntityId("hr_mcp_rptgen");
  const status = input.generationStatus ?? "completed";

  await db.insert(hrMcpReportGenerations).values({
    id: generationId,
    organizationId: input.organizationId,
    reportConfigId: input.reportConfigId,
    periodRef: input.periodRef,
    generationStatus: status,
    outputReference: input.outputReference ?? null,
    generatedAt: status === "completed" ? new Date() : null,
    generatedByUserId: input.actorUserId,
    metadata: input.metadata ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.report_generation.record",
    countryConfigId: config.countryConfigId,
    summary: `Recorded ${config.reportKind} report generation for ${input.periodRef}`,
    metadata: { reportConfigId: input.reportConfigId, generationId },
  });

  return { generationId };
}

export async function listHrMcpReportGenerationsWindow(input: {
  organizationId: string;
  reportConfigId?: string;
  countryConfigId?: string;
  limit?: number;
  offset?: number;
  generationStatus?: (typeof hrMcpReportGenerations.$inferSelect)["generationStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpReportGenerations.organizationId, input.organizationId),
    ];

    if (input.reportConfigId) {
      conditions.push(
        eq(hrMcpReportGenerations.reportConfigId, input.reportConfigId),
      );
    }
    if (input.generationStatus) {
      conditions.push(
        eq(hrMcpReportGenerations.generationStatus, input.generationStatus),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrMcpReportGenerations)
      .innerJoin(
        hrMcpReportConfigs,
        eq(hrMcpReportGenerations.reportConfigId, hrMcpReportConfigs.id),
      )
      .where(
        input.countryConfigId
          ? and(
              whereClause,
              eq(hrMcpReportConfigs.countryConfigId, input.countryConfigId),
            )
          : whereClause,
      );

    const rows = await db
      .select({
        id: hrMcpReportGenerations.id,
        reportConfigId: hrMcpReportGenerations.reportConfigId,
        periodRef: hrMcpReportGenerations.periodRef,
        generationStatus: hrMcpReportGenerations.generationStatus,
        outputReference: hrMcpReportGenerations.outputReference,
        generatedAt: hrMcpReportGenerations.generatedAt,
        reportKind: hrMcpReportConfigs.reportKind,
        reportCode: hrMcpReportConfigs.code,
      })
      .from(hrMcpReportGenerations)
      .innerJoin(
        hrMcpReportConfigs,
        eq(hrMcpReportGenerations.reportConfigId, hrMcpReportConfigs.id),
      )
      .where(
        input.countryConfigId
          ? and(
              whereClause,
              eq(hrMcpReportConfigs.countryConfigId, input.countryConfigId),
            )
          : whereClause,
      )
      .orderBy(desc(hrMcpReportGenerations.generatedAt))
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

// ---------------------------------------------------------------------------
// Payslip & export formats (MCP-020/021/022)
// ---------------------------------------------------------------------------

export type UpsertHrMcpPayslipFieldConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  fieldKey: string;
  label: string;
  required?: boolean;
  displayOrder?: number;
  statutoryBreakdown?: boolean;
};

export async function upsertHrMcpPayslipFieldConfigInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpPayslipFieldConfigInput,
): Promise<{ fieldConfigId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const fieldConfigId = createEntityId("hr_mcp_pslip");

  await db
    .insert(hrMcpPayslipFieldConfigs)
    .values({
      id: fieldConfigId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      fieldKey: input.fieldKey,
      label: input.label,
      required: input.required ?? false,
      displayOrder: input.displayOrder ?? 0,
      statutoryBreakdown: input.statutoryBreakdown ?? false,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpPayslipFieldConfigs.organizationId,
        hrMcpPayslipFieldConfigs.countryConfigId,
        hrMcpPayslipFieldConfigs.fieldKey,
      ],
      set: {
        label: input.label,
        required: input.required ?? false,
        displayOrder: input.displayOrder ?? 0,
        statutoryBreakdown: input.statutoryBreakdown ?? false,
        active: true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpPayslipFieldConfigs.id })
    .from(hrMcpPayslipFieldConfigs)
    .where(
      and(
        eq(hrMcpPayslipFieldConfigs.organizationId, input.organizationId),
        eq(hrMcpPayslipFieldConfigs.countryConfigId, input.countryConfigId),
        eq(hrMcpPayslipFieldConfigs.fieldKey, input.fieldKey),
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? fieldConfigId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.payslip_field.upsert",
    countryConfigId: input.countryConfigId,
    summary: `Upserted payslip field ${input.fieldKey}`,
  });

  return { fieldConfigId: resolvedId };
}

export async function listHrMcpPayslipFieldConfigs(input: {
  organizationId: string;
  countryConfigId: string;
  activeOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpPayslipFieldConfigs.organizationId, input.organizationId),
      eq(hrMcpPayslipFieldConfigs.countryConfigId, input.countryConfigId),
    ];

    if (input.activeOnly) {
      conditions.push(eq(hrMcpPayslipFieldConfigs.active, true));
    }

    return db
      .select()
      .from(hrMcpPayslipFieldConfigs)
      .where(and(...conditions))
      .orderBy(hrMcpPayslipFieldConfigs.displayOrder);
  });
}

export type UpsertHrMcpBankExportConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  formatCode: string;
  name: string;
  config: HrMcpExportFormatConfig;
  legalEntitySetupId?: string | null;
  enabled?: boolean;
};

export async function upsertHrMcpBankExportConfigInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpBankExportConfigInput,
): Promise<{ bankExportConfigId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const bankExportConfigId = createEntityId("hr_mcp_bank");

  await db
    .insert(hrMcpBankExportConfigs)
    .values({
      id: bankExportConfigId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      legalEntitySetupId: input.legalEntitySetupId ?? null,
      formatCode: input.formatCode,
      name: input.name,
      formatKind: "bank_payment",
      config: input.config,
      enabled: input.enabled ?? true,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpBankExportConfigs.organizationId,
        hrMcpBankExportConfigs.countryConfigId,
        hrMcpBankExportConfigs.formatCode,
        hrMcpBankExportConfigs.legalEntitySetupId,
      ],
      set: {
        name: input.name,
        config: input.config,
        enabled: input.enabled ?? true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpBankExportConfigs.id })
    .from(hrMcpBankExportConfigs)
    .where(
      and(
        eq(hrMcpBankExportConfigs.organizationId, input.organizationId),
        eq(hrMcpBankExportConfigs.countryConfigId, input.countryConfigId),
        eq(hrMcpBankExportConfigs.formatCode, input.formatCode),
        input.legalEntitySetupId
          ? eq(
              hrMcpBankExportConfigs.legalEntitySetupId,
              input.legalEntitySetupId,
            )
          : sql`${hrMcpBankExportConfigs.legalEntitySetupId} is null`,
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? bankExportConfigId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.bank_export.upsert",
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    summary: `Upserted bank export format ${input.formatCode}`,
  });

  return { bankExportConfigId: resolvedId };
}

export async function listHrMcpBankExportConfigs(input: {
  organizationId: string;
  countryConfigId: string;
  enabledOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpBankExportConfigs.organizationId, input.organizationId),
      eq(hrMcpBankExportConfigs.countryConfigId, input.countryConfigId),
    ];

    if (input.enabledOnly) {
      conditions.push(eq(hrMcpBankExportConfigs.enabled, true));
    }

    return db
      .select()
      .from(hrMcpBankExportConfigs)
      .where(and(...conditions))
      .orderBy(hrMcpBankExportConfigs.formatCode);
  });
}

export type UpsertHrMcpVendorExportConfigInput = {
  organizationId: string;
  actorUserId: string;
  countryConfigId: string;
  vendorCode: string;
  formatCode: string;
  name: string;
  formatKind: (typeof hrMcpVendorExportConfigs.$inferInsert)["formatKind"];
  config: HrMcpExportFormatConfig;
  enabled?: boolean;
};

export async function upsertHrMcpVendorExportConfigInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpVendorExportConfigInput,
): Promise<{ vendorExportConfigId: string }> {
  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const vendorExportConfigId = createEntityId("hr_mcp_vend");

  await db
    .insert(hrMcpVendorExportConfigs)
    .values({
      id: vendorExportConfigId,
      organizationId: input.organizationId,
      countryConfigId: input.countryConfigId,
      vendorCode: input.vendorCode,
      formatCode: input.formatCode,
      name: input.name,
      formatKind: input.formatKind,
      config: input.config,
      enabled: input.enabled ?? true,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpVendorExportConfigs.organizationId,
        hrMcpVendorExportConfigs.countryConfigId,
        hrMcpVendorExportConfigs.vendorCode,
        hrMcpVendorExportConfigs.formatCode,
      ],
      set: {
        name: input.name,
        formatKind: input.formatKind,
        config: input.config,
        enabled: input.enabled ?? true,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpVendorExportConfigs.id })
    .from(hrMcpVendorExportConfigs)
    .where(
      and(
        eq(hrMcpVendorExportConfigs.organizationId, input.organizationId),
        eq(hrMcpVendorExportConfigs.countryConfigId, input.countryConfigId),
        eq(hrMcpVendorExportConfigs.vendorCode, input.vendorCode),
        eq(hrMcpVendorExportConfigs.formatCode, input.formatCode),
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? vendorExportConfigId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.vendor_export.upsert",
    countryConfigId: input.countryConfigId,
    summary: `Upserted vendor export ${input.vendorCode}/${input.formatCode}`,
  });

  return { vendorExportConfigId: resolvedId };
}

export async function listHrMcpVendorExportConfigs(input: {
  organizationId: string;
  countryConfigId: string;
  formatKind?: (typeof hrMcpVendorExportConfigs.$inferSelect)["formatKind"];
  enabledOnly?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpVendorExportConfigs.organizationId, input.organizationId),
      eq(hrMcpVendorExportConfigs.countryConfigId, input.countryConfigId),
    ];

    if (input.formatKind) {
      conditions.push(eq(hrMcpVendorExportConfigs.formatKind, input.formatKind));
    }
    if (input.enabledOnly) {
      conditions.push(eq(hrMcpVendorExportConfigs.enabled, true));
    }

    return db
      .select()
      .from(hrMcpVendorExportConfigs)
      .where(and(...conditions))
      .orderBy(hrMcpVendorExportConfigs.vendorCode);
  });
}

// ---------------------------------------------------------------------------
// Cross-country cost persistence (MCP-026/027)
// ---------------------------------------------------------------------------

export type UpsertHrMcpCrossCountryReportPeriodInput = {
  organizationId: string;
  actorUserId: string;
  periodRef: string;
  periodStart: string;
  periodEnd: string;
  reportingCurrencyCode: string;
};

export async function upsertHrMcpCrossCountryReportPeriodInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpCrossCountryReportPeriodInput,
): Promise<{ reportPeriodId: string }> {
  if (input.periodEnd < input.periodStart) {
    throw new HrMcpCommandError(
      "invalid_effective_range",
      "period_end must be on or after period_start",
    );
  }

  const reportPeriodId = createEntityId("hr_mcp_ccper");

  await db
    .insert(hrMcpCrossCountryReportPeriods)
    .values({
      id: reportPeriodId,
      organizationId: input.organizationId,
      periodRef: input.periodRef,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      reportingCurrencyCode: input.reportingCurrencyCode,
    })
    .onConflictDoUpdate({
      target: [
        hrMcpCrossCountryReportPeriods.organizationId,
        hrMcpCrossCountryReportPeriods.periodRef,
      ],
      set: {
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        reportingCurrencyCode: input.reportingCurrencyCode,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrMcpCrossCountryReportPeriods.id })
    .from(hrMcpCrossCountryReportPeriods)
    .where(
      and(
        eq(hrMcpCrossCountryReportPeriods.organizationId, input.organizationId),
        eq(hrMcpCrossCountryReportPeriods.periodRef, input.periodRef),
      ),
    )
    .limit(1);

  const resolvedId = existing?.id ?? reportPeriodId;

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.cross_country_period.upsert",
    summary: `Upserted cross-country report period ${input.periodRef}`,
  });

  return { reportPeriodId: resolvedId };
}

export type UpsertHrMcpCrossCountryCostLineInput = {
  organizationId: string;
  actorUserId: string;
  periodRef: string;
  countryConfigId: string;
  currencyCode: string;
  employerCostTotal: number;
  headcount?: number;
  legalEntitySetupId?: string | null;
  payGroupCode?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function upsertHrMcpCrossCountryCostLineInTx(
  db: AfendaTransaction,
  input: UpsertHrMcpCrossCountryCostLineInput,
): Promise<{ costLineId: string }> {
  const [period] = await db
    .select({ id: hrMcpCrossCountryReportPeriods.id })
    .from(hrMcpCrossCountryReportPeriods)
    .where(
      and(
        eq(hrMcpCrossCountryReportPeriods.organizationId, input.organizationId),
        eq(hrMcpCrossCountryReportPeriods.periodRef, input.periodRef),
      ),
    )
    .limit(1);

  if (!period) {
    throw new HrMcpCommandError(
      "country_config_not_found",
      `Cross-country report period ${input.periodRef} not found`,
    );
  }

  await assertHrMcpCountryConfigExistsInTx(
    db,
    input.organizationId,
    input.countryConfigId,
  );

  const costLineId = createEntityId("hr_mcp_ccost");

  await db.insert(hrMcpCrossCountryCostLines).values({
    id: costLineId,
    organizationId: input.organizationId,
    reportPeriodId: period.id,
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    payGroupCode: input.payGroupCode ?? null,
    currencyCode: input.currencyCode,
    employerCostTotal: formatNumeric(input.employerCostTotal, 2),
    headcount: input.headcount ?? 0,
    metadata: input.metadata ?? null,
  });

  await appendHrMcpAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.mcp.cross_country_cost.upsert",
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId ?? null,
    summary: `Recorded cross-country cost line for ${input.periodRef}`,
    metadata: { costLineId, currencyCode: input.currencyCode },
  });

  return { costLineId };
}

export async function listHrMcpEmployeeClassifications(input: {
  organizationId: string;
  employeeId?: string;
  countryConfigId?: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpEmployeeClassifications.organizationId, input.organizationId),
    ];

    if (input.employeeId) {
      conditions.push(
        eq(hrMcpEmployeeClassifications.employeeId, input.employeeId),
      );
    }
    if (input.countryConfigId) {
      conditions.push(
        eq(hrMcpEmployeeClassifications.countryConfigId, input.countryConfigId),
      );
    }

    return db
      .select()
      .from(hrMcpEmployeeClassifications)
      .where(and(...conditions))
      .orderBy(desc(hrMcpEmployeeClassifications.effectiveFrom));
  });
}

export async function listHrMcpExchangeRates(input: {
  organizationId: string;
  fromCurrencyCode?: string;
  toCurrencyCode?: string;
  rateDateFrom?: string;
  rateDateTo?: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrMcpExchangeRates.organizationId, input.organizationId),
    ];

    if (input.fromCurrencyCode) {
      conditions.push(
        eq(hrMcpExchangeRates.fromCurrencyCode, input.fromCurrencyCode),
      );
    }
    if (input.toCurrencyCode) {
      conditions.push(eq(hrMcpExchangeRates.toCurrencyCode, input.toCurrencyCode));
    }
    if (input.rateDateFrom) {
      conditions.push(gte(hrMcpExchangeRates.rateDate, input.rateDateFrom));
    }
    if (input.rateDateTo) {
      conditions.push(lte(hrMcpExchangeRates.rateDate, input.rateDateTo));
    }

    return db
      .select()
      .from(hrMcpExchangeRates)
      .where(and(...conditions))
      .orderBy(desc(hrMcpExchangeRates.rateDate));
  });
}

