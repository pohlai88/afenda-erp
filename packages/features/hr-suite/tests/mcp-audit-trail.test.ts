import { describe, expect, it } from "vitest";

import {
  filterHrMcpAuditTrailRows,
  formatHrMcpAuditActionLabel,
  isFilingExportAuditAction,
  isStatutoryRuleAuditAction,
  mapHrMcpAuditTrailDisplayRows,
  summarizeHrMcpAuditTrail,
} from "../data/hr.payroll.mcp-audit.shared";
import { hrPayrollMcpAuditActions } from "../events/hr.payroll.mcp.event";

const sampleRows = [
  {
    id: "audit-1",
    action: hrPayrollMcpAuditActions.taxRule.upserted,
    summary: "Updated PCB rule",
    occurredAt: new Date("2026-05-01T10:00:00.000Z"),
    actorUserId: "user-1",
    countryConfigId: "country-1",
    legalEntitySetupId: null,
    ruleVersionId: "rv-1",
    payrollRunRef: null,
  },
  {
    id: "audit-2",
    action: hrPayrollMcpAuditActions.export.bankFile,
    summary: "Bank file export",
    occurredAt: new Date("2026-05-02T10:00:00.000Z"),
    actorUserId: "user-2",
    countryConfigId: "country-1",
    legalEntitySetupId: "entity-1",
    ruleVersionId: null,
    payrollRunRef: "RUN-2026-05",
  },
  {
    id: "audit-3",
    action: hrPayrollMcpAuditActions.localization.updated,
    summary: "Updated locale",
    occurredAt: new Date("2026-05-03T10:00:00.000Z"),
    actorUserId: "user-1",
    countryConfigId: "country-1",
    legalEntitySetupId: null,
    ruleVersionId: null,
    payrollRunRef: null,
  },
] as const;

describe("HRM-MCP-028 audit trail", () => {
  it("formats known audit action labels", () => {
    expect(formatHrMcpAuditActionLabel(hrPayrollMcpAuditActions.taxRule.upserted)).toMatch(
      /tax rule/i,
    );
    expect(formatHrMcpAuditActionLabel(hrPayrollMcpAuditActions.export.bankFile)).toMatch(
      /bank/i,
    );
  });

  it("maps display rows with labels", () => {
    const displayRows = mapHrMcpAuditTrailDisplayRows(sampleRows);
    expect(displayRows[0]?.actionLabel).toMatch(/tax rule/i);
    expect(displayRows[0]?.occurredAtLabel).toContain("2026-05-01");
  });

  it("classifies statutory and filing export actions", () => {
    expect(isStatutoryRuleAuditAction(hrPayrollMcpAuditActions.taxRule.upserted)).toBe(
      true,
    );
    expect(isFilingExportAuditAction(hrPayrollMcpAuditActions.export.bankFile)).toBe(
      true,
    );
    expect(isFilingExportAuditAction(hrPayrollMcpAuditActions.localization.updated)).toBe(
      false,
    );
  });

  it("filters audit rows by search and category", () => {
    const statutoryOnly = filterHrMcpAuditTrailRows(sampleRows, {
      statutoryOnly: true,
    });
    expect(statutoryOnly).toHaveLength(1);

    const filingOnly = filterHrMcpAuditTrailRows(sampleRows, {
      filingExportOnly: true,
    });
    expect(filingOnly).toHaveLength(1);

    const searched = filterHrMcpAuditTrailRows(sampleRows, {
      search: "bank",
    });
    expect(searched).toHaveLength(1);
  });

  it("summarizes audit trail counts", () => {
    const summary = summarizeHrMcpAuditTrail([...sampleRows]);
    expect(summary.totalEvents).toBe(3);
    expect(summary.statutoryChanges).toBe(1);
    expect(summary.filingExports).toBe(1);
    expect(summary.localizationChanges).toBe(1);
  });
});
