import "server-only"

import {
  buildGovernedListSurface,
  governedWorkbenchFocusPresentationPatch,
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

type ClaimExceptionListCopy = {
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

export function buildClaimExceptionListSurfaceConfiguration(
  rows: readonly ClaimRow[],
  orgSlug: string,
  copy: ClaimExceptionListCopy,
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
    presentationProfile: "erp-analytical-table",
    presentation: governedWorkbenchFocusPresentationPatch(
      options?.workbenchFocusSearch ?? {
        label: "Search claim exceptions",
        placeholder: "Search employee, claim type, or evidence",
      },
      {
        primaryColumnId: "employee",
        ...(rows.length > 0
          ? {
              grouping: {
                groups: [
                  {
                    id: "claims-policy-exceptions",
                    label: "Policy exceptions",
                    rowIds: rows.map((row) => row.id),
                  },
                ],
              },
              summary: {
                rows: [
                  {
                    id: "claim-exception-total",
                    label: "Total",
                    cells: {
                      employee: `${rows.length}`,
                      amount: `${rows.length} exceptions`,
                      evidence: `${rows.reduce(
                        (total, row) => total + row.evidenceCount,
                        0
                      )} evidence files`,
                    },
                  },
                ],
              },
            }
          : {}),
        toolbar: {
          filters: [
            {
              id: "claim-exception-type",
              label: copy.colClaimType,
              param: "claimType",
              options:
                rows.length > 0
                  ? Array.from(new Set(rows.map((row) => row.claimTypeCode)))
                      .sort()
                      .map((value) => ({ label: value, value }))
                  : [{ label: "All types", value: "all" }],
            },
            {
              id: "claim-evidence",
              label: copy.colEvidence,
              param: "claimEvidence",
              options: [
                { label: "Evidence attached", value: "attached" },
                { label: "Evidence missing", value: "missing" },
              ],
            },
          ],
          sort: {
            label: "Sort",
            param: "claimExceptionSort",
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
            label: "Exception view",
            activeLabel: "Policy exceptions",
            href: "?claimEvidence=missing",
          },
          export: {
            actionId: "erp.hrm.claim.exception.export",
            label: "Export exceptions",
            formats: ["csv"],
          },
          bulkActions: [
            {
              actionId: "erp.hrm.claim.exception.review-selected",
              label: "Review selected",
              disabledReason:
                "Select claim exceptions before running a review action.",
            },
          ],
        },
      }
    ),
    requiresErpPermission: CLAIM_LIST_READ_PERMISSION,
    surface: {
      header: {
        eyebrow: "Claims",
        title: "Policy exceptions",
        description:
          "Submitted claims that require exception approval before payout.",
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
        rowHref: organizationHrmClaimPath(orgSlug, row.id),
        linkColumnId: "employee",
        stateLabels: copy.stateLabels,
        formatEvidenceCount: copy.evidenceCountLabel,
      }),
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
    })),
  })
}
