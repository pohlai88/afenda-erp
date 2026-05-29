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

import { listSuccessionCriticalRolesForOrg } from "../data/succession-critical-roles.server"
import { buildSuccessionCriticalRolesListSurfaceConfiguration } from "../data/succession-surface-builders.server"
import { SUCCESSION_LIST_SURFACE_IDS } from "../data/succession-surface-metadata.shared"
import { SuccessionCriticalRoleFormDialog } from "./succession-critical-role-form.client"

export async function SuccessionCriticalRolesSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")
  const rows = await listSuccessionCriticalRolesForOrg(organizationId)

  const listConfiguration = buildSuccessionCriticalRolesListSurfaceConfiguration(rows, {
    empty: t("criticalRolesEmpty"),
    colCode: t("colCode"),
    colTitle: t("colTitle"),
    colImpact: t("colImpact"),
    colVacancyRisk: t("colVacancyRisk"),
    colIncumbent: t("colIncumbent"),
  })

  return (
    <Card
      size="sm"
      id="succession-critical-roles-section"
      data-testid="succession-critical-roles-section"
    >
      <CardHeader>
        <CardTitle>{t("criticalRolesTitle")}</CardTitle>
        <CardDescription>{t("criticalRolesDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <SuccessionCriticalRoleFormDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={SUCCESSION_LIST_SURFACE_IDS.criticalRoles}
          data-testid={`governed-list-section:${SUCCESSION_LIST_SURFACE_IDS.criticalRoles}`}
        />
      </CardContent>
    </Card>
  )
}
