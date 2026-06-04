import type { ListSurfaceTableClientProps } from "./gov-list-surface-table-client";
import { ListSurfaceTableClient } from "./gov-list-surface-table-client";

export type {
  ListSurfaceTableTrailingColumn,
  ListSurfaceTableClientProps as ListSurfaceTableProps,
} from "./gov-list-surface-table-client";

/**
 * Metadata-driven table body — TanStack Table + optional virtualization.
 */
export function ListSurfaceTable(props: ListSurfaceTableClientProps) {
  return <ListSurfaceTableClient {...props} />;
}
