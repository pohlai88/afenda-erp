import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { JobOfferRow } from "./recruitment.queries.server"
import { RECRUITMENT_READ_PERMISSION } from "./recruitment-list-surface.shared"

type RecruitmentOffersListCopy = {
  empty: string
  colCandidate: string
  colRole: string
  colCompensation: string
  colStatus: string
  formatCompensation: (row: JobOfferRow) => string
  statusLabel: (status: JobOfferRow["status"]) => string
}

export function buildRecruitmentOffersListSurfaceConfiguration(
  rows: readonly JobOfferRow[],
  copy: RecruitmentOffersListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    requiresErpPermission: RECRUITMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-recruitment-offers" },
      columnsId: "hrm-recruitment-offers",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "candidate", header: copy.colCandidate },
      { id: "role", header: copy.colRole },
      { id: "compensation", header: copy.colCompensation },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        candidate: row.candidateName,
        role: row.requisitionTitle,
        compensation: copy.formatCompensation(row),
        status: copy.statusLabel(row.status),
      },
      trailingAction: {
        state: "ready",
        descriptor: { id: "offer-actions", label: "Actions" },
      },
    })),
  })
}
