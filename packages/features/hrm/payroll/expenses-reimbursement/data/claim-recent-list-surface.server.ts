import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"
import { organizationHrmClaimPath } from "../../../_core/shared"

import {
  CLAIM_LIST_READ_PERMISSION,
  mapClaimRowToListSurfaceRow,
  type ClaimListStateLabels,
} from "./claim-list-surface-rows.shared"
import type { ClaimRow } from "./claim.queries.server"

type ClaimRecentListCopy = {
  pageTitle: string
  pageDescription: string
  empty: string
  colEmployee: string
  colClaimType: string
  colClaimDate: string
  colAmount: string
  colState: string
  colSubmitted: string
  stateLabels: ClaimListStateLabels
}

export function buildClaimRecentListSurfaceConfiguration(
  rows: readonly ClaimRow[],
  orgSlug: string,
  copy: ClaimRecentListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: CLAIM_LIST_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "claimSearch",
          label: "Search claims",
          placeholder: "Search employee, type, or state",
        },
        filters: [
          {
            id: "claim-state",
            label: copy.colState,
            param: "claimState",
            options: Object.entries(copy.stateLabels).map(([value, label]) => ({
              label,
              value,
            })),
          },
        ],
        sort: {
          label: "Sort",
          param: "claimSort",
          options: [
            {
              label: copy.colSubmitted,
              value: "submitted-desc",
              columnId: "submitted",
              direction: "desc",
            },
            {
              label: copy.colAmount,
              value: "amount-desc",
              columnId: "amount",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Claims view",
          activeLabel: copy.pageTitle,
          href: "?claimSort=submitted-desc",
        },
        bulkActions: [
          {
            actionId: "erp.hrm.claim.review-selected",
            label: "Review selected",
            disabledReason:
              "Select claims to review evidence and policy status.",
          },
        ],
      },
      selection: {
        mode: "multiple",
        label: "Select claims",
        bulkScopeLabel: "selected claims",
      },
      decisionLedger: { enabled: true, label: "Claim decision" },
    },
    surface: {
      header: {
        eyebrow: copy.pageTitle,
        title: copy.pageTitle,
        description: copy.pageDescription,
      },
      columnsId: "hrm-claims-recent",
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
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
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
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "submitted",
        header: copy.colSubmitted,
        cellKind: { kind: "datetime" },
      },
    ],
    rows: rows.map((row) => ({
      ...mapClaimRowToListSurfaceRow({
        row,
        rowHref: organizationHrmClaimPath(orgSlug, row.id),
        linkColumnId: "employee",
        stateLabels: copy.stateLabels,
        formatEvidenceCount: () => "",
      }),
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
    })),
  })
}
