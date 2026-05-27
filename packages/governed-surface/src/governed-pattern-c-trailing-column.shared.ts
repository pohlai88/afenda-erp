import type { ComponentType } from "react";

import type { ListSurfaceRow } from "./schemas/list-surface-renderer.schema";

export type GovernedListTrailingCellProps = {
  row: ListSurfaceRow;
  rowIndex: number;
  context?: Record<string, unknown>;
};

/** Serializable Pattern C trailing column spec (Server → Client). Pass a Client Component as `Cell`. */
export type GovernedPatternCTrailingColumnSpec = {
  header: string;
  cellId?: "governed.metadata";
  Cell?: ComponentType<GovernedListTrailingCellProps>;
  context?: Record<string, unknown>;
};
