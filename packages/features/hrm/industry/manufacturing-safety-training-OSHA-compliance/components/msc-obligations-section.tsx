import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscObligationsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type { MscEmployeeObligationRow } from "../data/msc.types.shared"
import type { HrmMscComplianceStatus } from "../schemas/msc-workflow-state.shared"
import { MscObligationsTrailingCell } from "./msc-obligations-trailing-cell.client"
import { MscRecomputeObligationsButton } from "./msc-recompute-obligations-button.client"

export async function MscObligationsSection({
  orgSlug,
  rows,
  canManage,
  parentAccessAllowed = true,
}: {
  orgSlug: string
  rows: readonly MscEmployeeObligationRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscObligationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("obligationsEmpty"),
      colEmployee: t("colEmployee"),
      colSite: t("colSite"),
      colStatus: t("colStatus"),
      colComputed: t("colComputed"),
      colCertExpiry: t("colCertExpiry"),
      statusLabelFor: (status) =>
        t(`complianceStatusLabels.${status as HrmMscComplianceStatus}`),
      notComputed: t("notComputed"),
      notRecorded: t("notRecorded"),
    },
    { canManage }
  )

  return (
    <Card
      size="sm"
      id="msc-obligations-section"
      data-testid="msc-obligations-section"
    >
      <CardHeader>
        <CardTitle>{t("obligationsTitle")}</CardTitle>
        <CardDescription>{t("obligationsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscRecomputeObligationsButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={MSC_LIST_SURFACE_IDS.obligations}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        trailingColumn={
          canManage
            ? {
                header: t("colActions"),
                Cell: MscObligationsTrailingCell,
                context: { obligations: rows },
              }
            : undefined
        }
      />
    </Card>
  )
}
