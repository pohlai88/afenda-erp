import type { ListSurfaceTableClientProps } from "./gov-list-surface-table-client";
import type { ListSurfaceTableTrailingColumn } from "./gov-list-surface-table-client";
import type { ListSurfaceRendererConfiguration } from "./gov-list-surface-renderer-schema";
import { resolveGovernedBulkServerAction } from "./gov-server-actions-shared";

export type BuildListSurfaceTablePropsContext = {
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  presentationVariant?: "table-only";
  trailingColumn?: ListSurfaceTableTrailingColumn;
};

export function buildListSurfaceTableProps(
  config: ListSurfaceRendererConfiguration,
  context: BuildListSurfaceTablePropsContext,
): ListSurfaceTableClientProps {
  const { surface, columns, rows, presentation, pagination } = config;
  const resolvedSurfaceKey = context.surfaceKey ?? surface.columnsId;
  const presentationVariant =
    context.presentationVariant ?? presentation?.variant ?? "table-only";
  const tableDensity = presentation?.tableDensity ?? "compact";

  const bulkActionHandlers = Object.fromEntries(
    (presentation?.toolbar?.bulkActions ?? []).flatMap((action) => {
      const handler = resolveGovernedBulkServerAction(action.actionId);
      return handler ? [[action.actionId, handler]] : [];
    }),
  );

  return {
    columns,
    rows,
    surfaceKey: resolvedSurfaceKey,
    sectionKey: context.sectionKey,
    componentKey: context.componentKey,
    columnsId: surface.columnsId,
    tableLabel: surface.header.title,
    dataNature: config.dataNature,
    presentationVariant,
    empty: surface.empty,
    density: tableDensity,
    narrowMode: presentation?.narrowMode,
    primaryColumnId: presentation?.primaryColumnId,
    stickyHeader: presentation?.stickyHeader,
    virtualizeRowThreshold: presentation?.virtualizeRowThreshold,
    toolbar: presentation?.toolbar,
    selection: presentation?.selection,
    grouping: presentation?.grouping,
    summary: presentation?.summary,
    decisionLedger: presentation?.decisionLedger,
    bulkActionHandlers,
    pagination,
    trailingColumn: context.trailingColumn,
  };
}
