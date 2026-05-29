import "server-only"

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedListSurface,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { HrmReviewCycleRow } from "./performance.queries.server"
import type { HrmReviewPipeline } from "../schemas/performance.schema"

type PerformanceCycleListCopy = {
  eyebrow: string
  title: string
  description: string
  empty: string
  colName: string
  colPeriod: string
  colState: string
  colPipeline: string
  formatPeriod: (start: Date, end: Date) => string
  formatPipeline: (pipeline: HrmReviewPipeline) => string
}

type PerformanceCycleListContext = {
  canUpdate: boolean
  readOnlyUpdateReason: string
}

function cycleActionsVisible(
  row: HrmReviewCycleRow,
  canUpdate: boolean
): boolean {
  if (!canUpdate) return false
  return row.state === "draft" || row.state === "active"
}

export function buildPerformanceCycleListSurfaceConfiguration(
  rows: readonly HrmReviewCycleRow[],
  copy: PerformanceCycleListCopy,
  context: PerformanceCycleListContext
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hrm",
      object: "performance",
      function: "read",
    },
    surface: {
      header: {
        eyebrow: copy.eyebrow,
        title: copy.title,
        description: copy.description,
      },
      columnsId: "hrm-performance-cycles",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "name", header: copy.colName },
      { id: "period", header: copy.colPeriod },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "pipeline", header: copy.colPipeline },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowTone:
        row.state === "draft" || row.state === "active"
          ? "attention"
          : "default",
      cells: {
        name: row.name,
        period: copy.formatPeriod(row.periodStart, row.periodEnd),
        state: row.state,
        pipeline: copy.formatPipeline(row.reviewPipeline),
      },
      trailingAction: cycleActionsVisible(row, context.canUpdate)
        ? resolveListSurfaceRowTrailingAction({
            visible: true,
            allowed: context.canUpdate,
            disabledReason: context.readOnlyUpdateReason,
            descriptor: {
              id: "erp.hrm.performance.cycle.manage",
              label: "Manage cycle",
              intent: "default",
            },
          })
        : listSurfaceRowTrailingActionHidden(),
    })),
  })
}
