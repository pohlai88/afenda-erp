import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import {
  listRwsOpenShiftClaimChoices,
  listRwsOpenShiftOffersForOrg,
} from "../data/rws-open-shift.server"
import { listRwsSchedulePeriodsForOrg } from "../data/rws-periods.server"
import { listRwsStoreChoicesForOrg } from "../data/rws-stores.server"
import { buildRwsOpenShiftsListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"
import { RwsOpenShiftCreateDialog } from "./rws-open-shift-create-dialog.client"
import { RwsOpenShiftClaimTrailingCell } from "./rws-open-shift-claim-trailing-cell.client"

export async function RwsOpenShiftsSection({
  organizationId,
  canManage,
  canClaim,
}: {
  organizationId: string
  canManage: boolean
  canClaim: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const [rows, periods, storeChoices, claimChoices] = await Promise.all([
    listRwsOpenShiftOffersForOrg(organizationId),
    listRwsSchedulePeriodsForOrg(organizationId),
    listRwsStoreChoicesForOrg(organizationId),
    canClaim ? listRwsOpenShiftClaimChoices(organizationId) : null,
  ])
  const draftPeriods = periods.filter((p) => p.state === "draft")

  const claimableRows = rows.filter(
    (row) => row.status === "open" || row.status === "pending_approval"
  )

  const listConfiguration = buildRwsOpenShiftsListSurfaceConfiguration(rows, {
    empty: t("openShiftsEmpty"),
    colStore: t("colStore"),
    colDate: t("colDate"),
    colRole: t("colRole"),
    colClaimMode: t("colClaimMode"),
    colStatus: t("colStatus"),
    statusLabel: (status) => t(`openShiftStatusLabels.${status}`),
    claimActionLabel: t("openShiftClaimAction"),
    canClaim,
  })

  return (
    <Card
      size="sm"
      id="rws-open-shifts-section"
      data-testid="rws-open-shifts-section"
    >
      <CardHeader>
        <CardTitle>{t("openShiftsTitle")}</CardTitle>
        <CardDescription>{t("openShiftsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <RwsOpenShiftCreateDialog
              draftPeriods={draftPeriods}
              storeChoices={storeChoices}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.openShifts}
          invalid={{
            variant: "error",
            title: t("openShiftsLoadFailed"),
          }}
          trailingColumn={
            canClaim && claimChoices
              ? {
                  header: t("colActions"),
                  Cell: RwsOpenShiftClaimTrailingCell,
                  context: {
                    offers: claimableRows.map((row) => ({ id: row.id })),
                    employees: claimChoices.employees,
                    templates: claimChoices.templates,
                  },
                }
              : undefined
          }
          data-testid={`governed-list-section:${RWS_LIST_SURFACE_IDS.openShifts}`}
        />
      </CardContent>
    </Card>
  )
}
