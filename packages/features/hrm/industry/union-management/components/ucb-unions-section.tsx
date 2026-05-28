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

import { listUcbUnionsForOrg } from "../data/ucb-union.server"
import { buildUcbUnionsListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"
import { UcbUnionFormDialog } from "./ucb-union-form.client"

export async function UcbUnionsSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbUnionsForOrg(organizationId)

  const listConfiguration = buildUcbUnionsListSurfaceConfiguration(rows, {
    empty: t("unionsEmpty"),
    colCode: t("colCode"),
    colName: t("colName"),
    colStatus: t("colStatus"),
    colRep: t("colRepresentative"),
  })

  return (
    <Card size="sm" id="ucb-unions-section" data-testid="ucb-unions-section">
      <CardHeader>
        <CardTitle>{t("unionsTitle")}</CardTitle>
        <CardDescription>{t("unionsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <UcbUnionFormDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.unions}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.unions}`}
        />
      </CardContent>
    </Card>
  )
}
