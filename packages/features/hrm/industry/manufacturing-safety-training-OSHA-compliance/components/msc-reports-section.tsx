import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildMscObligationsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type { MscEmployeeObligationRow } from "../data/msc.types.shared"
import type { HrmMscComplianceStatus } from "../schemas/msc-workflow-state.shared"
import { MscReportExportButton } from "./msc-report-export-button.client"

function filterObligationsByStatus(
  obligations: readonly MscEmployeeObligationRow[],
  statuses: readonly HrmMscComplianceStatus[]
) {
  const allowed = new Set(statuses)
  return obligations.filter((row) =>
    allowed.has(row.computedStatus as HrmMscComplianceStatus)
  )
}

async function MscReportList({
  orgSlug,
  obligations,
  statuses,
  title,
  surfaceKeySuffix,
}: {
  orgSlug: string
  obligations: readonly MscEmployeeObligationRow[]
  statuses: readonly HrmMscComplianceStatus[]
  title: string
  surfaceKeySuffix: string
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")
  const rows = filterObligationsByStatus(obligations, statuses)

  const listConfiguration = buildMscObligationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("reportsEmpty"),
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
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <GovernedPatternBListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={`${MSC_LIST_SURFACE_IDS.reports}:${surfaceKeySuffix}`}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </div>
  )
}

export async function MscReportsSection({
  orgSlug,
  obligations,
  canAudit,
}: {
  orgSlug: string
  obligations: readonly MscEmployeeObligationRow[]
  canAudit: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  return (
    <Card size="sm" data-testid="msc-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
        {canAudit ? (
          <CardAction>
            <MscReportExportButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <div className="flex flex-col gap-6 px-6 pb-6">
        <MscReportList
          orgSlug={orgSlug}
          obligations={obligations}
          statuses={["expired"]}
          title={t("reportExpired")}
          surfaceKeySuffix="expired"
        />
        <MscReportList
          orgSlug={orgSlug}
          obligations={obligations}
          statuses={["expiring"]}
          title={t("reportExpiring")}
          surfaceKeySuffix="expiring"
        />
        <MscReportList
          orgSlug={orgSlug}
          obligations={obligations}
          statuses={["missing", "pending"]}
          title={t("reportMissing")}
          surfaceKeySuffix="missing"
        />
      </div>
    </Card>
  )
}
