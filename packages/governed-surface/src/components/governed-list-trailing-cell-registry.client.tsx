"use client";

import type { ComponentType } from "react";

import type {
  GovernedListTrailingCellProps,
  GovernedPatternCTrailingColumnSpec,
} from "../governed-pattern-c-trailing-column.shared";
import {
  parseGovernedListTrailingCellContext,
  type GovernedListTrailingCellContext,
} from "../schemas/list-trailing-cell-context.schema";

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
  context?: GovernedListTrailingCellContext;
} {
  const Cell =
    spec.Cell ??
    (spec.cellId
      ? GOVERNED_LIST_TRAILING_CELL_REGISTRY[spec.cellId]
      : GovernedMetadataTrailingCell);

  // Validate context at the Pattern C boundary so callers receive schema errors
  // in development before invalid context reaches the trailing Cell.
  let context: GovernedListTrailingCellContext | undefined;
  if (spec.context !== undefined) {
    const parsed = parseGovernedListTrailingCellContext(spec.context);
    if (parsed.success) {
      context = parsed.data;
    } else if (process.env.NODE_ENV === "development") {
      console.warn(
        "[governed-ui] trailing column context failed validation — context will be omitted.",
        parsed.error.flatten(),
      );
    }
  }

  return {
    header: spec.header,
    Cell,
    context,
  };
}
