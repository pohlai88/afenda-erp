import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import { listSavedViewsForUser } from "../../_integration/rail-memory.server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"
import { HrmAccessDeniedMessage } from "../../../_core/registry"

import type { FrmSurfaceAccess } from "../data/frm-access.server"
import {
  EMPTY_FRM_LIST_URL_STATE,
  type FrmListUrlState,
} from "../data/frm-list-url-state.shared"
import { listHrmFrmSpecDeliveryRows } from "../frm-spec-status.shared"
import { FrmAssignmentsSection } from "./frm-assignments-section"
import { FrmOverviewSection } from "./frm-overview-section"
import { FrmExceptionsSection } from "./frm-exceptions-section"
import { FrmMobileCaptureSection } from "./frm-mobile-capture-section"
import { FrmReportsSection } from "./frm-reports-section"
import { FrmPerDiemSection } from "./frm-per-diem-section"
import { FrmTravelSection } from "./frm-travel-section"
import { FrmWorksitesSection } from "./frm-worksites-section"

type FieldWorkforcePageProps = {
  orgSlug: string
  organizationId: string
  userId: string
  access: FrmSurfaceAccess
  listUrlState?: FrmListUrlState
  workbenchFocus?: string | null
}

export async function FieldWorkforcePage({
  orgSlug,
  organizationId,
  userId,
  access,
  listUrlState,
  workbenchFocus,
}: FieldWorkforcePageProps) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const savedViews = await listSavedViewsForUser({
    organizationId,
    userId,
    surfaceId: "hrm",
  })
  const specRows = listHrmFrmSpecDeliveryRows()

  return (
    <div className="flex flex-col gap-6" data-testid="field-workforce-page">
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

      <FrmOverviewSection organizationId={organizationId} />

      <FrmWorksitesSection
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <FrmAssignmentsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <FrmMobileCaptureSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
      />

      <FrmExceptionsSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
        parentAccessAllowed={access.canRead}
        savedViews={savedViews}
        listUrlState={
          listUrlState ?? {
            ...EMPTY_FRM_LIST_URL_STATE,
            focus: workbenchFocus ?? null,
          }
        }
      />

      <FrmTravelSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        savedViews={savedViews}
        canManage={access.canManage}
        listUrlState={listUrlState}
      />

      <FrmPerDiemSection
        orgSlug={orgSlug}
        organizationId={organizationId}
        savedViews={savedViews}
        canManage={access.canManage}
        listUrlState={listUrlState}
      />

      <FrmReportsSection canAudit={access.canAudit} />
    </div>
  )
}
