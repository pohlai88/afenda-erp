import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { RecruitmentOperationalReportRow } from "./recruitment.queries.server"
import { RECRUITMENT_READ_PERMISSION } from "./recruitment-list-surface.shared"

type RecruitmentReportListCopy = {
  empty: string
  colArea: string
  colCount: string
  colStatus: string
  areaLabel: (row: RecruitmentOperationalReportRow) => string
  statusLabel: (row: RecruitmentOperationalReportRow) => string
}

export function buildRecruitmentReportListSurfaceConfiguration(
  rows: readonly RecruitmentOperationalReportRow[],
  copy: RecruitmentReportListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    requiresErpPermission: RECRUITMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-recruitment-operational-report" },
      columnsId: "hrm-recruitment-operational-report",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "area", header: copy.colArea },
      { id: "count", header: copy.colCount, align: "end" },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        area: copy.areaLabel(row),
        count: row.count,
        status: copy.statusLabel(row),
      },
    })),
  })
}
