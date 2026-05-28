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
import { MscExpiryAlertsEmitButton } from "./msc-expiry-alerts-emit-button.client"

export async function MscExpiryAlertsSection({
  orgSlug,
  obligations,
  canManage,
  parentAccessAllowed = true,
}: {
  orgSlug: string
  obligations: readonly MscEmployeeObligationRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")
  const rows = obligations.filter((row) => row.computedStatus === "expiring")

  const listConfiguration = buildMscObligationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("expiryAlertsEmpty"),
      colEmployee: t("colEmployee"),
      colSite: t("colSite"),
      colStatus: t("colStatus"),
      colComputed: t("colComputed"),
      colCertExpiry: t("colCertExpiry"),
      statusLabelFor: (status) =>
        t(`complianceStatusLabels.${status as HrmMscComplianceStatus}`),
      notComputed: t("notComputed"),
      notRecorded: t("notRecorded"),
    }
  )

  return (
    <Card size="sm" data-testid="msc-expiry-alerts-section">
      <CardHeader>
        <CardTitle>{t("expiryAlertsTitle")}</CardTitle>
        <CardDescription>{t("expiryAlertsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscExpiryAlertsEmitButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        surfaceKey={`${MSC_LIST_SURFACE_IDS.obligations}:expiry-alerts`}
        title={t("expiryAlertsTitle")}
        description={t("expiryAlertsDescription")}
        listConfiguration={listConfiguration}
        layout="embedded"
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
