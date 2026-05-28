import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listSuccessionCalibrationSessionsForOrg } from "../data/succession-calibration.server"
import { buildSuccessionCalibrationSessionsListSurfaceConfiguration } from "../data/succession-surface-builders.server"
import { SUCCESSION_LIST_SURFACE_IDS } from "../data/succession-surface-metadata.shared"
import { SuccessionCalibrationSessionFormDialog } from "./succession-calibration-form.client"

export async function SuccessionCalibrationSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")
  const rows = await listSuccessionCalibrationSessionsForOrg(organizationId)

  const listConfiguration = buildSuccessionCalibrationSessionsListSurfaceConfiguration(
    rows,
    {
      empty: t("calibrationEmpty"),
      colTitle: t("colTitle"),
      colDate: t("colSessionDate"),
      colStatus: t("colStatus"),
      colEntries: t("colEntries"),
    }
  )

  return (
    <Card
      size="sm"
      id="succession-calibration-section"
      data-testid="succession-calibration-section"
    >
      <CardHeader>
        <CardTitle>{t("calibrationTitle")}</CardTitle>
        <CardDescription>{t("calibrationDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <SuccessionCalibrationSessionFormDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={SUCCESSION_LIST_SURFACE_IDS.calibrationSessions}
          data-testid={`governed-list-section:${SUCCESSION_LIST_SURFACE_IDS.calibrationSessions}`}
        />
      </CardContent>
    </Card>
  )
}
