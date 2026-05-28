import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildFhcObligationsListSurfaceConfiguration } from "../data/fhc-surface-builders.server"
import { listFhcEmployeeObligationsByStatusForOrg } from "../data/fhc.queries.server"
import { FHC_LIST_SURFACE_IDS } from "../data/fhc-surface-metadata.shared"
import type { HrmFhcComplianceStatus } from "../schemas/fhc-workflow-state.shared"
import { FhcExpiryAlertsEmitButton } from "./fhc-expiry-alerts-emit-button.client"

export async function FhcExpiryAlertsSection({
  orgSlug,
  organizationId,
  canManage,
}: {
  orgSlug: string
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const rows = await listFhcEmployeeObligationsByStatusForOrg(organizationId, [
    "expiring",
  ])

  const listConfiguration = buildFhcObligationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("expiryAlertsEmpty"),
      colEmployee: t("colEmployee"),
      colOutlet: t("colOutlet"),
      colStatus: t("colStatus"),
      colComputed: t("colComputed"),
      anyLabel: t("anyCriteria"),
      statusLabelFor: (status) =>
        t(`complianceStatusLabels.${status as HrmFhcComplianceStatus}`),
      formatComputedAt: (date) =>
        date
          ? new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(date)
          : t("notComputed"),
    }
  )

  return (
    <Card
      size="sm"
      id="fhc-expiry-alerts-section"
      data-testid="fhc-expiry-alerts-section"
    >
      <CardHeader>
        <CardTitle>{t("expiryAlertsTitle")}</CardTitle>
        <CardDescription>{t("expiryAlertsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <FhcExpiryAlertsEmitButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternBListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FHC_LIST_SURFACE_IDS.expiryAlerts}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </Card>
  )
}
