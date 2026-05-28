import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { RecruitmentEventRow } from "./recruitment.queries.server"
import { RECRUITMENT_READ_PERMISSION } from "./recruitment-list-surface.shared"

type RecruitmentEventsListCopy = {
  empty: string
  colEvent: string
  colWhen: string
  formatEvent: (row: RecruitmentEventRow) => string
  formatWhen: (value: Date) => string
}

export function buildRecruitmentEventsListSurfaceConfiguration(
  rows: readonly RecruitmentEventRow[],
  copy: RecruitmentEventsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    requiresErpPermission: RECRUITMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-recruitment-events" },
      columnsId: "hrm-recruitment-events",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "event", header: copy.colEvent },
      { id: "when", header: copy.colWhen, align: "end" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        event: copy.formatEvent(row),
        when: copy.formatWhen(row.createdAt),
      },
    })),
  })
}
