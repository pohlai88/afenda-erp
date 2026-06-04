import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));
vi.mock("../../src/gov-governed-permission-gate-server", () => ({
  resolveGovernedErpPermissionAllowed: async () => true,
}));

import { GovernedPatternCListSection } from "../../src/gov-governed-pattern-c-list-section";
import { resolvePatternCTableTrailingColumn } from "../../src/gov-governed-pattern-c-list-table-host-client";
import {
  type ListSurfaceRendererConfigurationInput,
} from "../../src/gov-list-surface-renderer-schema";

function buildListConfig(
  rows: ListSurfaceRendererConfigurationInput["rows"] = [],
): ListSurfaceRendererConfigurationInput {
  return {
    __schemaVersion: 1,
    dataNature: "table",
    surface: {
      header: { title: "Reorder queue" },
      columnsId: "inventory-reorder-queue",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No reorder items",
        description: "Inventory is currently balanced.",
      },
    },
    columns: [{ id: "name", header: "Name" }],
    rows,
  };
}

describe("GovernedPatternCListSection", () => {
  it("derives section and component identity from columnsId when omitted", async () => {
    const element = await GovernedPatternCListSection({
      title: "Reorder queue",
      listConfiguration: buildListConfig(),
      surfaceKey: "inventory",
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-surface-key="inventory"');
    expect(html).toContain('data-section-key="inventory-reorder-queue"');
    expect(html).toContain('data-component-key="inventory-reorder-queue"');
    expect(html).toContain(
      'data-testid="governed:pattern-section:inventory-reorder-queue"',
    );
    expect(html).toContain("No reorder items");
    expect(html).not.toContain("governed-skeleton-list-surface");
  });

  it("honors explicit section and component identity", async () => {
    const element = await GovernedPatternCListSection({
      title: "Reorder queue",
      listConfiguration: buildListConfig(),
      surfaceKey: "inventory",
      sectionKey: "replenishment",
      componentKey: "reorder-list",
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-section-key="replenishment"');
    expect(html).toContain('data-component-key="reorder-list"');
    expect(html).toContain('id="governed-list-section-reorder-list"');
    expect(html).toContain('data-testid="governed:pattern-section:reorder-list"');
  });
});

describe("GovernedPatternCListTableHost", () => {
  it("propagates surface, section, and component identity into trailing cell context", () => {
    const trailingColumn = resolvePatternCTableTrailingColumn(
      { header: "Action", cellId: "governed.metadata" },
      "inventory",
      "replenishment",
      "reorder-list",
    );

    expect(trailingColumn?.context).toEqual({
      surfaceKey: "inventory",
      sectionKey: "replenishment",
      componentKey: "reorder-list",
    });
  });
});
