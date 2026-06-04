"use client";

import type { ComponentType } from "react";

import type {
  GovernedListTrailingCellProps,
  GovernedPatternCTrailingColumnSpec,
} from "./governed-pattern-c-trailing-column.shared";
import {
  parseGovernedListTrailingCellContext,
  type GovernedListTrailingCellContext,
} from "./gov-list-trailing-cell-context-schema";

import { GovernedMetadataTrailingCell } from "./gov-governed-metadata-trailing-cell-client";

export type {
  GovernedListTrailingCellProps,
  GovernedPatternCTrailingColumnSpec,
};

export type GovernedListTrailingCellId = "governed.metadata";

export const GOVERNED_LIST_TRAILING_CELL_REGISTRY = {
  "governed.metadata": GovernedMetadataTrailingCell,
} satisfies Record<
  GovernedListTrailingCellId,
  ComponentType<GovernedListTrailingCellProps>
>;

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
      ? GOVERNED_LIST_TRAILING_CELL_REGISTRY[spec.cellId] ??
        GovernedMetadataTrailingCell
      : GovernedMetadataTrailingCell);

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
