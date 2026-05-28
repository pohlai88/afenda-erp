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

import { listRwsLaborDemandReferencesForOrg } from "../data/rws-demand.server"
import { listRwsSchedulePeriodsForOrg } from "../data/rws-periods.server"
import { listRwsStoreChoicesForOrg } from "../data/rws-stores.server"
import { buildRwsDemandReferencesListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"
import { RwsDemandCreateDialog } from "./rws-demand-create-dialog.client"

export async function RwsDemandSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const [rows, periods, storeChoices] = await Promise.all([
    listRwsLaborDemandReferencesForOrg(organizationId),
    listRwsSchedulePeriodsForOrg(organizationId),
    listRwsStoreChoicesForOrg(organizationId),
  ])

  const listConfiguration = buildRwsDemandReferencesListSurfaceConfiguration(
    rows,
    {
      empty: t("demandEmpty"),
      colStore: t("colStore"),
      colKind: t("colKind"),
      colExternal: t("colExternalRef"),
      colNotes: t("colNotes"),
      kindLabel: (kind) => t(`demandKindLabels.${kind}`),
    }
  )

  return (
    <Card size="sm" data-testid="rws-demand-section">
      <CardHeader>
        <CardTitle>{t("demandTitle")}</CardTitle>
        <CardDescription>{t("demandDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <RwsDemandCreateDialog periods={periods} storeChoices={storeChoices} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.demandReferences}
        />
      </CardContent>
    </Card>
  )
}
