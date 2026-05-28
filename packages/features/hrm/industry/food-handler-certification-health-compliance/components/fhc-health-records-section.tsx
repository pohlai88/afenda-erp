import { getTranslations } from "next-intl/server"

import { Card, CardDescription, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildFhcHealthRecordsListSurfaceConfiguration } from "../data/fhc-surface-builders.server"
import { listFhcHealthRecordsForOrg } from "../data/fhc-health-records.server"
import { FHC_LIST_SURFACE_IDS } from "../data/fhc-surface-metadata.shared"
import type { HrmFhcRenewalState } from "../schemas/fhc-workflow-state.shared"
import { FhcHealthRecordsTrailingCell } from "./fhc-health-records-trailing-cell.client"

export async function FhcHealthRecordsSection({
  orgSlug,
  organizationId,
  canAudit,
  parentAccessAllowed = true,
}: {
  orgSlug: string
  organizationId: string
  canAudit: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const rows = await listFhcHealthRecordsForOrg({
    organizationId,
    canReadHealthDetails: canAudit,
  })

  const listConfiguration = buildFhcHealthRecordsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("healthRecordsEmpty"),
      colEmployee: t("colEmployee"),
      colStatus: t("colStatus"),
      colRenewal: t("colRenewal"),
      colIssued: t("fieldIssueDate"),
      colExpires: t("fieldExpiryDate"),
      colCertificateRef: t("fieldCertificateRef"),
      statusLabelFor: (status) => status,
      renewalLabelFor: (state) =>
        t(`renewalStateLabels.${state as HrmFhcRenewalState}`),
      notRecorded: t("notRecorded"),
    },
    { canViewDetails: true }
  )

  return (
    <Card size="sm" data-testid="fhc-health-records-section">
      <CardHeader>
        <CardTitle>{t("healthRecordsTitle")}</CardTitle>
        <CardDescription>{t("healthRecordsDescription")}</CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FHC_LIST_SURFACE_IDS.healthRecords}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        resolveConfiguredPermission={false}
        trailingColumn={{
          header: t("colActions"),
          Cell: FhcHealthRecordsTrailingCell,
          context: {
            canReadHealthDetails: canAudit,
            records: rows,
          },
        }}
      />
    </Card>
  )
}
