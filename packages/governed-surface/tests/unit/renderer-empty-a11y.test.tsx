import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedStatGrid,
} from "@afenda/governed-surface";
import { governedRendererCopy } from "../../src/i18n/governed-renderer-copy.shared";
import { StatCardRenderer } from "../../src/metadata/renderers/stat-card.renderer";
import { ApprovalTimelineRenderer } from "../../src/metadata/renderers/approval-timeline.renderer";
import { ActionBarRenderer } from "../../src/metadata/renderers/action-bar.renderer";
import { ChartRenderer } from "../../src/metadata/renderers/chart.renderer";
import { EmptyRenderer } from "../../src/metadata/renderers/empty.renderer";
import { ListSurfaceRenderer } from "../../src/metadata/renderers/list-surface.renderer";
import { MultiStepFormRenderer } from "../../src/metadata/renderers/multi-step-form.renderer";
import { ScorecardFormRenderer } from "../../src/metadata/renderers/scorecard-form.renderer";
import {
  GOVERNED_CONFIRM_FIELD,
  actionSuccess,
  clearGovernedServerActionRegistryForTest,
  registerGovernedBulkServerAction,
  registerGovernedPolicyServerAction,
} from "../../src/schemas";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: () => undefined,
    replace: () => undefined,
  }),
}));

afterEach(() => {
  clearGovernedServerActionRegistryForTest();
});

describe("StatCardRenderer empty state", () => {
  it("renders GovernedEmpty when stats array is empty", () => {
    const configuration = buildGovernedStatGrid({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "kpi",
      presentationProfile: "erp-kpi-grid",
      stats: [],
    });

    const html = renderToStaticMarkup(
      <StatCardRenderer configuration={configuration} />,
    );

    expect(html).toContain(governedRendererCopy.empty.statCard.title);
    expect(html).toContain(governedRendererCopy.empty.statCard.description);
  });
});

describe("ApprovalTimelineRenderer empty state", () => {
  it("renders GovernedEmpty when steps array is empty", () => {
    const html = renderToStaticMarkup(
      <ApprovalTimelineRenderer
        configuration={{
          dataNature: "approval-flow",
          title: "Approval flow",
          steps: [],
        }}
      />,
    );

    expect(html).toContain(governedRendererCopy.empty.approvalTimeline.title);
    expect(html).toContain(
      governedRendererCopy.empty.approvalTimeline.description,
    );
  });
});

