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
import { FhcReportExportButton } from "./fhc-report-export-button.client"

async function FhcReportList({
  orgSlug,
  organizationId,
  statuses,
  title,
  surfaceKeySuffix,
}: {
  orgSlug: string
  organizationId: string
  statuses: readonly HrmFhcComplianceStatus[]
  title: string
  surfaceKeySuffix: string
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const rows = await listFhcEmployeeObligationsByStatusForOrg(
    organizationId,
    statuses
  )

  const listConfiguration = buildFhcObligationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("reportsEmpty"),
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
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <GovernedPatternBListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={`${FHC_LIST_SURFACE_IDS.reports}:${surfaceKeySuffix}`}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </div>
  )
}

export async function FhcReportsSection({
  orgSlug,
  organizationId,
  canAudit,
}: {
  orgSlug: string
  organizationId: string
  canAudit: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")

  return (
    <Card size="sm" data-testid="fhc-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
        {canAudit ? (
          <CardAction>
            <FhcReportExportButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <div className="flex flex-col gap-6 px-6 pb-6">
        <FhcReportList
          orgSlug={orgSlug}
          organizationId={organizationId}
          statuses={["expired"]}
          title={t("reportExpired")}
          surfaceKeySuffix="expired"
        />
        <FhcReportList
          orgSlug={orgSlug}
          organizationId={organizationId}
          statuses={["expiring"]}
          title={t("reportExpiring")}
          surfaceKeySuffix="expiring"
        />
        <FhcReportList
          orgSlug={orgSlug}
          organizationId={organizationId}
          statuses={["missing", "pending"]}
          title={t("reportMissing")}
          surfaceKeySuffix="missing"
        />
      </div>
    </Card>
  )
}
