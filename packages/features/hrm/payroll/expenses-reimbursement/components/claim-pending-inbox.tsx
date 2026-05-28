import { getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import { buildClaimPendingListSurfaceConfiguration } from "../data/claim-pending-list-surface.server"
import {
  type ClaimRow,
  listPendingClaimApprovalsForActor,
  listPendingClaimApprovalsForOrg,
} from "../data/claim.queries.server"

import { ClaimDecisionTrailingCell } from "./claim-decision-trailing-cell.client"

type ClaimPendingInboxProps = {
  orgSlug: string
  canManage: boolean
  workbenchFocus?: string | null
}

function claimPendingStateLabels(
  t: Awaited<ReturnType<typeof getTranslations<"Erp.Hrm.claims">>>
) {
  return {
    draft: t("state.draft"),
    submitted: t("state.submitted"),
    under_review: t("state.under_review"),
    returned: t("state.returned"),
    approved: t("state.approved"),
    rejected: t("state.rejected"),
    cancelled: t("state.cancelled"),
    paid: t("state.paid"),
  } as const
}

export async function ClaimPendingInbox({
  orgSlug,
  canManage,
  workbenchFocus,
}: ClaimPendingInboxProps) {
  const orgSession = await requireOrgSession()

  const [t, rowsResult] = await Promise.all([
    getTranslations("Erp.Hrm.claims"),
    (async (): Promise<
      | { ok: true; rows: ReadonlyArray<ClaimRow> }
      | { ok: false; error: unknown }
    > => {
      try {
        const rows = canManage
          ? await listPendingClaimApprovalsForOrg(orgSession.organizationId)
          : await listPendingClaimApprovalsForActor(
              orgSession.organizationId,
              orgSession.userId
            )
        return { ok: true, rows }
      } catch (error) {
        return { ok: false, error }
      }
    })(),
  ])

  const copy = {
    columnsId: "hrm-claims-pending",
    empty: t("inboxEmpty"),
    colEmployee: t("colEmployee"),
    colClaimType: t("colClaimType"),
    colClaimDate: t("colClaimDate"),
    colAmount: t("colAmount"),
    colEvidence: t("colEvidence"),
    colSubmitted: t("colSubmitted"),
    evidenceCountLabel: (count: number) => t("evidenceCount", { count }),
    stateLabels: claimPendingStateLabels(t),
  }

  let listConfiguration = buildClaimPendingListSurfaceConfiguration(
    [],
    orgSlug,
    copy
  )
  let surfaceKey = "hrm:claims:pending-inbox"
  let loadError: { variant: "error"; title: string } | undefined

  if (!rowsResult.ok) {
    logUnexpectedServerError(
      "claim-pending-inbox: query failed",
      rowsResult.error,
      {
        organizationId: orgSession.organizationId,
      }
    )
    surfaceKey = "hrm:claims:pending:error"
    loadError = {
      variant: "error",
      title: t("inboxLoadFailed"),
    }
  } else {
    const filteredRows = rowsResult.rows.filter((row) =>
      matchesGovernedWorkbenchFocus(
        workbenchFocus,
        row.employeeFullName,
        row.employeeId,
        row.claimTypeCode,
        row.claimDate,
        row.amount,
        row.currency
      )
    )
    listConfiguration = buildClaimPendingListSurfaceConfiguration(
      filteredRows,
      orgSlug,
      copy,
      {
        workbenchFocusSearch: {
          label: t("toolbarSearchLabel"),
          placeholder: t("toolbarSearchPlaceholder"),
          value: workbenchFocus,
        },
      }
    )
  }

  const rows = rowsResult.ok ? rowsResult.rows : []
  const showActions = canManage || rows.length > 0
  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey={surfaceKey}
      resolveConfiguredPermission={false}
      loadError={loadError}
      invalid={{
        variant: "error",
        title: t("inboxLoadFailed"),
      }}
      trailingColumn={
        showActions
          ? {
              header: t("colActions"),
              Cell: ClaimDecisionTrailingCell,
              context: {
                claims: rows.map((row) => ({
                  id: row.id,
                  employeeId: row.employeeId,
                  employeeFullName: row.employeeFullName,
                  claimTypeCode: row.claimTypeCode,
                  amount: row.amount,
                  currency: row.currency,
                })),
              },
            }
          : undefined
      }
    />
  )
}
