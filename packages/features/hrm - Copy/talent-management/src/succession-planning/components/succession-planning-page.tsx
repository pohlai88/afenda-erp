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

import type { SuccessionSurfaceAccess } from "../data/succession-access.server"
import { listHrmSuccessionSpecDeliveryRows } from "../succession-spec-status.shared"
import { SuccessionBenchRiskSection } from "./succession-bench-risk-section"
import { SuccessionCalibrationSection } from "./succession-calibration-section"
import { SuccessionCriticalRolesSection } from "./succession-critical-roles-section"
import { SuccessionNominationsSection } from "./succession-nominations-section"
import { SuccessionOverviewSection } from "./succession-overview-section"
import { SuccessionPermissionsSection } from "./succession-permissions-section"
import { SuccessionPoolsSection } from "./succession-pools-section"
import { SuccessionReportsSection } from "./succession-reports-section"

type SuccessionPlanningPageProps = {
  orgSlug: string
  organizationId: string
  access: SuccessionSurfaceAccess
}

export async function SuccessionPlanningPage({
  orgSlug,
  organizationId,
  access,
}: SuccessionPlanningPageProps) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const specRows = listHrmSuccessionSpecDeliveryRows()

  return (
    <div className="flex flex-col gap-6" data-testid="succession-planning-page">
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

      <SuccessionOverviewSection organizationId={organizationId} />
      <SuccessionCriticalRolesSection
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <SuccessionNominationsSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />
      <SuccessionPoolsSection
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <SuccessionCalibrationSection
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <SuccessionBenchRiskSection
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <SuccessionReportsSection canAudit={access.canAudit} />
      <SuccessionPermissionsSection access={access} />
    </div>
  )
}
