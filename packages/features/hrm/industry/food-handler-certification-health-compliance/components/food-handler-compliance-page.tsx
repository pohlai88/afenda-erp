import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"
import { HrmAccessDeniedMessage } from "../../../_core/registry"

import type { FhcSurfaceAccess } from "../data/fhc-access.server"
import { listFhcOutletsForOrg } from "../data/fhc.queries.server"
import { listHrmFhcSpecDeliveryRows } from "../fhc-spec-status.shared"
import { FhcOverviewSection } from "./fhc-overview-section"
import { FhcObligationsSection } from "./fhc-obligations-section"
import { FhcDutyRestrictionsSection } from "./fhc-duty-restrictions-section"
import { FhcExpiryAlertsSection } from "./fhc-expiry-alerts-section"
import { FhcReportsSection } from "./fhc-reports-section"
import { FhcRequirementRulesSection } from "./fhc-requirement-rules-section"
import { FhcHealthRecordsSection } from "./fhc-health-records-section"
import { FhcVerificationQueueSection } from "./fhc-verification-queue-section"

type FoodHandlerCompliancePageProps = {
  orgSlug: string
  organizationId: string
  access: FhcSurfaceAccess
}

export async function FoodHandlerCompliancePage({
  orgSlug,
  organizationId,
  access,
}: FoodHandlerCompliancePageProps) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const outlets = await listFhcOutletsForOrg(organizationId)
  const specRows = listHrmFhcSpecDeliveryRows()

  return (
    <div
      className="flex flex-col gap-6"
      data-testid="food-handler-compliance-page"
    >
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("specDeliveryTitle")}</CardTitle>
          <CardDescription>{t("specDeliveryDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {specRows.map((row) => (
            <Badge
              key={row.code}
              variant={
                row.status === "complete"
                  ? "default"
                  : row.status === "partial"
                    ? "secondary"
                    : "outline"
              }
            >
              {row.code} · {t(`specDeliveryStatus.${row.status}`)}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <FhcOverviewSection organizationId={organizationId} />

      <FhcExpiryAlertsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <FhcRequirementRulesSection
        organizationId={organizationId}
        outlets={outlets}
        canManage={access.canManage}
      />

      <FhcObligationsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
        canAudit={access.canAudit}
        parentAccessAllowed={access.canRead}
      />

      <FhcHealthRecordsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canAudit={access.canAudit}
        parentAccessAllowed={access.canRead}
      />

      <FhcVerificationQueueSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canVerify={access.canVerify}
      />

      <FhcDutyRestrictionsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <FhcReportsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canAudit={access.canAudit}
      />
    </div>
  )
}
