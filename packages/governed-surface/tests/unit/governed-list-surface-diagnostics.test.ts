import { describe, expect, it } from "vitest";

import { buildGovernedListSurfaceDataAttributes } from "../../src/list-surface-identity.shared";

describe("buildGovernedListSurfaceDataAttributes", () => {
  it("emits legacy, identity, and diagnostics attrs together", () => {
    expect(
      buildGovernedListSurfaceDataAttributes({
        surfaceKey: "hr.records",
        sectionKey: "active-records",
        componentKey: "records-list",
        columnsId: "hr-records-v1",
        dataNature: "table",
        presentationVariant: "table-only",
        density: "compact",
        state: "ready",
      }),
    ).toEqual({
      "data-governed-surface-key": "hr.records",
      "data-governed-list-state": "ready",
      "data-governed-columns-id": "hr-records-v1",
      "data-governed-table-density": "compact",
      "data-governed-data-nature": "table",
      "data-governed-presentation-variant": "table-only",
      "data-surface-key": "hr.records",
      "data-section-key": "active-records",
      "data-component-key": "records-list",
      "data-render-state": "ready",
      "data-testid": "governed:list-surface:hr.records",
    });
  });
});
