import { describe, expect, it } from "vitest";

import {
  LIST_SURFACE_TABLE_COLUMN_DEFAULT_MIN_WIDTH_PX,
  LIST_SURFACE_TABLE_SCROLL_PADDING_PX,
  LIST_SURFACE_TRAILING_COLUMN_MIN_WIDTH_PX,
  resolveListSurfaceTableMinWidthPx,
} from "../../src/gov-list-surface-table-layout-shared";

describe("resolveListSurfaceTableMinWidthPx", () => {
  it("sums column min widths, trailing column, and scroll padding", () => {
    const minWidth = resolveListSurfaceTableMinWidthPx({
      columns: [{ minWidth: 160 }, { minWidth: 200 }, {}],
      hasTrailingColumn: true,
      hasSelection: false,
      hasDecisionLedger: false,
    });

    expect(minWidth).toBe(
      LIST_SURFACE_TABLE_SCROLL_PADDING_PX +
        160 +
        200 +
        LIST_SURFACE_TABLE_COLUMN_DEFAULT_MIN_WIDTH_PX +
        LIST_SURFACE_TRAILING_COLUMN_MIN_WIDTH_PX,
    );
  });

  it("includes selection and decision ledger column budgets", () => {
    const minWidth = resolveListSurfaceTableMinWidthPx({
      columns: [],
      hasTrailingColumn: false,
      hasSelection: true,
      hasDecisionLedger: true,
    });

    expect(minWidth).toBe(LIST_SURFACE_TABLE_SCROLL_PADDING_PX + 40 + 96);
  });
});
