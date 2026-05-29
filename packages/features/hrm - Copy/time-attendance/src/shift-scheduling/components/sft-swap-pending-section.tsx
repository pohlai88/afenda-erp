import { getFormatter, getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildSftEmbeddedListSurfaceErrorConfiguration } from "../data/sft-embedded-list-surface-error.server"
import { buildSftSwapPendingListSurfaceConfiguration } from "../data/sft-surface-builders.server"
import { listPendingShiftSwapRequests } from "../data/sft-swap.queries.server"
import { SFT_LIST_SURFACE_IDS } from "../data/sft-surface-metadata.shared"
import { SftSwapDecisionTrailingCell } from "./sft-swap-decision-trailing-cell.client"

export async function SftSwapPendingSection({
  orgSlug,
  organizationId,
  canManage,
  workbenchFocus,
}: {
  orgSlug: string
  organizationId: string
  canManage: boolean
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.shiftScheduling")
  const format = await getFormatter()

  if (!canManage) {
    return null
  }

  let rows: Awaited<ReturnType<typeof listPendingShiftSwapRequests>>
  try {
    rows = await listPendingShiftSwapRequests(organizationId)
  } catch (err) {
    logUnexpectedServerError("sft-swap-pending: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("swapPendingTitle")}</CardTitle>
          <CardDescription>{t("swapPendingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={buildSftEmbeddedListSurfaceErrorConfiguration({
              columnsId: SFT_LIST_SURFACE_IDS.swapPending,
              emptyTitle: t("swapPendingEmpty"),
              firstColumn: { id: "requester", header: t("colRequester") },
            })}
            surfaceKey="hrm:shift-scheduling:swap-pending:error"
            resolveConfiguredPermission={false}
            loadError={{ variant: "error", title: t("swapPendingLoadFailed") }}
          />
        </CardContent>
      </Card>
    )
  }

  const filteredRows = rows.filter((row) =>
    matchesGovernedWorkbenchFocus(
      workbenchFocus,
      row.requesterName,
      row.requesterNumber,
      row.counterpartyName,
      row.requesterDate,
      row.counterpartyDate,
      row.requesterTemplateCode,
      row.counterpartyTemplateCode,
      row.reason
    )
  )

  const listConfiguration = buildSftSwapPendingListSurfaceConfiguration(
    filteredRows,
    orgSlug,
    {
      empty: t("swapPendingEmpty"),
      colRequester: t("colRequester"),
      colCounterparty: t("colCounterparty"),
      colDates: t("colDates"),
      colShifts: t("colShifts"),
      colReason: t("colReason"),
      colRequested: t("colRequested"),
      actionLabel: t("swapDecideAction"),
      formatRequestedAt: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      workbenchFocusSearch: {
        label: t("swapPendingToolbarSearchLabel"),
        placeholder: t("swapPendingToolbarSearchPlaceholder"),
        value: workbenchFocus,
      },
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("swapPendingTitle")}</CardTitle>
        <CardDescription>{t("swapPendingDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={SFT_LIST_SURFACE_IDS.swapPending}
          invalid={{
            variant: "error",
            title: t("swapPendingLoadFailed"),
          }}
          trailingColumn={{
            header: t("colActions"),
            Cell: SftSwapDecisionTrailingCell,
            context: {
              swaps: filteredRows.map((row) => ({ id: row.id })),
            },
          }}
          data-testid={`governed-list-section:${SFT_LIST_SURFACE_IDS.swapPending}`}
        />
      </CardContent>
    </Card>
  )
}
