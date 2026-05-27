"use client";

import type { ComponentType } from "react";

import type {
  GovernedListTrailingCellProps,
  GovernedPatternCTrailingColumnSpec,
} from "../governed-pattern-c-trailing-column.shared";

import { GovernedMetadataTrailingCell } from "./governed-metadata-trailing-cell.client";

export type {
  GovernedListTrailingCellProps,
  GovernedPatternCTrailingColumnSpec,
};

export type GovernedListTrailingCellId = "governed.metadata";

export const GOVERNED_LIST_TRAILING_CELL_REGISTRY: Record<
  GovernedListTrailingCellId,
  ComponentType<GovernedListTrailingCellProps>
> = {
  "governed.metadata": GovernedMetadataTrailingCell,
};

export function resolveGovernedTrailingColumn(
  spec: GovernedPatternCTrailingColumnSpec,
): {
  header: string;
  Cell: ComponentType<GovernedListTrailingCellProps>;
  context?: Record<string, unknown>;
} {
  const Cell =
    spec.Cell ??
    (spec.cellId
      ? GOVERNED_LIST_TRAILING_CELL_REGISTRY[spec.cellId]
      : GovernedMetadataTrailingCell);
  return {
    header: spec.header,
    Cell,
    context: spec.context,
  };
}
