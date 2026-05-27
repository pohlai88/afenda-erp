"use client"

import {
  GovernedListSurfaceWithTrailingColumn,
  type ListSurfaceTableTrailingColumn,
} from "../metadata/index"

import type { EmptyState } from "../schemas/list-surface.schema"
import type {
  ListSurfaceRendererConfiguration,
  ListSurfaceRow,
} from "../schemas/list-surface-renderer.schema"
import type { ListColumn } from "../schemas/list-surface.schema"

import {
  resolveGovernedTrailingColumn,
  type GovernedPatternCTrailingColumnSpec,
} from "./governed-list-trailing-cell-registry.client"

export type GovernedPatternCListTableHostProps = {
  surfaceKey: string
  config: ListSurfaceRendererConfiguration
  trailingColumn?: GovernedPatternCTrailingColumnSpec
  contentBeforeList?: React.ReactNode
  contentAfterList?: React.ReactNode
}

function toTableTrailingColumn(
  spec: GovernedPatternCTrailingColumnSpec | undefined
): ListSurfaceTableTrailingColumn | undefined {
  if (!spec) {
    return undefined
  }
  const resolved = resolveGovernedTrailingColumn(spec)
  return {
    header: resolved.header,
    Cell: resolved.Cell,
    context: resolved.context,
  }
}

export function GovernedPatternCListTableHost({
  surfaceKey,
  config,
  trailingColumn,
  contentBeforeList,
  contentAfterList,
}: GovernedPatternCListTableHostProps) {
  const tableDensity = config.presentation?.tableDensity ?? "compact"
  const presentationVariant = config.presentation?.variant ?? "table-only"
  const tableTrailing = toTableTrailingColumn(trailingColumn)

  return (
    <>
      {contentBeforeList}
      <GovernedListSurfaceWithTrailingColumn
        surfaceKey={surfaceKey}
        columnsId={config.surface.columnsId}
        dataNature={config.dataNature}
        presentationVariant={presentationVariant}
        columns={config.columns as readonly ListColumn[]}
        rows={config.rows as readonly ListSurfaceRow[]}
        empty={config.surface.empty as EmptyState | undefined}
        trailingColumn={tableTrailing}
        density={tableDensity}
        stickyHeader={config.presentation?.stickyHeader}
        virtualizeRowThreshold={config.presentation?.virtualizeRowThreshold}
        toolbar={config.presentation?.toolbar}
        pagination={config.pagination}
      />
      {contentAfterList}
    </>
  )
}
