import { GovernedEmpty } from "../../client";
import { GovernedListSurface } from "../../components/governed-list-surface";
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
} from "../../schemas/list-surface-renderer.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";
import type { ListSurfaceTableClientProps } from "./list-surface-table.client";
import { ListSurfaceTable } from "./list-surface-table";

export type ListSurfaceRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
  variant?: "full" | "table-only";
};

export function ListSurfaceRenderer({
  configuration,
  diagnostics = "user",
  variant,
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
        }}
      />
    );
  }

  const config: ListSurfaceRendererConfiguration = parsed.data;
  const { surface, columns, rows, presentation, pagination } = config;
  const resolvedVariant = variant ?? presentation?.variant ?? "full";
  const tableDensity = presentation?.tableDensity ?? "compact";

  const tableProps = {
    columns,
    rows,
    surfaceKey: surface.columnsId,
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
    pagination,
  } satisfies ListSurfaceTableClientProps;

  const table = <ListSurfaceTable {...tableProps} />;

  if (resolvedVariant === "table-only") {
    return <div className="@container min-w-0">{table}</div>;
  }

  return (
    <GovernedListSurface model={surface} rowCount={rows.length}>
      <div className="@container min-w-0">{table}</div>
    </GovernedListSurface>
  );
}
