import { describe, expect, it } from "vitest";

import {
  LIST_SURFACE_CARD_CHROME_CLASS,
  LIST_SURFACE_TABLE_VIEWPORT_CLASS,
  listSurfaceChromeXClass,
} from "../../src/metadata/renderers/list-surface-chrome.shared";

describe("list surface chrome classes", () => {
  it("uses table-shell as the single clip boundary", () => {
    expect(LIST_SURFACE_CARD_CHROME_CLASS).toContain("table-shell");
    expect(LIST_SURFACE_CARD_CHROME_CLASS).toContain("isolate");
    expect(LIST_SURFACE_CARD_CHROME_CLASS).not.toContain("shadow-elevation-1");
  });

  it("delegates horizontal scroll to table-shell and keeps Table container visible", () => {
    expect(LIST_SURFACE_CARD_CHROME_CLASS).toContain("table-shell");
    expect(LIST_SURFACE_TABLE_VIEWPORT_CLASS).not.toContain("overflow-x-auto");
    expect(LIST_SURFACE_TABLE_VIEWPORT_CLASS).toContain(
      "[&_[data-slot=table-container]]:overflow-visible",
    );
  });

  it("aligns chrome inset to table cell padding per density", () => {
    expect(listSurfaceChromeXClass("compact")).toBe("px-2.5");
    expect(listSurfaceChromeXClass("comfortable")).toContain("--af-table-cell-px");
  });
});
