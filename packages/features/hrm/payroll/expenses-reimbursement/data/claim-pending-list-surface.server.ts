import "server-only"

import {
  buildGovernedListSurface,
  governedWorkbenchFocusPresentationPatch,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import {
  CLAIM_LIST_READ_PERMISSION,
  mapClaimRowToListSurfaceRow,
} from "./claim-list-surface-rows.shared"
import type { ClaimRow } from "./claim.queries.server"
import type { ClaimListStateLabels } from "./claim-list-surface-rows.shared"

type ClaimPendingListCopy = {
  columnsId: string
  empty: string
  colEmployee: string
  colClaimType: string
  colClaimDate: string
  colAmount: string
  colEvidence: string
  colSubmitted: string
  evidenceCountLabel: (count: number) => string
  stateLabels: ClaimListStateLabels
}

export function buildClaimPendingListSurfaceConfiguration(
  rows: readonly ClaimRow[],
  orgSlug: string,
  copy: ClaimPendingListCopy,
  options?: {
    workbenchFocusSearch?: {
      label: string
      placeholder?: string
      value?: string | null
    }
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    presentation: options?.workbenchFocusSearch
      ? governedWorkbenchFocusPresentationPatch(options.workbenchFocusSearch)
      : undefined,
    requiresErpPermission: CLAIM_LIST_READ_PERMISSION,
    surface: {
      header: {
        eyebrow: "Claims",
        title: "Pending approvals",
        description: "Submitted claims awaiting a decision.",
      },
      columnsId: copy.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: { kind: "link" },
      },
      {
        id: "claimType",
        header: copy.colClaimType,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "claimDate",
        header: copy.colClaimDate,
        cellKind: { kind: "date" },
      },
      { id: "amount", header: copy.colAmount },
      { id: "evidence", header: copy.colEvidence },
      {
        id: "submitted",
        header: copy.colSubmitted,
        cellKind: { kind: "datetime" },
      },
    ],
    rows: rows.map((row) => ({
      ...mapClaimRowToListSurfaceRow({
        row,
        stateLabels: copy.stateLabels,
        formatEvidenceCount: copy.evidenceCountLabel,
      }),
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
    })),
  })
}
