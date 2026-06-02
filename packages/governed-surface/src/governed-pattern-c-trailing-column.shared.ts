import type { ComponentType } from "react";

import type { GovernedListTrailingCellContext } from "./schemas/list-trailing-cell-context.schema";
import type { ListSurfaceRow } from "./schemas/list-surface-renderer.schema";

export type GovernedListTrailingCellProps = {
  row: ListSurfaceRow;
  rowIndex: number;
  context?: GovernedListTrailingCellContext;
};

/** Serializable Pattern C trailing column spec (Server → Client). */
export type GovernedPatternCTrailingColumnSpec = {
  header: string;
  /**
   * Platform-resolved trailing cells registered in governed-surface.
   * Feature-owned lifecycle cells (document registry, quarantine review) MUST
   * pass explicit `Cell` from `@afenda/feature-system-admin/client` — they are
   * intentionally excluded from the registry (ARCH-1002 feature ownership).
   */
  cellId?: "governed.metadata";
  Cell?: ComponentType<GovernedListTrailingCellProps>;
  context?: GovernedListTrailingCellContext;
};
