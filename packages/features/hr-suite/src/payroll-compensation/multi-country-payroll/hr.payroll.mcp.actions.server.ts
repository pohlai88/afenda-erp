"use server";

import { runWithOrganizationContext } from "@afenda/db";

import { buildHrMcpCrossCountryCostReportCsv } from "./hr.payroll.mcp-cross-country-reports.shared";
import { buildHrMcpRuleVersionSnapshotPayload } from "./hr.payroll.mcp-rule-versioning.shared";
import {
  requireHrMcpRead,
  requireHrMcpWrite,
} from "./hr.payroll.mcp-access.policy.server";
import {
  assertHrMcpStatutoryRuleModificationAllowed,
  requireHrMcpStatutoryAdmin,
} from "./hr.payroll.mcp-statutory-admin.policy.server";
import {
  hrMcpCreateCountryConfigSchema,
  hrMcpCreateRuleVersionSchema,
  hrMcpCrossCountryReportFilterSchema,
  hrMcpPersistFinalizedSnapshotSchema,
  hrMcpPublishRuleVersionSchema,
} from "./hr.payroll.mcp-mutation.schema";
import {
  hrMcpUpsertCountryConfigSchema,
} from "./hr.payroll.mcp-country-config.schema";
import {
  hrMcpUpsertEmployeeClassificationSchema,
} from "./hr.payroll.mcp-employee-classification.schema";
import {
  hrMcpUpsertLegalEntitySetupSchema,
} from "./hr.payroll.mcp-legal-entity.schema";
import {
  hrMcpUpsertPayComponentTreatmentSchema,
} from "./hr.payroll.mcp-pay-component.schema";
import {
  hrMcpUpsertEmployerContributionRuleSchema,
  hrMcpUpsertStatutoryContributionRuleSchema,
  hrMcpUpsertTaxRuleSchema,
} from "./hr.payroll.mcp-tax-statutory.schema";
import { finalizeHrMcpMutation } from "./hr.payroll.mcp.mutation.shared.server";

export async function createCountryConfigAction(input: unknown) {
  const guard = await requireHrMcpWrite();
  const parsed = hrMcpCreateCountryConfigSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrMcpCountryConfigInTx } = await import("@afenda/db");
    return createHrMcpCountryConfigInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryCode: parsed.countryCode,
      name: parsed.name,
      defaultCurrencyCode: parsed.defaultCurrencyCode,
      defaultLocale: parsed.defaultLocale ?? null,
    });
  });
}

export async function upsertCountryConfigAction(input: unknown) {
  const guard = await requireHrMcpWrite();
  const parsed = hrMcpUpsertCountryConfigSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrMcpCountryConfigInTx } = await import("@afenda/db");
    return createHrMcpCountryConfigInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryCode: parsed.countryCode,
      name: parsed.name,
      defaultCurrencyCode: parsed.defaultCurrencyCode,
      defaultLocale: parsed.defaultLocale ?? null,
      settings: parsed.settings ?? null,
    });
  });
}

export async function upsertLegalEntitySetupAction(input: unknown) {
  const guard = await requireHrMcpWrite();
  const parsed = hrMcpUpsertLegalEntitySetupSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrMcpLegalEntitySetupInTx } = await import("@afenda/db");
    return createHrMcpLegalEntitySetupInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      legalEntityCode: parsed.legalEntityCode,
      name: parsed.name,
      registrationNumber: parsed.registrationNumber ?? null,
      statutoryEmployerAccount: parsed.statutoryEmployerAccount ?? null,
      payrollCountryCode: parsed.payrollCountryCode,
      payGroupCode: parsed.payGroupCode ?? null,
    });
  });
}

export async function upsertTaxRuleAction(input: unknown) {
  const guard = await requireHrMcpStatutoryAdmin();
  assertHrMcpStatutoryRuleModificationAllowed(guard);
  const parsed = hrMcpUpsertTaxRuleSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrMcpTaxRuleInTx } = await import("@afenda/db");
    return upsertHrMcpTaxRuleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      code: parsed.code,
      name: parsed.name,
      ruleConfig: parsed.ruleConfig,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo ?? null,
      referenceCode: parsed.referenceCode ?? null,
      ruleVersionId: parsed.ruleVersionId ?? null,
    });
  });
}

export async function upsertStatutoryContributionRuleAction(input: unknown) {
  const guard = await requireHrMcpStatutoryAdmin();
  assertHrMcpStatutoryRuleModificationAllowed(guard);
  const parsed = hrMcpUpsertStatutoryContributionRuleSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrMcpStatutoryContributionRuleInTx } = await import("@afenda/db");
    return upsertHrMcpStatutoryContributionRuleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      code: parsed.code,
      name: parsed.name,
      contributionType: parsed.contributionType,
      ruleConfig: parsed.ruleConfig,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo ?? null,
      referenceCode: parsed.referenceCode ?? null,
      ruleVersionId: parsed.ruleVersionId ?? null,
    });
  });
}

export async function upsertEmployerContributionRuleAction(input: unknown) {
  const guard = await requireHrMcpStatutoryAdmin();
  assertHrMcpStatutoryRuleModificationAllowed(guard);
  const parsed = hrMcpUpsertEmployerContributionRuleSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrMcpEmployerContributionRuleInTx } = await import("@afenda/db");
    return upsertHrMcpEmployerContributionRuleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      code: parsed.code,
      name: parsed.name,
      contributionType: parsed.contributionType,
      ruleConfig: parsed.ruleConfig,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo ?? null,
      referenceCode: parsed.referenceCode ?? null,
      ruleVersionId: parsed.ruleVersionId ?? null,
    });
  });
}

