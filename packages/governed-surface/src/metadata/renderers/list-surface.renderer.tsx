import { GovernedListSurface } from "../../components/governed-list-surface"
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
} from "../../schemas/list-surface-renderer.schema"

import type { ListSurfaceTableClientProps } from "./list-surface-table.client"
import { ListSurfaceTable } from "./list-surface-table"

export type ListSurfaceRendererProps = {
  configuration: unknown
  variant?: "full" | "table-only"
}

export function ListSurfaceRenderer({
  configuration,
  variant,
}: ListSurfaceRendererProps) {
  const parsed = parseListSurfaceRendererConfiguration(configuration)
  if (!parsed.success) {
    return null
  }

  const config: ListSurfaceRendererConfiguration = parsed.data
  const { surface, columns, rows, presentation, pagination } = config
  const resolvedVariant = variant ?? presentation?.variant ?? "full"
  const tableDensity = presentation?.tableDensity ?? "compact"

  const tableProps = {
    columns,
    rows,
    surfaceKey: surface.columnsId,
    columnsId: surface.columnsId,
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
  } satisfies ListSurfaceTableClientProps

  const table = <ListSurfaceTable {...tableProps} />

  if (resolvedVariant === "table-only") {
    return <div className="@container min-w-0">{table}</div>
  }

  return (
    <GovernedListSurface model={surface} rowCount={rows.length}>
      <div className="@container min-w-0">{table}</div>
    </GovernedListSurface>
  )
}
