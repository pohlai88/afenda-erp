import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GovernedDetailTabs } from "../../src/components/governed-detail-tabs";

describe("GovernedDetailTabs", () => {
  it("emits invalid diagnostics when model fails validation", () => {
    const html = renderToStaticMarkup(
      <GovernedDetailTabs model={{ entityLabel: "" } as never} />,
    );

    expect(html).toContain('data-render-state="invalid"');
    expect(html).toContain('data-testid="governed:detail-tabs:detail-tabs"');
    expect(html).toContain('data-component-type="governed:detail-tabs"');
    expect(html).toContain("Detail tabs unavailable");
  });

  it("resolves componentKey from sectionKey before surfaceKey", () => {
    const html = renderToStaticMarkup(
      <GovernedDetailTabs
        surfaceKey="finance.record"
        sectionKey="invoice-detail"
        model={{
          entityLabel: "FIN-001",
          entityKind: "record",
          entityId: "fin-1",
          overview: {
            id: "overview",
            label: "Overview",
            rendererKey: "governed:stat-card",
            rendererProps: {
              dataNature: "kpi",
              stats: [{ label: "Status", value: "Open", tone: "default" }],
            },
          },
        }}
      />,
    );

    expect(html).toContain('data-component-key="invoice-detail"');
  });

  it("emits scoped tab ids and component type when model is valid", () => {
    const html = renderToStaticMarkup(
      <GovernedDetailTabs
        surfaceKey="finance.record"
        model={{
          entityLabel: "FIN-001",
          entityKind: "record",
          entityId: "fin-1",
          overview: {
            id: "overview",
            label: "Overview",
            rendererKey: "governed:stat-card",
            rendererProps: {
              dataNature: "kpi",
              stats: [{ label: "Status", value: "Open", tone: "default" }],
            },
          },
        }}
      />,
    );

    expect(html).toContain('data-testid="governed:detail-tabs:finance.record"');
    expect(html).toContain('data-component-type="governed:detail-tabs"');
    expect(html).toContain(
      'data-testid="governed:detail-tab:finance.record-overview"',
    );
    expect(html).toContain(
      'data-testid="governed:detail-tab-panel:finance.record-overview"',
    );
    expect(html).toContain('data-component-key="finance.record-overview"');
  });
});
