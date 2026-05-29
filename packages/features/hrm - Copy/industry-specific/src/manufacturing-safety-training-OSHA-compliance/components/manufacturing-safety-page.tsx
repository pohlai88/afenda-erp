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
import { HrmAccessDeniedMessage } from "@afenda/feature-hrm-core/registry"

import type { MscSurfaceAccess } from "../data/msc-access.server"
import { loadManufacturingSafetyPageData } from "../data/msc-page-data.server"
import { listHrmMscSpecDeliveryRows } from "../msc-spec-status.shared"
import { MscOverviewSection } from "./msc-overview-section"
import { MscRequirementsSection } from "./msc-requirements-section"
import { MscObligationsSection } from "./msc-obligations-section"
import { MscCertificationsSection } from "./msc-certifications-section"
import { MscHazardAssessmentsSection } from "./msc-hazard-assessments-section"
import { MscIncidentsSection } from "./msc-incidents-section"
import { MscCorrectiveActionsSection } from "./msc-corrective-actions-section"
import { MscWorkRestrictionsSection } from "./msc-work-restrictions-section"
import { MscRegulatoryReferencesSection } from "./msc-regulatory-references-section"
import { MscExpiryAlertsSection } from "./msc-expiry-alerts-section"
import { MscReportsSection } from "./msc-reports-section"
import { MscMastersSection } from "./msc-masters-section"
import { MscEvidenceSection } from "./msc-evidence-section"

type ManufacturingSafetyPageProps = {
  orgSlug: string
  organizationId: string
  access: MscSurfaceAccess
}

export async function ManufacturingSafetyPage({
  orgSlug,
  organizationId,
  access,
}: ManufacturingSafetyPageProps) {
  const [t, data] = await Promise.all([
    getTranslations("Erp.Hrm.manufacturingSafety"),
    loadManufacturingSafetyPageData(organizationId),
  ])

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const specRows = listHrmMscSpecDeliveryRows()

  return (
    <div
      className="flex flex-col gap-6"
      data-testid="manufacturing-safety-page"
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

      <MscOverviewSection summary={data.summary} />

      <MscMastersSection
        sites={data.sites}
        siteMasters={data.siteMasters}
        machines={data.machines}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscRequirementsSection
        rows={data.requirementRules}
        sites={data.sites}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscRegulatoryReferencesSection
        rows={data.regulatoryReferences}
        sites={data.sites}
        requirementRules={data.requirementRules}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscObligationsSection
        orgSlug={orgSlug}
        rows={data.obligations}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscCertificationsSection
        orgSlug={orgSlug}
        rows={data.certifications}
        parentAccessAllowed={access.canRead}
      />

      <MscWorkRestrictionsSection
        orgSlug={orgSlug}
        rows={data.workRestrictions}
        obligations={data.obligations}
        machines={data.machines}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscHazardAssessmentsSection
        rows={data.hazardAssessments}
        sites={data.sites}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscIncidentsSection
        rows={data.incidents}
        sites={data.sites}
        obligations={data.obligations}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscCorrectiveActionsSection
        rows={data.correctiveActions}
        incidents={data.incidents}
        hazards={data.hazardAssessments}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscEvidenceSection
        evidenceLinks={data.evidenceLinks}
        obligations={data.obligations}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscExpiryAlertsSection
        orgSlug={orgSlug}
        obligations={data.obligations}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
      />

      <MscReportsSection
        orgSlug={orgSlug}
        obligations={data.obligations}
        canAudit={access.canAudit}
      />
    </div>
  )
}
