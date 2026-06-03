import type { ListSurfaceTableClientProps } from "./list-surface-table.client";
import { ListSurfaceTableClient } from "./list-surface-table.client";

export type {
  ListSurfaceTableTrailingColumn,
  ListSurfaceTableClientProps as ListSurfaceTableProps,
} from "./list-surface-table.client";

/**
 * Metadata-driven table body — TanStack Table + optional virtualization.
 */
export function ListSurfaceTable(props: ListSurfaceTableClientProps) {
  return <ListSurfaceTableClient {...props} />;
}
