import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listRwsLaborBudgetSnapshotsForOrg } from "../data/rws-budget.server"
import { listRwsSchedulePeriodsForOrg } from "../data/rws-periods.server"
import { listRwsStoreChoicesForOrg } from "../data/rws-stores.server"
import { buildRwsBudgetSnapshotsListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"
import { RwsBudgetUpsertDialog } from "./rws-budget-upsert-dialog.client"

export async function RwsBudgetSection({
  organizationId,
  canManage,
  canViewLaborCost,
}: {
  organizationId: string
  canManage: boolean
  canViewLaborCost: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const [rows, periods, storeChoices] = await Promise.all([
    listRwsLaborBudgetSnapshotsForOrg(organizationId),
    listRwsSchedulePeriodsForOrg(organizationId),
    listRwsStoreChoicesForOrg(organizationId),
  ])

  const listConfiguration = buildRwsBudgetSnapshotsListSurfaceConfiguration(
    rows,
    {
      empty: t("budgetEmpty"),
      colStore: t("colStore"),
      colAmount: t("colAmount"),
      colCurrency: t("colCurrency"),
      colNotes: t("colNotes"),
    }
  )

  return (
    <Card size="sm" data-testid="rws-budget-section">
      <CardHeader>
        <CardTitle>{t("budgetTitle")}</CardTitle>
        <CardDescription>
          {canViewLaborCost
            ? t("budgetDescription")
            : t("budgetDescriptionNoCost")}
        </CardDescription>
        {canManage ? (
          <CardAction>
            <RwsBudgetUpsertDialog periods={periods} storeChoices={storeChoices} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.budgetSnapshots}
        />
      </CardContent>
    </Card>
  )
}