describe("list-surface-table sort control composition", () => {
  it("uses Button with aria-sort and no raw button for column sort", () => {
    const repoRoot = join(fileURLToPath(import.meta.url), "..", "..", "..");
    const source = readFileSync(
      join(
        repoRoot,
        "src/metadata/renderers/list-surface-table.client.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("aria-sort");
    expect(source).toContain('aria-label={tableLabel ?? "Data table"}');
    expect(source).not.toMatch(/<button\b/);
    expect(source).toMatch(/variant="ghost"/);
  });
});

describe("EmptyRenderer parse failure", () => {
  it("renders GovernedEmpty instead of null when configuration is invalid", () => {
    const html = renderToStaticMarkup(
      <EmptyRenderer configuration={{ variant: "not-a-variant" }} />,
    );

    expect(html).toContain(governedRendererCopy.parseError.empty.userTitle);
    expect(html).toContain(governedRendererCopy.parseError.empty.userDescription);
  });

  it("emits governed identity when renderer context is provided", () => {
    const html = renderToStaticMarkup(
      <EmptyRenderer
        configuration={{
          variant: "muted",
          title: "No records",
        }}
        surfaceKey="records"
        sectionKey="active-records"
        componentKey="records-empty-state"
      />,
    );

    expect(html).toContain('data-surface-key="records"');
    expect(html).toContain('data-section-key="active-records"');
    expect(html).toContain('data-component-key="records-empty-state"');
    expect(html).toContain('data-render-state="empty"');
  });
});

describe("StatCardRenderer identity", () => {
  it("emits governed identity on the stat-card root", () => {
    const html = renderToStaticMarkup(
      <StatCardRenderer
        configuration={{
          __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
          dataNature: "kpi",
          stats: [{ label: "Open", value: "12" }],
        }}
        surfaceKey="operations"
        sectionKey="operations-kpis"
        componentKey="operations-summary"
      />,
    );

    expect(html).toContain('data-surface-key="operations"');
    expect(html).toContain('data-section-key="operations-kpis"');
    expect(html).toContain('data-component-key="operations-summary"');
    expect(html).toContain('data-testid="governed:stat-card:operations-summary"');
  });
});

describe("metadata renderer identity", () => {
  it("emits governed identity on the action-bar root", () => {
    const html = renderToStaticMarkup(
      <ActionBarRenderer
        configuration={{
          actions: [
            {
              id: "approve",
              label: "Approve",
              intent: "approval",
              requiresStepUp: true,
            },
          ],
        }}
        diagnostics="user"
        componentType="governed:action-bar"
        surfaceKey="approvals"
        sectionKey="approval-actions"
        componentKey="approval-action-bar"
      />,
    );

    expect(html).toContain('data-surface-key="approvals"');
    expect(html).toContain('data-section-key="approval-actions"');
    expect(html).toContain('data-component-key="approval-action-bar"');
    expect(html).toContain('data-testid="governed:action-bar:approval-action-bar"');
    expect(html).toContain("1 gated");
    expect(html).toContain("Step-up");
    expect(html).toContain('data-action-resolution="missing"');
    expect(html).toContain('name="__governedActionId"');
    expect(html).toContain("Unregistered");
  });

  it("emits governed identity on the approval-timeline root", () => {
    const html = renderToStaticMarkup(
      <ApprovalTimelineRenderer
        configuration={{
          dataNature: "approval-flow",
          steps: [{ id: "requested", label: "Requested", status: "complete" }],
        }}
        surfaceKey="procurement"
        sectionKey="purchase-order"
        componentKey="purchase-approval-timeline"
      />,
    );

    expect(html).toContain('data-surface-key="procurement"');
    expect(html).toContain('data-section-key="purchase-order"');
    expect(html).toContain('data-component-key="purchase-approval-timeline"');
    expect(html).toContain(
      'data-testid="governed:approval-timeline:purchase-approval-timeline"',
    );
    expect(html).toContain("1 of 1 steps complete");
  });

  it("renders chart actionIds as governed server action forms", () => {
    const html = renderToStaticMarkup(
      <ChartRenderer
        configuration={{
          dataNature: "time-series",
          chartKind: "line",
          title: "Revenue trend",
          actions: [
            {
              id: "refresh",
              label: "Refresh",
              actionId: "refresh-revenue-chart",
            },
          ],
          series: [
            {
              id: "revenue",
              label: "Revenue",
              points: [{ x: "W1", y: 10 }],
            },
          ],
        }}
        surfaceKey="finance"
        sectionKey="revenue"
        componentKey="revenue-chart"
      />,
    );

    expect(html).toContain('data-surface-key="finance"');
    expect(html).toContain('data-section-key="revenue"');
    expect(html).toContain('data-component-key="revenue-chart"');
    expect(html).toContain('data-action-id="refresh-revenue-chart"');
    expect(html).toContain('name="__governedActionId"');
    expect(html).toContain('data-action-resolution="missing"');
    expect(html).toContain("Unregistered");
  });

  it("disables step-up actions when no server-supplied token is available", () => {
    registerGovernedPolicyServerAction(
      {
        actionId: "approve-high-risk",
        stepUp: {
          required: true,
          verify: async () => actionSuccess(),
        },
      },
      async () => actionSuccess(),
    );

    const html = renderToStaticMarkup(
      <ActionBarRenderer
        configuration={{
          actions: [
            {
              id: "approve-high-risk",
              label: "Approve",
              intent: "approval",
              requiresStepUp: true,
            },
          ],
        }}
        diagnostics="user"
        componentType="governed:action-bar"
      />,
    );

    expect(html).toContain('data-action-resolution="missing-step-up"');
    expect(html).toContain("Missing step-up");
    expect(html).toContain("disabled");
  });

  it("does not serialize confirmation fields before user confirmation", () => {
    registerGovernedPolicyServerAction(
      {
        actionId: "delete-case",
        confirmation: { required: true },
      },
      async () => actionSuccess(),
    );

    const html = renderToStaticMarkup(
      <ActionBarRenderer
        configuration={{
          actions: [
            {
              id: "delete-case",
              label: "Delete",
              intent: "destructive",
              confirm: {
                title: "Confirm delete",
                confirmLabel: "I understand",
              },
            },
          ],
        }}
        diagnostics="user"
        componentType="governed:action-bar"
      />,
    );

    expect(html).toContain('data-action-has-confirm="true"');
    expect(html).toContain("I understand");
    expect(html).not.toContain(`name="${GOVERNED_CONFIRM_FIELD}"`);
  });

  it("resolves list toolbar bulk actions as governed server action forms", () => {
    registerGovernedBulkServerAction(
      {
        actionId: "bulk-close",
        selectedRows: { min: 1 },
      },
      async () => actionSuccess(),
    );

    const html = renderToStaticMarkup(
      <ListSurfaceRenderer
        configuration={{
          dataNature: "table",
          presentation: {
            selection: { mode: "multiple", label: "Select rows" },
            toolbar: {
              bulkActions: [
                {
                  actionId: "bulk-close",
                  label: "Close selected",
                  confirm: {
                    title: "Confirm close",
                    confirmLabel: "Confirm close",
                  },
                },
              ],
            },
          },
          surface: {
            header: { title: "Cases" },
            columnsId: "cases",
            rowKey: "id",
            empty: { variant: "muted", title: "Empty" },
          },
          columns: [{ id: "name", header: "Name" }],
          rows: [{ id: "case-1", cells: { name: "Case 1" } }],
        }}
        surfaceKey="support"
        sectionKey="cases"
        componentKey="case-list"
      />,
    );

    expect(html).toContain('data-action-id="bulk-close"');
    expect(html).toContain('data-action-kind="server-action"');
    expect(html).toContain('data-action-resolution="registered"');
    expect(html).toContain('data-action-has-confirm="true"');
    expect(html).toContain('name="__governedActionId"');
    expect(html).not.toContain(`name="${GOVERNED_CONFIRM_FIELD}"`);
    expect(html).toContain("Select at least one row.");
  });

  it("emits governed identity on the multi-step-form renderer root", () => {
    const html = renderToStaticMarkup(
      <MultiStepFormRenderer
        configuration={{
          __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
          formId: "onboarding",
          actionId: "submit-onboarding",
          steps: [
            {
              id: "details",
              title: "Details",
              fields: [{ id: "name", label: "Name", kind: "text" }],
            },
          ],
        }}
        diagnostics="user"
        componentType="governed:multi-step-form"
        surfaceKey="hr"
        sectionKey="onboarding"
        componentKey="onboarding-form"
      />,
    );

    expect(html).toContain('data-surface-key="hr"');
    expect(html).toContain('data-section-key="onboarding"');
    expect(html).toContain('data-component-key="onboarding-form"');
    expect(html).toContain('data-testid="governed:multi-step-form:onboarding-form"');
    expect(html).toContain('data-action-resolution="missing"');
    expect(html).toContain('name="__governedFormId"');
    expect(html).toContain('name="__governedActionId"');
    expect(html).toContain("Server action is not registered");
  });

  it("emits governed identity on the scorecard-form renderer root", () => {
    const html = renderToStaticMarkup(
      <ScorecardFormRenderer
        configuration={{
          __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
          formId: "supplier-scorecard",
          actionId: "submit-score",
          title: "Supplier scorecard",
          criteria: [{ id: "quality", label: "Quality", maxScore: 5 }],
        }}
        diagnostics="user"
        componentType="governed:scorecard-form"
        surfaceKey="procurement"
        sectionKey="supplier-review"
        componentKey="supplier-scorecard"
      />,
    );

    expect(html).toContain('data-surface-key="procurement"');
    expect(html).toContain('data-section-key="supplier-review"');
    expect(html).toContain('data-component-key="supplier-scorecard"');
    expect(html).toContain('data-testid="governed:scorecard-form:supplier-scorecard"');
    expect(html).toContain('data-slot="radio-group"');
    expect(html).toContain('data-slot="radio-group-item"');
    expect(html).toContain("0% complete");
    expect(html).toContain("disabled");
    expect(html).toContain('data-action-resolution="missing"');
    expect(html).toContain('name="__governedFormId"');
    expect(html).toContain('name="__governedActionId"');
    expect(html).toContain('name="quality"');
  });
});
