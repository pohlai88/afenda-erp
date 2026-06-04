import { describe, expect, it } from "vitest";

import { GovernedComponentRenderer } from "../../src/gov-render-governed-component";
import { resolveGovernedDetailSectionContent } from "../../src/gov-detail-section-adapter";

describe("resolveGovernedDetailSectionContent", () => {
  it("returns a GovernedComponentRenderer element for a valid section", () => {
    const node = resolveGovernedDetailSectionContent({
      id: "overview",
      label: "Overview",
      hidden: false,
      orderIndex: 0,
      rendererKey: "governed:section",
      rendererProps: {
        children: [
          {
            type: "governed:empty",
            serverType: "governed:empty",
            configuration: { variant: "muted", title: "Empty" },
          },
        ],
      },
    });
    // Adapter must return a React element — never null.
    expect(node).not.toBeNull();
    const el = node as { type?: unknown };
    expect(el.type).toBe(GovernedComponentRenderer);
  });

  it("returns a GovernedComponentRenderer element even for an unknown rendererKey", () => {
    // The tree handles the error internally; adapter must not return null.
    const node = resolveGovernedDetailSectionContent({
      id: "unknown",
      label: "Unknown",
      hidden: false,
      orderIndex: 2,
      rendererKey: "governed:not-a-real-renderer",
      rendererProps: {},
    });
    expect(node).not.toBeNull();
    const el = node as { type?: unknown };
    expect(el.type).toBe(GovernedComponentRenderer);
  });

  it("passes the section rendererKey as the envelope type", () => {
    const node = resolveGovernedDetailSectionContent({
      id: "stats",
      label: "Stats",
      hidden: false,
      orderIndex: 1,
      rendererKey: "governed:stat-card",
      rendererProps: { dataNature: "kpi" },
    });
    expect(node).not.toBeNull();
    const el = node as { props?: Record<string, unknown> };
    const component = el.props?.["component"] as
      | { type?: string }
      | undefined;
    expect(component?.type).toBe("governed:stat-card");
  });

  it("never returns null, even for sections with null rendererProps", () => {
    const node = resolveGovernedDetailSectionContent({
      id: "edge",
      label: "Edge",
      hidden: false,
      orderIndex: 3,
      rendererKey: "governed:empty",
      rendererProps: null as unknown as Record<string, unknown>,
    });
    expect(node).not.toBeNull();
  });
});
