import { describe, expect, it } from "vitest";

import {
  extractGovernedConfigurationDataNature,
  toGovernedComponentEnvelopeFromDetailSection,
} from "../../src/governed-configuration.shared";

describe("governed configuration helpers", () => {
  it("extracts dataNature from configuration objects", () => {
    expect(
      extractGovernedConfigurationDataNature({ dataNature: "tabular-list" }),
    ).toBe("tabular-list");
    expect(extractGovernedConfigurationDataNature({})).toBeUndefined();
    expect(extractGovernedConfigurationDataNature(null)).toBeUndefined();
  });

  it("maps detail sections to governed component envelopes", () => {
    const envelope = toGovernedComponentEnvelopeFromDetailSection({
      id: "overview",
      label: "Overview",
      hidden: false,
      orderIndex: 0,
      rendererKey: "governed:stat-card",
      rendererProps: { dataNature: "kpi-strip", title: "Health" },
    });

    expect(envelope).toEqual({
      type: "governed:stat-card",
      serverType: "governed:stat-card",
      configuration: { dataNature: "kpi-strip", title: "Health" },
    });
  });
});
