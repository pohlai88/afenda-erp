import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { organizationHrmPath } from "@afenda/feature-hrm-core/registry"

import { listFrmActiveAssignmentChoicesForOrg } from "../data/frm-assignments.server"
import { FrmMobileAttendancePanel } from "./frm-mobile-attendance-panel.client"

export async function FrmMobileCaptureSection({
  orgSlug,
  organizationId,
  canManage,
}: {
  orgSlug: string
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")
  const geolocationHref = organizationHrmPath(orgSlug, "geolocation")
  const assignments = await listFrmActiveAssignmentChoicesForOrg(organizationId)

  return (
    <Card size="sm" data-testid="frm-mobile-capture-section">
      <CardHeader>
        <CardTitle>{t("mobileCaptureTitle")}</CardTitle>
        <CardDescription>{t("mobileCaptureDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FrmMobileAttendancePanel
          assignments={assignments}
          geolocationHref={geolocationHref}
          canManage={canManage}
        />
      </CardContent>
    </Card>
  )
}
