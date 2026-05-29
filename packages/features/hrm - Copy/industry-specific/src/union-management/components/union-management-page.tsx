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

import type { UcbSurfaceAccess } from "../data/ucb-access.server"
import { listHrmUcbSpecDeliveryRows } from "../ucb-spec-status.shared"
import { UcbAgreementsSection } from "./ucb-agreements-section"
import { UcbCbaRulesSection } from "./ucb-cba-rules-section"
import { UcbComplianceSection } from "./ucb-compliance-section"
import { UcbDuesSection } from "./ucb-dues-section"
import { UcbGrievancesSection } from "./ucb-grievances-section"
import { UcbMeetingsSection } from "./ucb-meetings-section"
import { UcbMembershipsSection } from "./ucb-memberships-section"
import { UcbOverviewSection } from "./ucb-overview-section"
import { UcbPermissionsSection } from "./ucb-permissions-section"
import { UcbReportsSection } from "./ucb-reports-section"
import { UcbRepresentativesSection } from "./ucb-representatives-section"
import { UcbSenioritySection } from "./ucb-seniority-section"
import { UcbUnionsSection } from "./ucb-unions-section"

type UnionManagementPageProps = {
  orgSlug: string
  organizationId: string
  access: UcbSurfaceAccess
}

export async function UnionManagementPage({
  orgSlug,
  organizationId,
  access,
}: UnionManagementPageProps) {
  const t = await getTranslations("Erp.Hrm.unionManagement")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const specRows = listHrmUcbSpecDeliveryRows()

  return (
    <div className="flex flex-col gap-6" data-testid="union-management-page">
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

      <UcbOverviewSection organizationId={organizationId} />
      <UcbUnionsSection organizationId={organizationId} canManage={access.canManage} />
      <UcbAgreementsSection organizationId={organizationId} />
      <UcbMembershipsSection organizationId={organizationId} orgSlug={orgSlug} />
      <UcbCbaRulesSection organizationId={organizationId} />
      <UcbSenioritySection organizationId={organizationId} orgSlug={orgSlug} />
      <UcbComplianceSection organizationId={organizationId} orgSlug={orgSlug} />
      <UcbDuesSection organizationId={organizationId} orgSlug={orgSlug} />
      <UcbGrievancesSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />
      <UcbRepresentativesSection organizationId={organizationId} />
      <UcbMeetingsSection organizationId={organizationId} />
      <UcbReportsSection canAudit={access.canAudit} />
      <UcbPermissionsSection access={access} />
    </div>
  )
}