export async function upsertPayComponentTreatmentAction(input: unknown) {
  const guard = await requireHrMcpStatutoryAdmin();
  assertHrMcpStatutoryRuleModificationAllowed(guard);
  const parsed = hrMcpUpsertPayComponentTreatmentSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrMcpPayComponentTreatmentInTx } = await import("@afenda/db");
    return upsertHrMcpPayComponentTreatmentInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      payComponentCode: parsed.payComponentCode,
      payComponentName: parsed.payComponentName,
      taxTreatment: parsed.taxTreatment,
      contributionTreatment: parsed.contributionTreatment,
      pensionTreatment: parsed.pensionTreatment,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo ?? null,
      ruleVersionId: parsed.ruleVersionId ?? null,
    });
  });
}

export async function upsertEmployeeClassificationAction(input: unknown) {
  const guard = await requireHrMcpWrite();
  const parsed = hrMcpUpsertEmployeeClassificationSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrMcpEmployeeClassificationInTx } = await import("@afenda/db");
    return upsertHrMcpEmployeeClassificationInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      employeeId: parsed.employeeId,
      countryConfigId: parsed.countryConfigId,
      legalEntitySetupId: parsed.legalEntitySetupId ?? null,
      taxResidency: parsed.taxResidency,
      workerCategory: parsed.workerCategory,
      statutoryEligibility: parsed.statutoryEligibility,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo ?? null,
    });
  });
}

export async function createRuleVersionAction(input: unknown) {
  const guard = await requireHrMcpStatutoryAdmin();
  assertHrMcpStatutoryRuleModificationAllowed(guard);
  const parsed = hrMcpCreateRuleVersionSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrMcpRuleVersionInTx } = await import("@afenda/db");
    return createHrMcpRuleVersionInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo ?? null,
      notes: parsed.notes ?? null,
    });
  });
}

export async function publishRuleVersionAction(input: unknown) {
  const guard = await requireHrMcpStatutoryAdmin();
  assertHrMcpStatutoryRuleModificationAllowed(guard);
  const parsed = hrMcpPublishRuleVersionSchema.parse(input);

  return finalizeHrMcpMutation(async () => {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      const { publishHrMcpRuleVersionInTx } = await import("@afenda/db");
      await publishHrMcpRuleVersionInTx(db, {
        organizationId: guard.organization.id,
        actorUserId: guard.session.id,
        ruleVersionId: parsed.ruleVersionId,
      });
    });
  });
}

export async function persistFinalizedRuleSnapshotAction(input: unknown) {
  const guard = await requireHrMcpWrite();
  const parsed = hrMcpPersistFinalizedSnapshotSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { persistHrMcpFinalizedRuleSnapshotInTx } = await import("@afenda/db");
    return persistHrMcpFinalizedRuleSnapshotInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      countryConfigId: parsed.countryConfigId,
      ruleVersionId: parsed.ruleVersionId,
      payrollRunRef: parsed.payrollRunRef,
      periodRef: parsed.periodRef ?? null,
      legalEntitySetupId: parsed.legalEntitySetupId ?? null,
      snapshot: buildHrMcpRuleVersionSnapshotPayload(parsed.snapshot),
    });
  });
}

export async function exportCrossCountryCostReportAction(input: unknown) {
  const guard = await requireHrMcpRead();
  const parsed = hrMcpCrossCountryReportFilterSchema.parse(input);

  const window = await (async () => {
    const { listHrMcpCrossCountryCostAggregateWindow } = await import("@afenda/db");
    return listHrMcpCrossCountryCostAggregateWindow({
      organizationId: guard.organization.id,
      periodRef: parsed.periodRef,
      countryConfigId: parsed.countryConfigId,
      legalEntitySetupId: parsed.legalEntitySetupId,
      currencyCode: parsed.currencyCode,
    });
  })();

  const csv = buildHrMcpCrossCountryCostReportCsv({
    periodRef: parsed.periodRef,
    rows: window.rows,
  });

  await runWithOrganizationContext(guard.organization.id, async (db) => {
    const { appendHrMcpAuditEventInTx } = await import("@afenda/db");
    await appendHrMcpAuditEventInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      action: "hr.mcp.cross_country.export",
      summary: `Exported cross-country payroll cost report for ${parsed.periodRef}`,
      metadata: {
        periodRef: parsed.periodRef,
        rowCount: window.rows.length,
      },
    });
  });

  return { csv, rowCount: window.rows.length };
}

export async function listCountryConfigsAction(input?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrMcpRead();
  const { listHrMcpCountryConfigsWindow } = await import("@afenda/db");
  return listHrMcpCountryConfigsWindow({
    organizationId: guard.organization.id,
    search: input?.search,
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function listRuleVersionsAction(input: {
  countryConfigId: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrMcpRead();
  const { listHrMcpRuleVersionsWindow } = await import("@afenda/db");
  return listHrMcpRuleVersionsWindow({
    organizationId: guard.organization.id,
    countryConfigId: input.countryConfigId,
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function listMcpAuditTrailAction(input?: {
  search?: string;
  countryConfigId?: string;
  legalEntitySetupId?: string;
  ruleVersionId?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrMcpRead();
  const { listHrMcpAuditTrailWindow } = await import("@afenda/db");
  return listHrMcpAuditTrailWindow({
    organizationId: guard.organization.id,
    search: input?.search,
    countryConfigId: input?.countryConfigId,
    legalEntitySetupId: input?.legalEntitySetupId,
    ruleVersionId: input?.ruleVersionId,
    limit: input?.limit,
    offset: input?.offset,
  });
}
