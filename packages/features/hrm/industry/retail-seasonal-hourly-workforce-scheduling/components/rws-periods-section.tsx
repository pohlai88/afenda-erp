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

import { listRwsSchedulePeriodsForOrg } from "../data/rws-periods.server"
import { listRwsStoreChoicesForOrg } from "../data/rws-stores.server"
import { buildRwsPeriodsListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"
import { RwsPeriodCreateDialog } from "./rws-period-create-dialog.client"
import { RwsPeriodPublishDialog } from "./rws-period-publish-dialog.client"

export async function RwsPeriodsSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const [rows, storeChoices] = await Promise.all([
    listRwsSchedulePeriodsForOrg(organizationId),
    listRwsStoreChoicesForOrg(organizationId),
  ])

  const draftPeriods = rows.filter((p) => p.state === "draft")

  const listConfiguration = buildRwsPeriodsListSurfaceConfiguration(rows, {
    empty: t("periodsEmpty"),
    colCode: t("colCode"),
    colName: t("colName"),
    colStore: t("colStore"),
    colKind: t("colKind"),
    colState: t("colState"),
    colRange: t("colRange"),
    stateLabel: (state) => t(`periodStateLabels.${state}`),
    kindLabel: (kind) => t(`periodKindLabels.${kind}`),
  })

  return (
    <Card size="sm" id="rws-periods-section" data-testid="rws-periods-section">
      <CardHeader>
        <CardTitle>{t("periodsTitle")}</CardTitle>
        <CardDescription>{t("periodsDescription")}</CardDescription>
        {canManage ? (
          <CardAction className="flex flex-wrap gap-2">
            <RwsPeriodCreateDialog storeChoices={storeChoices} periods={rows} />
            <RwsPeriodPublishDialog draftPeriods={draftPeriods} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.periods}
        />
      </CardContent>
    </Card>
  )
}
