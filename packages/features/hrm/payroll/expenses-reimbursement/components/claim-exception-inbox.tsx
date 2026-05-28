import { getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import { buildClaimExceptionListSurfaceConfiguration } from "../data/claim-exception-list-surface.server"
import {
  type ClaimRow,
  listExceptionPendingClaimsForOrg,
} from "../data/claim.queries.server"

import { ClaimDecisionTrailingCell } from "./claim-decision-trailing-cell.client"

type ClaimExceptionInboxProps = {
  orgSlug: string
  workbenchFocus?: string | null
}

function claimExceptionStateLabels(
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

export async function ClaimExceptionInbox({
  orgSlug,
  workbenchFocus,
}: ClaimExceptionInboxProps) {
  const orgSession = await requireOrgSession()

  const [t, rowsResult] = await Promise.all([
    getTranslations("Erp.Hrm.claims"),
    (async (): Promise<
      | { ok: true; rows: ReadonlyArray<ClaimRow> }
      | { ok: false; error: unknown }
    > => {
      try {
        const rows = await listExceptionPendingClaimsForOrg(
          orgSession.organizationId
        )
        return { ok: true, rows }
      } catch (error) {
        return { ok: false, error }
      }
    })(),
  ])

  const copy = {
    columnsId: "hrm-claims-exception",
    empty: t("exceptionQueueEmpty"),
    colEmployee: t("colEmployee"),
    colClaimType: t("colClaimType"),
    colClaimDate: t("colClaimDate"),
    colAmount: t("colAmount"),
    colEvidence: t("colEvidence"),
    colSubmitted: t("colSubmitted"),
    evidenceCountLabel: (count: number) => t("evidenceCount", { count }),
    stateLabels: claimExceptionStateLabels(t),
  }

  let listConfiguration = buildClaimExceptionListSurfaceConfiguration(
    [],
    orgSlug,
    copy
  )
  let surfaceKey = "hrm:claims:exception-inbox"
  let loadError: { variant: "error"; title: string } | undefined

  if (!rowsResult.ok) {
    logUnexpectedServerError(
      "claim-exception-inbox: query failed",
      rowsResult.error,
      { organizationId: orgSession.organizationId }
    )
    surfaceKey = "hrm:claims:exception:error"
    loadError = {
      variant: "error",
      title: t("exceptionQueueLoadFailed"),
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
    listConfiguration = buildClaimExceptionListSurfaceConfiguration(
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
        title: t("exceptionQueueLoadFailed"),
      }}
      trailingColumn={{
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
      }}
    />
  )
}
