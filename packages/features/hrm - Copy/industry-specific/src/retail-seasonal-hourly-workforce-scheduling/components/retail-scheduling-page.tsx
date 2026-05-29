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
import { todayIsoDate } from "@afenda/feature-hrm-time-attendance/server"
import { addDaysIso } from "@afenda/feature-hrm-time-attendance/server"

import type { RwsSurfaceAccess } from "../data/rws-access.server"
import { listHrmRwsSpecDeliveryRows } from "../rws-spec-status.shared"
import { RwsAttendanceReconcileSection } from "./rws-attendance-reconcile-section"
import { RwsAvailabilitySection } from "./rws-availability-section"
import { RwsBudgetSection } from "./rws-budget-section"
import { RwsCoverageGapsSection } from "./rws-coverage-gaps-section"
import { RwsDemandSection } from "./rws-demand-section"
import { RwsOpenShiftsSection } from "./rws-open-shifts-section"
import { RwsOverviewSection } from "./rws-overview-section"
import { RwsPermissionsSection } from "./rws-permissions-section"
import { RwsPeriodsSection } from "./rws-periods-section"
import { RwsPolicySection } from "./rws-policy-section"
import { RwsPayrollReferencesSection } from "./rws-payroll-references-section"
import { RwsReportsSection } from "./rws-reports-section"
import { RwsStoresSection } from "./rws-stores-section"
import { RwsSwapsSection } from "./rws-swaps-section"

type RetailSchedulingPageProps = {
  orgSlug: string
  organizationId: string
  access: RwsSurfaceAccess
}

export async function RetailSchedulingPage({
  orgSlug,
  organizationId,
  access,
}: RetailSchedulingPageProps) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const specRows = listHrmRwsSpecDeliveryRows()
  const rangeStart = todayIsoDate()
  const rangeEnd = addDaysIso(rangeStart, 13)
  const canClaim = access.canRead || access.canManage

  return (
    <div className="flex flex-col gap-6" data-testid="retail-scheduling-page">
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

      <RwsOverviewSection organizationId={organizationId} />
      <RwsStoresSection organizationId={organizationId} canManage={access.canManage} />
      <RwsPeriodsSection organizationId={organizationId} canManage={access.canManage} />
      <RwsCoverageGapsSection
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <RwsAvailabilitySection
        organizationId={organizationId}
        orgSlug={orgSlug}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        canManage={access.canManage}
      />
      <RwsOpenShiftsSection
        organizationId={organizationId}
        canManage={access.canManage}
        canClaim={canClaim}
      />
      <RwsSwapsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <RwsDemandSection
        organizationId={organizationId}
        canManage={access.canManage}
      />
      <RwsBudgetSection
        organizationId={organizationId}
        canManage={access.canManage}
        canViewLaborCost={access.canViewLaborCost}
      />
      <RwsPolicySection organizationId={organizationId} canManage={access.canManage} />
      <RwsAttendanceReconcileSection
        organizationId={organizationId}
        orgSlug={orgSlug}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
      <RwsPayrollReferencesSection
        organizationId={organizationId}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
      <RwsReportsSection canAudit={access.canAudit} />
      <RwsPermissionsSection access={access} />
    </div>
  )
}
