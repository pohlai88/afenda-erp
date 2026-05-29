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

import { listRwsStoresForOrg } from "../data/rws-stores.server"
import { buildRwsStoresListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"
import { RwsStoreCreateDialog } from "./rws-store-create-dialog.client"

export async function RwsStoresSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const rows = await listRwsStoresForOrg(organizationId)

  const listConfiguration = buildRwsStoresListSurfaceConfiguration(rows, {
    empty: t("storesEmpty"),
    colCode: t("colCode"),
    colName: t("colName"),
    colBranch: t("colBranch"),
    colActive: t("colActive"),
    activeLabel: (active) => (active ? t("activeYes") : t("activeNo")),
  })

  return (
    <Card size="sm" id="rws-stores-section" data-testid="rws-stores-section">
      <CardHeader>
        <CardTitle>{t("storesTitle")}</CardTitle>
        <CardDescription>{t("storesDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <RwsStoreCreateDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.stores}
        />
      </CardContent>
    </Card>
  )
}
