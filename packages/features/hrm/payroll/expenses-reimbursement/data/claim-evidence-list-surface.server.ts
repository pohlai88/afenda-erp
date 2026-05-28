import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { ClaimEvidenceRow } from "./claim.queries.server"

type ClaimEvidenceListCopy = {
  empty: string
  colDocument: string
  colType: string
  colUploaded: string
  colSize: string
  formatUploadedAt: (date: Date) => string
  formatSize: (bytes: number) => string
}

export function buildClaimEvidenceListSurfaceConfiguration(
  rows: readonly ClaimEvidenceRow[],
  copy: ClaimEvidenceListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    surface: {
      header: { title: "hrm-claim-evidence" },
      columnsId: "hrm-claim-evidence",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "document",
        header: copy.colDocument,
        cellKind: { kind: "link" },
      },
      {
        id: "type",
        header: copy.colType,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "uploaded",
        header: copy.colUploaded,
        cellKind: { kind: "datetime" },
      },
      { id: "size", header: copy.colSize, align: "end" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        document: row.documentTitle,
        type: row.evidenceType,
        uploaded: copy.formatUploadedAt(row.uploadedAt),
        size: copy.formatSize(row.documentSizeBytes),
      },
      rowHref: row.documentBlobUrl,
      linkColumnId: "document",
    })),
  })
}
