import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));

import {
  GovernedPatternBStatSection,
  type GovernedPatternBStatGroup,
} from "../../src/gov-governed-pattern-b-stat-section";

const statGroup: GovernedPatternBStatGroup = {
  groupKey: "operations",
  label: "Operations",
  configuration: {
    __schemaVersion: 1,
    dataNature: "kpi",
    stats: [
      {
        label: "Open orders",
        value: "42",
        tone: "attention",
      },
    ],
  },
};

describe("GovernedPatternBStatSection", () => {
  it("derives section and component identity when omitted", async () => {
    const element = await GovernedPatternBStatSection({
      title: "Inventory KPIs",
      surfaceKey: "inventory",
      statGroups: [statGroup],
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-surface-key="inventory"');
    expect(html).toContain('data-section-key="inventory-stats"');
    expect(html).toContain('data-component-key="inventory-stats"');
    expect(html).toContain('data-testid="governed:pattern-section:inventory-stats"');
  });

  it("honors explicit section and component identity and governs stat groups", async () => {
    const element = await GovernedPatternBStatSection({
      title: "Inventory KPIs",
      surfaceKey: "inventory",
      sectionKey: "inventory-kpis",
      componentKey: "inventory-summary-cards",
      statGroups: [statGroup],
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-section-key="inventory-kpis"');
    expect(html).toContain('data-component-key="inventory-summary-cards"');
    expect(html).toContain('data-stat-group-key="operations"');
    expect(html).toContain(
      'data-component-key="inventory-summary-cards-operations"',
    );
    expect(html).toContain(
      'data-testid="governed:stat-group:inventory-summary-cards-operations"',
    );
  });

  it("models empty stat groups as empty, not invalid", async () => {
    const element = await GovernedPatternBStatSection({
      title: "Inventory KPIs",
      surfaceKey: "inventory",
      componentKey: "inventory-summary-cards",
      statGroups: [],
      layout: "embedded",
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-render-state="empty"');
    expect(html).toContain("No metrics configured.");
    expect(html).toContain("inventory-summary-cards-empty-groups");
  });
});
