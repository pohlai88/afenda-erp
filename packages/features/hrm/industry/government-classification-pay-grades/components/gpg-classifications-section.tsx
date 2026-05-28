import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { listGpgClassificationsForOrg } from "../data/gpg-classifications.server"
import { buildGpgClassificationsListSurfaceConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import type { GpgClassificationRow } from "../data/gpg.types.shared"
import { GpgClassificationCreateDialog } from "./gpg-classification-create-dialog.client"

export async function GpgClassificationsSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const rows = await listGpgClassificationsForOrg(organizationId)

  const formatDimensions = (row: GpgClassificationRow) => {
    const parts: string[] = []
    if (row.occupationalGroup) parts.push(row.occupationalGroup)
    if (row.jobSeries) parts.push(row.jobSeries)
    if (row.jobFamily) parts.push(row.jobFamily)
    if (row.agencyRef) parts.push(row.agencyRef)
    if (row.departmentRef) parts.push(row.departmentRef)
    if (row.positionRef) parts.push(row.positionRef)
    return parts.length > 0 ? parts.join(" · ") : t("anyCriteria")
  }

  const listConfiguration = buildGpgClassificationsListSurfaceConfiguration(
    rows,
    {
      empty: t("classificationsEmpty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colScheme: t("colScheme"),
      colDimensions: t("colDimensions"),
      colState: t("colState"),
      colEffective: t("colEffective"),
      schemeLabel: (scheme) => t(`schemeLabels.${scheme}`),
      stateLabel: (state) => t(`masterStateLabels.${state}`),
      formatDimensions,
    }
  )

  return (
    <Card size="sm" data-testid="gpg-classifications-section">
      <CardHeader>
        <CardTitle>{t("classificationsTitle")}</CardTitle>
        <CardDescription>{t("classificationsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <GpgClassificationCreateDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={GPG_LIST_SURFACE_IDS.classifications}
        listConfiguration={listConfiguration}
      />
    </Card>
  )
}
