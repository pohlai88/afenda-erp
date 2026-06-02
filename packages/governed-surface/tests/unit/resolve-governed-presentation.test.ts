import { describe, expect, it } from "vitest";

import type {
  ListSurfaceRendererConfiguration,
  ListSurfaceRendererConfigurationResolvedInput,
  StatCardConfiguration,
} from "@afenda/governed-surface";

import {
  GOVERNED_LIST_PRESENTATION_PROFILES,
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedListSurface,
  buildGovernedStatGrid,
  parseListSurfaceRendererConfiguration,
  parseStatCardConfiguration,
  resolveGovernedListPresentation,
} from "@afenda/governed-surface";
import {
  parseAuditPanelData,
  parseGovernedApprovalTimelineConfiguration,
  parseGovernedChartConfiguration,
} from "../../src/schemas/index";

describe("resolveGovernedListPresentation", () => {
  it("merges profile defaults with export toolbar override", () => {
    const merged = resolveGovernedListPresentation({
      profile: "erp-exception-table",
      presentation: {
        toolbar: {
          export: {
            actionId: "hrm.frm.exceptions.export",
            kind: "download",
            label: "Export",
            formats: ["csv"],
          },
        },
      },
    });

    expect(merged.stickyHeader).toBe(true);
    expect(merged.virtualizeRowThreshold).toBe(100);
    expect(merged.toolbar?.columnPicker).toBe(true);
    expect(merged.toolbar?.export?.actionId).toBe("hrm.frm.exceptions.export");
  });

  it("applies presentationProfile at parse time", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "table",
      presentationProfile: "erp-operational-table",
      surface: {
        header: { title: "Test" },
        columnsId: "test",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "name", header: "Name" }],
      rows: [{ id: "1", cells: { name: "A" } }],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.presentation).toEqual(
      GOVERNED_LIST_PRESENTATION_PROFILES["erp-operational-table"],
    );
    const parsedConfig: ListSurfaceRendererConfiguration = parsed.data;
    expect("presentationProfile" in parsedConfig).toBe(false);
  });

  it("resolves analytical table defaults with Decision Ledger chrome", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "table",
      presentationProfile: "erp-analytical-table",
      surface: {
        header: { title: "Analytical" },
        columnsId: "analytical",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "name", header: "Name" }],
      rows: [{ id: "1", cells: { name: "A" } }],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.presentation?.narrowMode).toBe("auto");
    expect(parsed.data.presentation?.selection?.mode).toBe("multiple");
    expect(parsed.data.presentation?.decisionLedger?.enabled).toBe(true);
  });
});

describe("buildGovernedListSurface", () => {
  it("accepts partial presentation overrides (toolbar only)", () => {
    const config = buildGovernedListSurface({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "table",
      presentationProfile: "erp-exception-table",
      presentation: {
        toolbar: {
          export: {
            actionId: "erp.hrm.leave.export.requests",
            kind: "download",
            label: "Export CSV",
            formats: ["csv"],
          },
        },
      },
      surface: {
        header: { title: "Leave recent" },
        columnsId: "leave-recent",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "employee", header: "Employee" }],
      rows: [{ id: "1", cells: { employee: "A" } }],
    });

    expect(config.presentation?.toolbar?.export?.actionId).toBe(
      "erp.hrm.leave.export.requests",
    );
    expect(config.presentation?.stickyHeader).toBe(true);
  });

  it("returns merged presentation without presentationProfile field", () => {
    const config = buildGovernedListSurface({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "table",
      presentationProfile: "erp-operational-table",
      surface: {
        header: { title: "Worksites" },
        columnsId: "worksites",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "code", header: "Code" }],
      rows: [{ id: "w1", cells: { code: "HQ" } }],
    });

    expect(config.presentation?.stickyHeader).toBe(true);
    const resolvedConfig: ListSurfaceRendererConfigurationResolvedInput =
      config;
    expect("presentationProfile" in resolvedConfig).toBe(false);
  });
});

describe("buildGovernedStatGrid", () => {
  it("resolves erp-executive-summary density", () => {
    const config = buildGovernedStatGrid({
      presentationProfile: "erp-executive-summary",
      dataNature: "snapshot-summary",
      stats: [{ label: "Open exceptions", value: "3 open" }],
    });

    expect(config.density).toBe("comfortable");
    const parsed = parseStatCardConfiguration(config);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const parsedConfig: StatCardConfiguration = parsed.data;
    expect(parsedConfig.density).toBe("comfortable");
    expect("presentationProfile" in parsedConfig).toBe(false);
  });
});

