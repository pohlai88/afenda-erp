import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { listGpgEmployeeAssignmentsForOrg } from "../data/gpg-assignments.server"
import { buildGpgEmployeeAssignmentsListSurfaceConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import { GpgReportExportButton } from "./gpg-report-export-button.client"

export async function GpgReportsSection({
  organizationId,
  orgSlug,
  canAudit,
}: {
  organizationId: string
  orgSlug: string
  canAudit: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const assignments = await listGpgEmployeeAssignmentsForOrg(organizationId)

  const formatMoney = (amount: string | null, currency: string | null) => {
    if (!amount) return "—"
    return currency ? `${amount} ${currency}` : amount
  }

  const listConfiguration = buildGpgEmployeeAssignmentsListSurfaceConfiguration(
    assignments,
    orgSlug,
    {
      empty: t("reportsEmpty"),
      colEmployee: t("colEmployee"),
      colClassification: t("colClassification"),
      colPayGrade: t("colPayGrade"),
      colStep: t("colStep"),
      colBase: t("colBaseRate"),
      colAdjusted: t("colAdjustedPay"),
      colEffective: t("colEffective"),
      colState: t("colState"),
      stateLabel: (state) => t(`assignmentStateLabels.${state}`),
      formatMoney,
    }
  )

  return (
    <Card size="sm" data-testid="gpg-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
        {canAudit ? (
          <CardAction>
            <GpgReportExportButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternBListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={GPG_LIST_SURFACE_IDS.reports}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </Card>
  )
}
