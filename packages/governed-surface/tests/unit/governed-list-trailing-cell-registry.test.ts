import { describe, expect, it, vi } from "vitest";

import {
  GovernedMetadataTrailingCell,
} from "../../src/components/governed-metadata-trailing-cell.client";
import {
  GOVERNED_LIST_TRAILING_CELL_REGISTRY,
  resolveGovernedTrailingColumn,
} from "../../src/components/governed-list-trailing-cell-registry.client";
import type { GovernedListTrailingCellProps } from "../../src/governed-pattern-c-trailing-column.shared";

// A minimal stub component for testing explicit Cell overrides.
function StubCell(_props: GovernedListTrailingCellProps) {
  return null;
}

describe("GOVERNED_LIST_TRAILING_CELL_REGISTRY", () => {
  it('has a "governed.metadata" entry', () => {
    expect(GOVERNED_LIST_TRAILING_CELL_REGISTRY["governed.metadata"]).toBe(
      GovernedMetadataTrailingCell,
    );
  });
});

describe("resolveGovernedTrailingColumn", () => {
  it("returns the explicit Cell when provided", () => {
    const result = resolveGovernedTrailingColumn({
      header: "Actions",
      Cell: StubCell,
    });
    expect(result.Cell).toBe(StubCell);
    expect(result.header).toBe("Actions");
  });

  it('falls back to GovernedMetadataTrailingCell for cellId "governed.metadata"', () => {
    const result = resolveGovernedTrailingColumn({
      header: "Action",
      cellId: "governed.metadata",
    });
    expect(result.Cell).toBe(GovernedMetadataTrailingCell);
  });

  it("falls back to GovernedMetadataTrailingCell when neither Cell nor cellId provided", () => {
    const result = resolveGovernedTrailingColumn({ header: "Action" });
    expect(result.Cell).toBe(GovernedMetadataTrailingCell);
  });

  it("validates and passes through a valid context", () => {
    const result = resolveGovernedTrailingColumn({
      header: "Action",
      cellId: "governed.metadata",
      context: { surfaceKey: "finance-records", moduleId: "finance" },
    });
    expect(result.context).toEqual({
      surfaceKey: "finance-records",
      moduleId: "finance",
    });
  });

  it("strips invalid context and warns in development", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env["NODE_ENV"];
    // @ts-expect-error -- forcing dev env for test
    process.env["NODE_ENV"] = "development";

    const result = resolveGovernedTrailingColumn({
      header: "Action",
      cellId: "governed.metadata",
      // Extra field is invalid per strict schema.
      context: { surfaceKey: "ok", extraField: "bad" } as never,
    });

    expect(result.context).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    // @ts-expect-error -- restoring env
    process.env["NODE_ENV"] = originalEnv;
    warnSpy.mockRestore();
  });

  it("returns undefined context when no context provided", () => {
    const result = resolveGovernedTrailingColumn({
      header: "Action",
      cellId: "governed.metadata",
    });
    expect(result.context).toBeUndefined();
  });
});
