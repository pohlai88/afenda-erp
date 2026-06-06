import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseMetadataUiPermissionContract } from "../contracts/permission.contract";
import {
  createMetadataUiSectionIdentity,
  createMetadataUiTestId,
} from "../identity/identity.shared";
import {
  createMetadataUiRenderLogEvent,
} from "../logging/render-log.server";
import { createMetadataUiRenderLogger } from "../logging/render-log.server";
import { createMetadataUiListRenderLogEvent } from "../logging/list-render-log.server";
import { emitMetadataUiListRenderLog } from "../logging/list-render-log.server";
import { adaptGovernedStatCardToMetadataUiStat } from "../migration/stat-card-migration.shared";
import {
  createMetadataUiCapabilitySet,
  createMetadataUiSecurityPolicy,
  normalizeMetadataUiCapabilityKeys,
} from "../security/route-policy.shared";

const PACKAGE_ROOT = process.cwd();
const SRC_ROOT = path.join(PACKAGE_ROOT, "src");

function readMetadataUiSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relativePath), "utf8");
}

describe("metadata-ui production hardening", () => {
  it("creates stable identity attributes for renderer diagnostics", () => {
    const testId = createMetadataUiTestId(
      "metadata-ui",
      "List",
      "Quarter Close!",
      null,
      "primary action",
    );
    const trimmedTestId = createMetadataUiTestId(
      " metadata-ui ",
      " section ",
      "   ",
      "   Finance Close   ",
    );
    const identity = createMetadataUiSectionIdentity({
      sectionKind: "list",
      key: "finance.close-list",
      diagnostics: {
        componentKey: "metadata-ui.section.custom-list",
        rendererKey: "metadata-ui.renderer.custom-list",
      },
    });
    const fallbackIdentity = createMetadataUiSectionIdentity({
      sectionKind: "list",
      key: " finance.close-list ",
      id: "   ",
    });

    expect(testId).toBe("metadata-ui-list-quarter-close-primary-action");
    expect(trimmedTestId).toBe("metadata-ui-section-finance-close");
    expect(identity.id).toBe("metadata-ui-list-finance-close-list");
    expect(identity.domAttributes).toMatchObject({
      "data-metadata-ui-kind": "list",
      "data-metadata-ui-component": "metadata-ui.section.custom-list",
      "data-metadata-ui-section": "finance.close-list",
      "data-metadata-ui-renderer": "metadata-ui.renderer.custom-list",
      "data-testid": "metadata-ui-list-finance-close-list",
    });
    expect(fallbackIdentity.id).toBe("metadata-ui-list-finance-close-list");
    expect(fallbackIdentity.domAttributes["data-metadata-ui-section"]).toBe(
      "finance.close-list",
    );
  });

  it("normalizes capability inventories and resolves route policies fail-closed", () => {
    const capabilities = normalizeMetadataUiCapabilityKeys([
      "finance.close.read",
      "finance.close.read",
      "Invalid Capability",
      "finance_close_export",
    ]);
    const capabilitySet = createMetadataUiCapabilitySet(capabilities);
    const policy = createMetadataUiSecurityPolicy({
      key: "finance.close-list",
      scope: "section",
      permission: {
        operator: "all",
        requirements: [
          {
            capability: "finance.close.read",
            effect: "allow",
          },
        ],
        failure: {
          visibility: "hidden",
        },
      },
      metadata: {
        source: "production-hardening-test",
      },
    });

    expect(capabilities).toEqual([
      "finance.close.read",
      "finance_close_export",
    ]);
    expect(capabilitySet.has("finance.close.read")).toBe(true);
    expect(capabilitySet.has("invalid.capability")).toBe(false);
    expect(policy.permission).toEqual(
      parseMetadataUiPermissionContract(policy.permission),
    );
    expect(policy.metadata).toEqual({
      source: "production-hardening-test",
    });
  });

  it("keeps the shared door free of server/client runtime exports", () => {
    const indexSource = readMetadataUiSource("index.ts");

    expect(indexSource).not.toContain("server-only");
    expect(indexSource).not.toContain('"use client"');
    expect(indexSource).not.toMatch(/export \* from "\.\/(?:primitives|shell|renderers)\//);
    expect(indexSource).not.toMatch(/export \* from "\.\/.*\.(?:server|client|action)"/);
    expect(indexSource).toContain(
      'export * from "./migration/stat-card-migration.shared";',
    );
  });

  it("keeps server renderer context isolated behind server runtime files", () => {
    const rendererContextSource = readMetadataUiSource(
      "runtime/renderer-context.server.ts",
    );
    const renderSectionSource = readMetadataUiSource(
      "sections/render-section.server.tsx",
    );
    const registeredDispatcherSource = readMetadataUiSource(
      "sections/render-registered-section.server.tsx",
    );

    expect(rendererContextSource.startsWith('import "server-only";')).toBe(
      true,
    );
    expect(renderSectionSource.startsWith('import "server-only";')).toBe(true);
    expect(renderSectionSource).toContain(
      "data-metadata-ui-capabilities={state.capabilities.join",
    );
    expect(renderSectionSource).toContain(
      "data-metadata-ui-diagnostics-count={state.diagnosticsCount}",
    );
    expect(renderSectionSource).toContain("renderMetadataUiRegisteredSection");
    expect(registeredDispatcherSource.startsWith('import "server-only";')).toBe(
      true,
    );
    expect(registeredDispatcherSource).toContain("MetadataUiListRenderer");
  });

  it("keeps render logs canonical and identity-normalized", async () => {
    const renderLog = createMetadataUiRenderLogEvent({
      state: "loading",
      identity: {
        componentKey: " metadata-ui.section.list ",
        sectionKey: " finance.close-list ",
        rendererKey: " metadata-ui.renderer.list ",
        testId: " metadata-ui-list-finance-close-list ",
      },
      metadata: {
        source: "production-hardening-test",
      },
    });
    const listLogger = createMetadataUiRenderLogger();
    const listLog = createMetadataUiListRenderLogEvent({
      window: {
        rowCount: 0,
        visibleRowCount: 0,
        pageSize: 25,
        pageIndex: 0,
        totalRowCount: 0,
      },
      metadata: {
        source: "production-hardening-test",
      },
    });
    const emittedListLog = await emitMetadataUiListRenderLog(listLogger, {
      window: {
        rowCount: 12,
        visibleRowCount: 12,
        pageSize: 25,
        pageIndex: 0,
        totalRowCount: 12,
      },
      identity: {
        componentKey: " metadata-ui.section.list ",
        sectionKey: " finance.close-list ",
        rendererKey: " metadata-ui.renderer.list ",
        testId: " metadata-ui-list-finance-close-list ",
      },
      metadata: {
        source: "production-hardening-test",
      },
    });

    expect(renderLog.componentKey).toBe("metadata-ui.section.list");
    expect(renderLog.sectionKey).toBe("finance.close-list");
    expect(renderLog.rendererKey).toBe("metadata-ui.renderer.list");
    expect(renderLog.testId).toBe("metadata-ui-list-finance-close-list");
    expect(renderLog.level).toBe("debug");
    expect(renderLog.name).toBe("metadata-ui.render.started");
    expect(renderLog.metadata).toEqual({
      source: "production-hardening-test",
    });
    expect(listLog.name).toBe("metadata-ui.render.empty");
    expect(listLog.state).toBe("empty");
    expect(listLog.metadata).toEqual({
      source: "production-hardening-test",
      list: {
        rowCount: 0,
        visibleRowCount: 0,
        pageSize: 25,
        pageIndex: 0,
        totalRowCount: 0,
      },
    });
    expect(emittedListLog.name).toBe("metadata-ui.render.completed");
    expect(emittedListLog.state).toBe("ready");
    expect(emittedListLog.componentKey).toBe("metadata-ui.section.list");
    expect(emittedListLog.sectionKey).toBe("finance.close-list");
    expect(emittedListLog.rendererKey).toBe("metadata-ui.renderer.list");
    expect(emittedListLog.testId).toBe("metadata-ui-list-finance-close-list");
  });

  it("keeps form field primitives behavior-safe for server rendering", () => {
    const fieldPrimitiveSource = readMetadataUiSource(
      "primitives/field.server.tsx",
    );
    const formSchemaSource = readMetadataUiSource("schemas/form.schema.ts");
    const formBuilderSource = readMetadataUiSource("builders/form.builder.ts");
    const formClientSource = readMetadataUiSource("sections/form/form.client.tsx");
    const formRendererSource = readMetadataUiSource(
      "sections/form/form-renderer.server.tsx",
    );

    expect(fieldPrimitiveSource.startsWith('import "server-only";')).toBe(true);
    expect(fieldPrimitiveSource).not.toContain("disabled={section.defaultCollapsed}");
    expect(fieldPrimitiveSource).not.toContain("FieldError");
    expect(fieldPrimitiveSource).toContain(
      "renderMetadataUiCheckboxOptionGroup(field, disabled)",
    );
    expect(fieldPrimitiveSource).toContain("data-default-collapsed");
    expect(fieldPrimitiveSource).toContain("data-host-upload-key");
    expect(fieldPrimitiveSource).toContain("data-metadata-ui-field-state");
    expect(fieldPrimitiveSource).toContain("aria-invalid");
    expect(formSchemaSource).toContain("METADATA_UI_FORM_ERROR_SUMMARY_SCHEMA");
    expect(formSchemaSource).toContain("METADATA_UI_FORM_FILE_UPLOAD_SCHEMA");
    expect(formSchemaSource).toContain("METADATA_UI_FORM_FIELD_DEPENDENCY_SCHEMA");
    expect(formBuilderSource).toContain("createFileField");
    expect(formBuilderSource).toContain("withFormFieldState");
    expect(formBuilderSource).toContain("withFormErrorSummary");
    expect(formClientSource.startsWith('"use client";')).toBe(true);
    expect(formClientSource).toContain("useState");
    expect(formClientSource).not.toContain("fetch(");
    expect(formClientSource).not.toContain("localStorage");
    expect(formClientSource).not.toContain("FormData");
    expect(formRendererSource.startsWith('import "server-only";')).toBe(true);
    expect(formRendererSource).toContain("MetadataUiClientForm");
    expect(formRendererSource).toContain("data-metadata-ui-form-error-summary");
    expect(formRendererSource).not.toContain("upload");
    expect(formRendererSource).not.toMatch(/workflow|business validation/i);
  });

  it("keeps tabs primitives closed around metadata composition", () => {
    const tabsPrimitiveSource = readMetadataUiSource("primitives/tabs.server.tsx");

    expect(tabsPrimitiveSource.startsWith('import "server-only";')).toBe(true);
    expect(tabsPrimitiveSource).not.toContain("renderPanel");
    expect(tabsPrimitiveSource).toContain("ReactNode");
    expect(tabsPrimitiveSource).toContain("MetadataUiPrimitiveTabPanel");
    expect(tabsPrimitiveSource).toContain("data-metadata-ui-tab-section");
  });

  it("keeps server renderers from repeating action classification passes", () => {
    const actionBarRendererSource = readMetadataUiSource(
      "sections/action-bar/action-bar-renderer.server.tsx",
    );
    const formRendererSource = readMetadataUiSource(
      "sections/form/form-renderer.server.tsx",
    );

    expect(actionBarRendererSource.startsWith('import "server-only";')).toBe(
      true,
    );
    expect(formRendererSource.startsWith('import "server-only";')).toBe(true);
    expect(actionBarRendererSource).toContain(
      "reduce<MetadataUiSplitActionBarItems>",
    );
    expect(actionBarRendererSource).not.toContain(
      ".filter(shouldPinMetadataUiActionBarItem)",
    );
    expect(formRendererSource).toContain("groupMetadataUiFormActions");
    expect(formRendererSource).not.toContain("form.actions.filter");
  });

  it("keeps TanStack table mechanics isolated to the list client island", () => {
    const clientListTableSource = readMetadataUiSource(
      "sections/list/list-table.client.tsx",
    );
    const listRendererSource = readMetadataUiSource(
      "sections/list/list-renderer.server.tsx",
    );
    const tableStateSource = readMetadataUiSource("runtime/table-state.shared.ts");
    const serverDoorSource = readMetadataUiSource("server.ts");
    const sharedDoorSource = readMetadataUiSource("index.ts");

    expect(clientListTableSource.startsWith('"use client";')).toBe(true);
    expect(clientListTableSource).toContain("@tanstack/react-table");
    expect(clientListTableSource).toContain("useReactTable");
    expect(clientListTableSource).toContain(
      'data-metadata-ui-server-window="current"',
    );
    expect(listRendererSource.startsWith('import "server-only";')).toBe(true);
    expect(listRendererSource).not.toContain("@tanstack/react-table");
    expect(listRendererSource).toContain("title={list.title}");
    expect(listRendererSource).toContain("description={list.description}");
    expect(listRendererSource).toContain("MetadataUiPrimitiveListWindow");
    expect(tableStateSource).not.toContain("@tanstack/react-table");
    expect(serverDoorSource).not.toContain("list-table.client");
    expect(sharedDoorSource).not.toContain("@tanstack/react-table");
  });

  it("keeps virtualized table mechanics isolated to the virtual window client island", () => {
    const virtualWindowSource = readMetadataUiSource(
      "sections/list/list-virtual-window.client.tsx",
    );
    const clientListTableSource = readMetadataUiSource(
      "sections/list/list-table.client.tsx",
    );
    const listRendererSource = readMetadataUiSource(
      "sections/list/list-renderer.server.tsx",
    );
    const tableStateSource = readMetadataUiSource("runtime/table-state.shared.ts");

    expect(virtualWindowSource.startsWith('"use client";')).toBe(true);
    expect(virtualWindowSource).toContain("@tanstack/react-virtual");
    expect(virtualWindowSource).toContain("useVirtualizer");
    expect(virtualWindowSource).toContain(
      'data-metadata-ui-virtual-window="current-server-window"',
    );
    expect(clientListTableSource).toContain("MetadataUiVirtualListWindow");
    expect(listRendererSource).not.toContain("@tanstack/react-virtual");
    expect(tableStateSource).not.toContain("@tanstack/react-virtual");
    expect(tableStateSource).toContain("ownsCurrentWindowOnly: true");
  });

  it("keeps list toolbar state local and metadata-driven", () => {
    const toolbarClientSource = readMetadataUiSource(
      "sections/list/list-toolbar.client.tsx",
    );
    const toolbarPrimitiveSource = readMetadataUiSource(
      "primitives/list-toolbar.server.tsx",
    );
    const tableSource = readMetadataUiSource("sections/list/list-table.client.tsx");

    expect(toolbarClientSource.startsWith('"use client";')).toBe(true);
    expect(toolbarPrimitiveSource.startsWith('import "server-only";')).toBe(
      true,
    );
    expect(toolbarClientSource).not.toContain("fetch(");
    expect(toolbarClientSource).not.toContain("localStorage");
    expect(toolbarClientSource).not.toContain("window.location");
    expect(toolbarClientSource).not.toContain("URLSearchParams");
    expect(toolbarClientSource).toContain("showSavedViews");
    expect(toolbarClientSource).toContain("showDensity");
    expect(toolbarClientSource).toContain("showExport");
    expect(toolbarClientSource).toContain('role="toolbar"');
    expect(toolbarClientSource).toContain('aria-live="polite"');
    expect(toolbarClientSource).toContain("data-metadata-ui-list-toolbar-summary");
    expect(tableSource).toContain("filterMetadataUiTableRows");
    expect(tableSource).toContain("resetMetadataUiTableToolbarState");
  });

  it("keeps action lifecycle rendering accessible and host-owned", () => {
    const actionContractSource = readMetadataUiSource(
      "contracts/action.contract.ts",
    );
    const actionLifecycleSource = readMetadataUiSource(
      "server-actions/action-lifecycle.shared.ts",
    );
    const actionPolicySource = readMetadataUiSource(
      "server-actions/action-policy.server.ts",
    );
    const actionButtonSource = readMetadataUiSource(
      "primitives/action-button.server.tsx",
    );
    const actionMenuSource = readMetadataUiSource(
      "primitives/action-menu.server.tsx",
    );
    const actionBarRendererSource = readMetadataUiSource(
      "sections/action-bar/action-bar-renderer.server.tsx",
    );

    expect(actionContractSource).toContain('"pending"');
    expect(actionContractSource).toContain('"succeeded"');
    expect(actionContractSource).toContain('"failed"');
    expect(actionContractSource).toContain('"blocked"');
    expect(actionLifecycleSource).not.toContain("fetch(");
    expect(actionLifecycleSource).not.toContain("toast");
    expect(actionLifecycleSource).not.toContain("sonner");
    expect(actionLifecycleSource).not.toContain("localStorage");
    expect(actionLifecycleSource).toContain(
      "resolveMetadataUiActionLifecycle",
    );
    expect(actionPolicySource).toContain('lifecycle.state === "blocked"');
    expect(actionButtonSource).toContain("AlertDialog");
    expect(actionButtonSource).toContain("aria-live");
    expect(actionButtonSource).toContain("may be irreversible");
    expect(actionButtonSource).toContain("data-metadata-ui-action-state");
    expect(actionMenuSource).toContain("data-metadata-ui-action-menu=\"true\"");
    expect(actionMenuSource).toContain("aria-haspopup=\"menu\"");
    expect(actionBarRendererSource).toContain(
      "resolveMetadataUiActionLifecycle",
    );
    expect(actionBarRendererSource).toContain(
      "data-metadata-ui-action-state",
    );
    expect(actionBarRendererSource).toContain('role="toolbar"');
    expect(actionBarRendererSource).toContain("data-metadata-ui-action-bar-main-count");
  });

  it("keeps Recharts isolated to the chart client island with accessible fallbacks", () => {
    const packageSource = fs.readFileSync(
      path.join(PACKAGE_ROOT, "package.json"),
      "utf8",
    );
    const chartSchemaSource = readMetadataUiSource("schemas/chart.schema.ts");
    const chartBuilderSource = readMetadataUiSource("builders/chart.builder.ts");
    const chartBodySource = readMetadataUiSource(
      "sections/chart/chart-body.client.tsx",
    );
    const chartRechartsSource = readMetadataUiSource(
      "sections/chart/chart-recharts.client.tsx",
    );
    const chartRendererSource = readMetadataUiSource(
      "sections/chart/chart-renderer.server.tsx",
    );
    const sharedDoorSource = readMetadataUiSource("index.ts");
    const serverDoorSource = readMetadataUiSource("server.ts");

    expect(packageSource).toContain('"recharts": "3.8.0"');
    expect(chartSchemaSource).toContain("METADATA_UI_CHART_DISPLAY_SCHEMA");
    expect(chartSchemaSource).toContain("reducedMotion");
    expect(chartSchemaSource).toContain("tableFallbackLabel");
    expect(chartBuilderSource).toContain("createComposedChart");
    expect(chartBuilderSource).toContain("withChartDisplay");
    expect(chartBodySource.startsWith('"use client";')).toBe(true);
    expect(chartBodySource).toContain("lazy(() =>");
    expect(chartBodySource).toContain("chart-recharts.client");
    expect(chartBodySource).not.toContain('from "recharts"');
    expect(chartBodySource).toContain("<table>");
    expect(chartRechartsSource.startsWith('"use client";')).toBe(true);
    expect(chartRechartsSource).toContain('from "recharts"');
    expect(chartRechartsSource).toContain("ChartContainer");
    expect(chartRechartsSource).toContain("ChartTooltip");
    expect(chartBodySource).not.toContain("fetch(");
    expect(chartBodySource).not.toContain("localStorage");
    expect(chartRendererSource.startsWith('import "server-only";')).toBe(true);
    expect(chartRendererSource).not.toContain('from "recharts"');
    expect(chartRendererSource).toContain("parseMetadataUiChart");
    expect(chartRendererSource).toContain("MetadataUiChartBody");
    expect(sharedDoorSource).not.toContain('from "recharts"');
    expect(serverDoorSource).not.toContain('from "recharts"');
  });

  it("keeps NumberFlow isolated to the stat value client island", () => {
    const packageSource = fs.readFileSync(
      path.join(PACKAGE_ROOT, "package.json"),
      "utf8",
    );
    const statSchemaSource = readMetadataUiSource("schemas/stat.schema.ts");
    const statBuilderSource = readMetadataUiSource("builders/stat.builder.ts");
    const statValueSource = readMetadataUiSource(
      "primitives/stat-value.client.tsx",
    );
    const metricCardSource = readMetadataUiSource(
      "primitives/metric-card.server.tsx",
    );
    const emptyStateSource = readMetadataUiSource("primitives/empty.server.tsx");
    const statRendererSource = readMetadataUiSource(
      "sections/stat/stat-renderer.server.tsx",
    );
    const migrationSource = readMetadataUiSource(
      "migration/stat-card-migration.shared.ts",
    );
    const sharedDoorSource = readMetadataUiSource("index.ts");
    const serverDoorSource = readMetadataUiSource("server.ts");
    const clientDoorSource = readMetadataUiSource("client.ts");

    expect(packageSource).toContain('"@number-flow/react"');
    expect(statSchemaSource).toContain("METADATA_UI_STAT_DISPLAY_SCHEMA");
    expect(statSchemaSource).toContain('"compact"');
    expect(statSchemaSource).toContain("METADATA_UI_STAT_PROGRESS_SCHEMA");
    expect(statBuilderSource).toContain("createCompactStatItem");
    expect(statBuilderSource).toContain("withStatDisplay");
    expect(statValueSource.startsWith('"use client";')).toBe(true);
    expect(statValueSource).toContain("@number-flow/react");
    expect(statValueSource).toContain("useCanAnimate");
    expect(statValueSource).not.toContain("fetch(");
    expect(statValueSource).not.toContain("localStorage");
    expect(statRendererSource.startsWith('import "server-only";')).toBe(true);
    expect(statRendererSource).not.toContain("@number-flow/react");
    expect(statRendererSource).toContain("MetadataUiPrimitiveMetricCard");
    expect(metricCardSource).toContain('role="group"');
    expect(metricCardSource).toContain('role="progressbar"');
    expect(metricCardSource).toContain('role="img"');
    expect(metricCardSource).toContain("data-metadata-ui-metric-card");
    expect(metricCardSource).toContain("data-metadata-ui-metric-progress");
    expect(emptyStateSource).toContain("data-metadata-ui-empty-kind");
    expect(emptyStateSource).toContain("data-metadata-ui-empty-tone");
    expect(emptyStateSource).toContain("data-metadata-ui-empty-alert");
    expect(migrationSource).toContain("sparkline");
    expect(migrationSource).toContain("progress");
    expect(sharedDoorSource).not.toContain("@number-flow/react");
    expect(serverDoorSource).not.toContain("@number-flow/react");
    expect(clientDoorSource).toContain("stat-value.client");
  });

  it("keeps kanban interaction local, declarative, and policy-free", () => {
    const packageSource = fs.readFileSync(
      path.join(PACKAGE_ROOT, "package.json"),
      "utf8",
    );
    const kanbanSchemaSource = readMetadataUiSource("schemas/kanban.schema.ts");
    const kanbanBuilderSource = readMetadataUiSource("builders/kanban.builder.ts");
    const kanbanStateSource = readMetadataUiSource("runtime/kanban-state.shared.ts");
    const kanbanClientSource = readMetadataUiSource(
      "sections/kanban/kanban-drag-board.client.tsx",
    );
    const kanbanRendererSource = readMetadataUiSource(
      "sections/kanban/kanban-renderer.server.tsx",
    );
    const sharedDoorSource = readMetadataUiSource("index.ts");
    const serverDoorSource = readMetadataUiSource("server.ts");
    const clientDoorSource = readMetadataUiSource("client.ts");

    expect(packageSource).toContain('"motion"');
    expect(kanbanSchemaSource).toContain("METADATA_UI_KANBAN_TRANSITION_SCHEMA");
    expect(kanbanSchemaSource).toContain("disabledReason");
    expect(kanbanBuilderSource).toContain("withKanbanCards");
    expect(kanbanBuilderSource).toContain("withKanbanTransitions");
    expect(kanbanStateSource).toContain("createMetadataUiKanbanClientModel");
    expect(kanbanStateSource).toContain("MetadataUiKanbanMoveIntent");
    expect(kanbanStateSource).not.toContain("@afenda/feature");
    expect(kanbanStateSource).not.toMatch(/workflow|role matrix|organization/i);
    expect(kanbanClientSource.startsWith('"use client";')).toBe(true);
    expect(kanbanClientSource).toContain("motion/react");
    expect(kanbanClientSource).toContain("useReducedMotion");
    expect(kanbanClientSource).toContain("data-metadata-ui-move-intent");
    expect(kanbanClientSource).toContain('aria-live="polite"');
    expect(kanbanClientSource).toContain("data-metadata-ui-kanban-dragging");
    expect(kanbanClientSource).not.toContain("fetch(");
    expect(kanbanClientSource).not.toContain("localStorage");
    expect(kanbanClientSource).not.toContain("execute");
    expect(kanbanRendererSource.startsWith('import "server-only";')).toBe(true);
    expect(kanbanRendererSource).not.toContain("motion/react");
    expect(kanbanRendererSource).toContain("createMetadataUiKanbanClientModel");
    expect(sharedDoorSource).not.toContain("motion/react");
    expect(serverDoorSource).not.toContain("motion/react");
    expect(clientDoorSource).toContain("kanban-drag-board.client");
  });

  it("keeps migration adapters config-only and parity-note driven", () => {
    const migrationSource = readMetadataUiSource(
      "migration/stat-card-migration.shared.ts",
    );
    const result = adaptGovernedStatCardToMetadataUiStat({
      stats: [
        {
          label: "Exceptions",
          value: "7",
          tone: "critical",
          progress: {
            value: 7,
            max: 10,
          },
          sparkPoints: [{ value: 1 }, { value: 7 }],
        },
      ],
    });

    expect(migrationSource).not.toContain("@afenda/governed-surface");
    expect(migrationSource).not.toMatch(/^\s*<[A-Za-z]/m);
    expect(migrationSource).not.toMatch(/from "react"|from 'react'/);
    expect(result.stat.items[0]?.tone).toBe("critical");
    expect(result.parityNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceField: "progress",
          disposition: "carried-as-metadata",
        }),
        expect.objectContaining({
          sourceField: "sparkPoints",
          disposition: "carried-as-metadata",
        }),
      ]),
    );
  });
});
