import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));
vi.mock("../../src/data/governed-permission-gate.server", () => ({
  resolveGovernedErpPermissionAllowed: async () => true,
}));
vi.mock("../../src/metadata/index", () => ({
  GovernedComponentRenderer: ({
    surfaceKey,
    sectionKey,
    componentKey,
  }: {
    surfaceKey?: string;
    sectionKey?: string;
    componentKey?: string;
  }) => (
    <div
      data-testid="renderer-stub"
      data-surface-key={surfaceKey}
      data-section-key={sectionKey}
      data-component-key={componentKey}
    />
  ),
}));

import { GovernedPatternBListSection } from "../../src/components/governed-pattern-b-list-section";
import type { ListSurfaceRendererConfigurationInput } from "../../src/schemas/list-surface-renderer.schema";

function buildListConfig(
  rows: ListSurfaceRendererConfigurationInput["rows"] = [],
): ListSurfaceRendererConfigurationInput {
  return {
    __schemaVersion: 1,
    dataNature: "table",
    surface: {
      header: { title: "Active customers" },
      columnsId: "contacts-active-customers",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No customers",
        description: "Customers appear here when they are active.",
      },
    },
    columns: [{ id: "name", header: "Name" }],
    rows,
  };
}

describe("GovernedPatternBListSection", () => {
  it("derives section and component identity from columnsId when omitted", async () => {
    const element = await GovernedPatternBListSection({
      title: "Active customers",
      listConfiguration: buildListConfig([{ id: "cust-1", cells: { name: "Ada" } }]),
      surfaceKey: "contacts",
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-surface-key="contacts"');
    expect(html).toContain('data-section-key="contacts-active-customers"');
    expect(html).toContain('data-component-key="contacts-active-customers"');
    expect(html).toContain(
      'data-testid="governed:pattern-section:contacts-active-customers"',
    );
    expect(html).toContain('data-testid="renderer-stub"');
  });

  it("propagates explicit section and component identity into the renderer", async () => {
    const element = await GovernedPatternBListSection({
      title: "Active customers",
      listConfiguration: buildListConfig([{ id: "cust-1", cells: { name: "Ada" } }]),
      surfaceKey: "contacts",
      sectionKey: "active-customers",
      componentKey: "customer-list",
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-section-key="active-customers"');
    expect(html).toContain('data-component-key="customer-list"');
    expect(html).toContain('data-testid="renderer-stub"');
  });

  it("models empty list rows as empty, not renderer children", async () => {
    const element = await GovernedPatternBListSection({
      title: "Active customers",
      listConfiguration: buildListConfig(),
      surfaceKey: "contacts",
      componentKey: "customer-list",
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-render-state="empty"');
    expect(html).toContain("No customers");
    expect(html).toContain("customer-list-empty");
    expect(html).not.toContain('data-testid="renderer-stub"');
  });
});
