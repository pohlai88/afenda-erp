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

import type { GpgSurfaceAccess } from "../data/gpg-access.server"
import { listHrmGpgSpecDeliveryRows } from "../gpg-spec-status.shared"
import { GpgAssignmentsSection } from "./gpg-assignments-section"
import { GpgClassificationsSection } from "./gpg-classifications-section"
import { GpgLocalitySection } from "./gpg-locality-section"
import { GpgAssignmentHistorySection } from "./gpg-assignment-history-section"
import { GpgOverviewSection } from "./gpg-overview-section"
import { GpgGradeMovementsSection } from "./gpg-grade-movements-section"
import { GpgPermissionsSection } from "./gpg-permissions-section"
import { GpgReclassificationSection } from "./gpg-reclassification-section"
import { GpgReportsSection } from "./gpg-reports-section"
import { GpgStepIncreaseSection } from "./gpg-step-increase-section"
import { GpgPayStructureSection } from "./gpg-pay-structure-section"
import { GpgSalaryTablesSection } from "./gpg-salary-tables-section"

type GovernmentPayGradesPageProps = {
  orgSlug: string
  organizationId: string
  access: GpgSurfaceAccess
}

export async function GovernmentPayGradesPage({
  orgSlug,
  organizationId,
  access,
}: GovernmentPayGradesPageProps) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const specRows = listHrmGpgSpecDeliveryRows()

  return (
    <div
      className="flex flex-col gap-6"
      data-testid="government-pay-grades-page"
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

      <GpgOverviewSection organizationId={organizationId} />

      <GpgClassificationsSection
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <GpgPayStructureSection
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <GpgSalaryTablesSection
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <GpgAssignmentsSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />

      <GpgLocalitySection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />

      <GpgStepIncreaseSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />

      <GpgGradeMovementsSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />

      <GpgAssignmentHistorySection
        organizationId={organizationId}
        orgSlug={orgSlug}
      />

      <GpgReclassificationSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canManage={access.canManage}
      />

      <GpgReportsSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        canAudit={access.canAudit}
      />

      <GpgPermissionsSection access={access} />
    </div>
  )
}
