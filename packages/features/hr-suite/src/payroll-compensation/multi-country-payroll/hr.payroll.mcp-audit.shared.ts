import {
  HR_MCP_AUDIT_ACTION_VALUES,
  hrPayrollMcpAuditActions,
  type HrPayrollMcpAuditAction,
} from "./hr.payroll.mcp.event";
import { formatRuleVersionStatusLabel } from "./hr.payroll.mcp-rule-versioning.shared";

export type HrMcpAuditTrailRow = {
  readonly id: string;
  readonly action: string;
  readonly summary: string | null;
  readonly occurredAt: Date;
  readonly actorUserId: string;
  readonly countryConfigId: string | null;
  readonly legalEntitySetupId: string | null;
  readonly ruleVersionId: string | null;
  readonly payrollRunRef: string | null;
};

export type HrMcpAuditTrailDisplayRow = HrMcpAuditTrailRow & {
  readonly actionLabel: string;
  readonly occurredAtLabel: string;
};

const MCP_AUDIT_ACTION_LABELS: Record<HrPayrollMcpAuditAction, string> = {
  [hrPayrollMcpAuditActions.countryConfig.created]: "Country config created",
  [hrPayrollMcpAuditActions.countryConfig.updated]: "Country config updated",
  [hrPayrollMcpAuditActions.legalEntity.created]: "Legal entity setup created",
  [hrPayrollMcpAuditActions.legalEntity.updated]: "Legal entity setup updated",
  [hrPayrollMcpAuditActions.ruleVersion.created]: "Rule version created",
  [hrPayrollMcpAuditActions.ruleVersion.published]: "Rule version published",
  [hrPayrollMcpAuditActions.taxRule.upserted]: "Tax rule updated",
  [hrPayrollMcpAuditActions.statutoryRule.upserted]: "Statutory rule updated",
  [hrPayrollMcpAuditActions.employerRule.upserted]: "Employer rule updated",
  [hrPayrollMcpAuditActions.payComponentTreatment.upserted]:
    "Pay component treatment updated",
  [hrPayrollMcpAuditActions.ruleSnapshot.persisted]:
    "Finalized payroll rule snapshot stored",
  [hrPayrollMcpAuditActions.employeeClassification.upserted]:
    "Employee classification updated",
  [hrPayrollMcpAuditActions.report.generated]: "Country report generated",
  [hrPayrollMcpAuditActions.report.exported]: "Country report exported",
  [hrPayrollMcpAuditActions.export.bankFile]: "Bank payment file exported",
  [hrPayrollMcpAuditActions.export.vendorFile]: "Payroll vendor file exported",
  [hrPayrollMcpAuditActions.export.statutoryPortal]:
    "Statutory portal export generated",
  [hrPayrollMcpAuditActions.localization.updated]:
    "Payroll localization updated",
  [hrPayrollMcpAuditActions.statutoryCalculation.recorded]:
    "Statutory calculation recorded",
  [hrPayrollMcpAuditActions.crossCountryReport.exported]:
    "Cross-country payroll report exported",
};

export function formatHrMcpAuditActionLabel(action: string): string {
  return (
    MCP_AUDIT_ACTION_LABELS[action as HrPayrollMcpAuditAction] ??
    action.replace(/^hr\.mcp\./, "").replaceAll(".", " ")
  );
}

export function mapHrMcpAuditTrailDisplayRow(
  row: HrMcpAuditTrailRow,
): HrMcpAuditTrailDisplayRow {
  return {
    ...row,
    actionLabel: formatHrMcpAuditActionLabel(row.action),
    occurredAtLabel: row.occurredAt.toISOString(),
  };
}

export function mapHrMcpAuditTrailDisplayRows(
  rows: readonly HrMcpAuditTrailRow[],
): readonly HrMcpAuditTrailDisplayRow[] {
  return rows.map(mapHrMcpAuditTrailDisplayRow);
}

export function isStatutoryRuleAuditAction(action: string): boolean {
  return (
    action === hrPayrollMcpAuditActions.taxRule.upserted ||
    action === hrPayrollMcpAuditActions.statutoryRule.upserted ||
    action === hrPayrollMcpAuditActions.employerRule.upserted ||
    action === hrPayrollMcpAuditActions.payComponentTreatment.upserted ||
    action === hrPayrollMcpAuditActions.ruleVersion.created ||
    action === hrPayrollMcpAuditActions.ruleVersion.published
  );
}

export function isFilingExportAuditAction(action: string): boolean {
  return (
    action === hrPayrollMcpAuditActions.export.bankFile ||
    action === hrPayrollMcpAuditActions.export.vendorFile ||
    action === hrPayrollMcpAuditActions.export.statutoryPortal ||
    action === hrPayrollMcpAuditActions.report.exported ||
    action === hrPayrollMcpAuditActions.crossCountryReport.exported
  );
}

export function filterHrMcpAuditTrailRows(
  rows: readonly HrMcpAuditTrailRow[],
  filter: {
    search?: string;
    statutoryOnly?: boolean;
    filingExportOnly?: boolean;
  },
): readonly HrMcpAuditTrailRow[] {
  const search = filter.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filter.statutoryOnly && !isStatutoryRuleAuditAction(row.action)) {
      return false;
    }
    if (filter.filingExportOnly && !isFilingExportAuditAction(row.action)) {
      return false;
    }
    if (!search) {
      return true;
    }
    const haystack = [row.action, row.summary ?? "", row.payrollRunRef ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(search);
  });
}

export function summarizeHrMcpAuditTrail(rows: readonly HrMcpAuditTrailRow[]) {
  const statutoryChanges = rows.filter((row) =>
    isStatutoryRuleAuditAction(row.action),
  ).length;
  const filingExports = rows.filter((row) =>
    isFilingExportAuditAction(row.action),
  ).length;
  const localizationChanges = rows.filter(
    (row) => row.action === hrPayrollMcpAuditActions.localization.updated,
  ).length;

  return {
    totalEvents: rows.length,
    statutoryChanges,
    filingExports,
    localizationChanges,
    latestOccurredAt: rows[0]?.occurredAt ?? null,
  };
}

export { HR_MCP_AUDIT_ACTION_VALUES, formatRuleVersionStatusLabel };
