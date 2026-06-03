import { GovernedEmpty } from "./client";
import { GovernedListSurface } from "../../components/governed-list-surface";
import { buildGovernedListSurfaceDataAttributes } from "./list-surface-identity.shared";
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
} from "../../schemas/list-surface-renderer.schema";
import { resolveGovernedBulkServerAction } from "../../schemas/server-actions.shared";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "./gov-registry";
import type { ListSurfaceTableClientProps } from "./list-surface-table.client";
import { ListSurfaceTable } from "./list-surface-table";

export type ListSurfaceRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
  variant?: "full" | "table-only";
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export function ListSurfaceRenderer({
  configuration,
  diagnostics = "user",
  variant,
  surfaceKey,
  sectionKey,
  componentKey,
}: ListSurfaceRendererProps) {
  const parsed = parseListSurfaceRendererConfiguration(configuration);
  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "listSurface");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
          emptyId: "list-surface-parse-error",
        }}
      />
    );
  }

  const config: ListSurfaceRendererConfiguration = parsed.data;
  const { surface, columns, rows, presentation, pagination } = config;
  const resolvedVariant = variant ?? presentation?.variant ?? "full";
  const tableDensity = presentation?.tableDensity ?? "compact";
  const resolvedSurfaceKey = surfaceKey ?? surface.columnsId;
  const listState = rows.length === 0 ? "empty" : "ready";
  const bulkActionHandlers = Object.fromEntries(
    (presentation?.toolbar?.bulkActions ?? []).flatMap((action) => {
      const handler = resolveGovernedBulkServerAction(action.actionId);
      return handler ? [[action.actionId, handler]] : [];
    }),
  );

  const tableProps = {
    columns,
    rows,
    surfaceKey: resolvedSurfaceKey,
    sectionKey,
    componentKey,
    columnsId: surface.columnsId,
    tableLabel: surface.header.title,
    dataNature: config.dataNature,
    presentationVariant: resolvedVariant,
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
  } satisfies ListSurfaceTableClientProps;

  const table = <ListSurfaceTable {...tableProps} />;

  if (resolvedVariant === "table-only") {
    return (
      <div
        className="@container min-w-0"
        {...buildGovernedListSurfaceDataAttributes({
          surfaceKey: resolvedSurfaceKey,
          sectionKey,
          componentKey,
          columnsId: surface.columnsId,
          dataNature: config.dataNature,
          presentationVariant: resolvedVariant,
          density: tableDensity,
          state: listState,
        })}
      >
        {table}
      </div>
    );
  }

  return (
    <GovernedListSurface
      model={surface}
      rowCount={rows.length}
      surfaceKey={resolvedSurfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
    >
      <div className="@container min-w-0">{table}</div>
    </GovernedListSurface>
  );
}
