import { getFormatter, getTranslations } from "next-intl/server"

import type { OrgEventDeliverySummary } from "@afenda/feature-system-admin"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card"

import { buildComplianceEvidenceRegisterListSurfaceConfiguration } from "../data/compliance-list-surface.server"
import { compliancePackTypeLabel } from "../data/compliance-pack-labels.shared"
import type { ComplianceEvidenceRow } from "../data/compliance.queries.server"
import type { PayrollPeriodRow } from "@afenda/feature-hrm-payroll-compensation/server"
import type { ComplianceEvidenceRegisterTrailingRow } from "./compliance-evidence-register-trailing.client"
import { ComplianceEvidenceRegisterTrailingCell } from "./compliance-list-trailing-cells.client"

type ComplianceEvidenceRegisterPanelProps = {
  period: PayrollPeriodRow | null
  evidenceRows: readonly ComplianceEvidenceRow[]
  orgSlug: string
  packTypesWithSubscribedEndpoint: readonly string[]
  deliveryById: Readonly<Record<string, OrgEventDeliverySummary>>
}

function mapDelivery(
  delivery: OrgEventDeliverySummary | null
): ComplianceEvidenceRegisterTrailingRow["delivery"] {
  if (!delivery) return null
  const completedAt = delivery.completedAt ?? delivery.createdAt
  return {
    state: delivery.state,
    httpStatus: delivery.httpStatus,
    durationMs: delivery.durationMs,
    attempts: delivery.attempts,
    errorMessage: delivery.errorMessage,
    completedAtIso: completedAt.toISOString(),
  }
}

function mapTrailingRow(
  row: ComplianceEvidenceRow,
  subscribedPackTypeSet: ReadonlySet<string>,
  deliveryById: Readonly<Record<string, OrgEventDeliverySummary>>
): ComplianceEvidenceRegisterTrailingRow {
  return {
    id: row.id,
    packType: row.packType,
    submissionState: row.submissionState,
    rulePackVersion: row.rulePackVersion,
    generatedAtIso: row.generatedAt.toISOString(),
    externalReference: row.externalReference,
    acknowledgedAtIso: row.acknowledgedAt?.toISOString() ?? null,
    acknowledgementSource: row.acknowledgementSource,
    authorityPayloadHash: row.authorityPayloadHash,
    endpointAvailable: subscribedPackTypeSet.has(row.packType),
    delivery: row.submissionDeliveryId
      ? mapDelivery(deliveryById[row.submissionDeliveryId] ?? null)
      : null,
  }
}

type ComplianceEvidenceRegisterListSectionProps = {
  evidenceRows: readonly ComplianceEvidenceRow[]
  orgSlug: string
  packTypesWithSubscribedEndpoint: readonly string[]
  deliveryById: Readonly<Record<string, OrgEventDeliverySummary>>
}

export async function ComplianceEvidenceRegisterListSection({
  evidenceRows,
  orgSlug,
  packTypesWithSubscribedEndpoint,
  deliveryById,
}: ComplianceEvidenceRegisterListSectionProps) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.compliance"),
    getFormatter(),
  ])
  const subscribedPackTypeSet = new Set(packTypesWithSubscribedEndpoint)
  const listConfiguration =
    buildComplianceEvidenceRegisterListSurfaceConfiguration(evidenceRows, {
      empty: t("emptyFinalizePeriod"),
      colPack: t("colPack"),
      colState: t("colState"),
      colVersion: t("colVersion"),
      colGenerated: t("colGenerated"),
      packLabelFor: compliancePackTypeLabel,
      formatGenerated: (value) =>
        format.dateTime(value, { dateStyle: "medium" }),
    })
  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:compliance:evidence-register"
      trailingColumn={{
        header: t("colActions"),
        Cell: ComplianceEvidenceRegisterTrailingCell,
        context: {
          orgSlug,
          rowById: Object.fromEntries(
            evidenceRows.map((row) => [
              row.id,
              mapTrailingRow(row, subscribedPackTypeSet, deliveryById),
            ])
          ),
        },
      }}
    />
  )
}

export async function ComplianceEvidenceRegisterPanel({
  period,
  evidenceRows,
  orgSlug,
  packTypesWithSubscribedEndpoint,
  deliveryById,
}: ComplianceEvidenceRegisterPanelProps) {
  const t = await getTranslations("Erp.Hrm.compliance")

  if (!period) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("emptyNoPeriod")}
        </CardContent>
      </Card>
    )
  }

  if (evidenceRows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("emptyFinalizePeriod")}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {t("evidenceRegister")} — {period.periodStart} to {period.periodEnd}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComplianceEvidenceRegisterListSection
          evidenceRows={evidenceRows}
          orgSlug={orgSlug}
          packTypesWithSubscribedEndpoint={packTypesWithSubscribedEndpoint}
          deliveryById={deliveryById}
        />
      </CardContent>
    </Card>
  )
}
