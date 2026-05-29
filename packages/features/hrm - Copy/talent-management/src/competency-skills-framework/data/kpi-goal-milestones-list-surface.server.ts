import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

const KPI_READ_PERMISSION = {
  module: "hrm" as const,
  object: "kpi" as const,
  function: "read" as const,
}

export type KpiGoalMilestoneListRow = {
  readonly id: string
  readonly title: string
}

type KpiGoalMilestonesListCopy = {
  empty: string
  colTitle: string
}

export function buildKpiGoalMilestonesListSurfaceConfiguration(
  milestones: readonly KpiGoalMilestoneListRow[],
  copy: KpiGoalMilestonesListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: KPI_READ_PERMISSION,
    surface: {
      header: { title: "hrm-kpi-goal-milestones" },
      columnsId: "hrm-kpi-goal-milestones",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [{ id: "title", header: copy.colTitle }],
    rows: milestones.map((milestone) => ({
      id: milestone.id,
      cells: { title: milestone.title },
      trailingAction: { state: "ready" as const },
    })),
  })
}