describe("enterprise visualization metadata v2 schemas", () => {
  it("accepts list toolbar controls and responsive column metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      dataNature: "table",
      presentation: {
        narrowMode: "cards",
        primaryColumnId: "name",
        toolbar: {
          search: { param: "q", label: "Search" },
          filters: [
            {
              id: "status",
              label: "Status",
              param: "status",
              options: [{ label: "Active", value: "active" }],
            },
          ],
          sort: {
            label: "Sort",
            param: "sort",
            options: [
              {
                label: "Name ascending",
                value: "name-asc",
                columnId: "name",
                direction: "asc",
              },
            ],
          },
          savedView: { label: "Saved view", href: "/playground" },
          bulkActions: [{ actionId: "bulk-close", label: "Close selected" }],
        },
      },
      surface: {
        header: { title: "List" },
        columnsId: "list-v2",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [
        {
          id: "name",
          header: "Name",
          headerAction: {
            label: "Configure name",
            href: "/playground?column=name",
          },
          priority: "primary",
          pin: "start",
          clip: true,
          minWidth: 160,
          maxWidth: 240,
          resizable: true,
        },
        { id: "status", header: "Status", wrap: true },
      ],
      rows: [{ id: "1", cells: { name: "Ada", status: "Active" } }],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.presentation?.toolbar?.search?.param).toBe("q");
    expect(parsed.data.presentation?.toolbar?.bulkActions?.[0]?.kind).toBe(
      "server-action",
    );
    expect(parsed.data.presentation?.narrowMode).toBe("cards");
    expect(parsed.data.columns[0]?.priority).toBe("primary");
    expect(parsed.data.columns[0]?.headerAction?.label).toBe("Configure name");
  });

  it("accepts analytical grouping, summary, and Decision Ledger row metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      dataNature: "table",
      presentationProfile: "erp-analytical-table",
      presentation: {
        grouping: {
          groups: [{ id: "critical", label: "Critical", rowIds: ["1"] }],
        },
        summary: {
          rows: [{ id: "total", label: "Total", cells: { amount: 1200 } }],
        },
      },
      surface: {
        header: { title: "Analytical" },
        columnsId: "analytical-v2",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [
        { id: "name", header: "Name" },
        { id: "amount", header: "Amount", summary: "sum" },
      ],
      rows: [
        {
          id: "1",
          cells: { name: "Ada", amount: 1200 },
          decisionLedger: {
            reason: "Policy threshold exceeded.",
            evidenceHref: "/playground#evidence",
            policyLabel: "Threshold policy",
            policyHref: "/playground#policy",
            actorLabel: "Policy engine",
            occurredAt: "2026-05-23T08:00:00.000Z",
            riskTone: "critical",
            nextActionLabel: "Review record",
          },
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.presentation?.grouping?.groups[0]?.id).toBe("critical");
    expect(parsed.data.presentation?.summary?.rows[0]?.cells.amount).toBe(1200);
    expect(parsed.data.rows[0]?.decisionLedger?.policyLabel).toBe(
      "Threshold policy",
    );
  });

  it("rejects duplicate analytical group ids", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      dataNature: "table",
      presentation: {
        grouping: {
          groups: [
            { id: "critical", label: "Critical", rowIds: ["1"] },
            { id: "critical", label: "Critical again", rowIds: ["1"] },
          ],
        },
      },
      surface: {
        header: { title: "Analytical" },
        columnsId: "analytical-duplicate-groups",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "name", header: "Name" }],
      rows: [{ id: "1", cells: { name: "Ada" } }],
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects summary cells that reference unknown columns", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      dataNature: "table",
      presentation: {
        summary: {
          rows: [{ id: "total", label: "Total", cells: { amount: 1200 } }],
        },
      },
      surface: {
        header: { title: "Analytical" },
        columnsId: "analytical-summary-columns",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "name", header: "Name" }],
      rows: [{ id: "1", cells: { name: "Ada" } }],
    });

    expect(parsed.success).toBe(false);
  });

  it("normalizes legacy and v2 chart context fields", () => {
    const parsed = parseGovernedChartConfiguration({
      dataNature: "time-series",
      chartKind: "line",
      description: "Weekly threshold view",
      drilldownHref: "/playground?chart=leave",
      actions: [{ id: "table", label: "Open table", href: "/playground" }],
      referenceBand: { label: "Legacy band", yMin: 1, yMax: 3 },
      annotations: [{ label: "Peak", x: "W2", y: 4, tone: "attention" }],
      series: [
        {
          id: "approved",
          label: "Approved",
          points: [{ x: "W2", y: 4 }],
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.referenceBands?.[0]?.label).toBe("Legacy band");
    expect(parsed.data.actions?.[0]?.label).toBe("Open table");
    expect(parsed.data.annotations?.[0]?.tone).toBe("attention");
  });

  it("classifies toolbar export actions as downloads", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      dataNature: "table",
      presentation: {
        toolbar: {
          export: {
            actionId: "export-list",
            label: "Export",
            formats: ["csv"],
          },
        },
      },
      surface: {
        header: { title: "Exportable list" },
        columnsId: "export-list",
        rowKey: "id",
        empty: { variant: "muted", title: "Empty" },
      },
      columns: [{ id: "name", header: "Name" }],
      rows: [{ id: "1", cells: { name: "Ada" } }],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.presentation?.toolbar?.export?.kind).toBe("download");
  });

  it("accepts compact audit and timeline hierarchy metadata", () => {
    const audit = parseAuditPanelData({
      dataNature: "audit-trail",
      headerTitle: "Audit",
      density: "compact",
      rows: [
        {
          id: "1",
          action: "erp.audit.update",
          occurredAt: "2026-05-17T08:00:00.000Z",
          actorLabel: "Jordan Lee",
          actorDetail: "HR operations",
          href: "/playground#audit",
          evidenceHref: "/playground#evidence",
          durationLabel: "42s",
          tone: "attention",
          metadataChips: [{ label: "PII", tone: "attention" }],
        },
      ],
    });
    const timeline = parseGovernedApprovalTimelineConfiguration({
      dataNature: "approval-flow",
      density: "compact",
      steps: [
        {
          id: "review",
          label: "Manager review",
          status: "active",
          href: "/playground#review",
          durationLabel: "1h open",
          metadataChips: [{ label: "SLA", tone: "attention" }],
        },
      ],
    });

    expect(audit.success).toBe(true);
    expect(timeline.success).toBe(true);
  });
});
