import "server-only"

import type { Route } from "next"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeLinkCellKind } from "@afenda/feature-hrm-core/shared"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import type { KpiGoalRow } from "./kpi-goal.queries.server"

const KPI_READ_PERMISSION = {
  module: "hrm" as const,
  object: "kpi" as const,
  function: "read" as const,
}

type KpiGoalsListCopy = {
  empty: string
  colTitle: string
  colOwner: string
  colStatus: string
  colDue: string
  colProgress: string
  formatDue: (dueDate: Date) => string
}

export function buildKpiGoalDetailHref(
  orgSlug: string,
  goalId: string,
  goalStatusFilter?: string
): Route {
  const base = organizationHrmPath(orgSlug, "kpi")
  const params = new URLSearchParams({ tab: "goals", goalId })
  if (
    goalStatusFilter &&
    goalStatusFilter !== "all" &&
    (goalStatusFilter === "in_progress" ||
      goalStatusFilter === "completed" ||
      goalStatusFilter === "closed")
  ) {
    params.set("goalStatus", goalStatusFilter)
  }
  return `${base}?${params.toString()}` as Route
}

export function buildKpiGoalsListSurfaceConfiguration(
  goals: readonly KpiGoalRow[],
  orgSlug: string,
  copy: KpiGoalsListCopy,
  goalStatusFilter?: string
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: KPI_READ_PERMISSION,
    surface: {
      header: { title: "hrm-kpi-goals" },
      columnsId: "hrm-kpi-goals",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "owner", header: copy.colOwner },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "due", header: copy.colDue },
      { id: "progress", header: copy.colProgress },
    ],
    rows: goals.map((goal) => ({
      id: goal.id,
      rowHref: buildKpiGoalDetailHref(orgSlug, goal.id, goalStatusFilter),
      cellKinds: {
        owner: hrmEmployeeLinkCellKind(orgSlug, goal.ownerEmployeeId),
      },
      cells: {
        title: goal.title,
        owner: goal.ownerLegalName,
        status: goal.status,
        due: copy.formatDue(goal.dueDate),
        progress: `${goal.percentComplete}%`,
      },
    })),
  })
}
