import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscHazardAssessmentsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscHazardAssessmentRow,
  MscSiteChoiceRow,
} from "../data/msc.types.shared"
import type {
  HrmMscHazardAssessmentStatus,
  HrmMscHazardAssessmentType,
} from "../schemas/msc-workflow-state.shared"
import { MscHazardCreateDialog } from "./msc-hazard-create-dialog.client"

export async function MscHazardAssessmentsSection({
  rows,
  sites,
  canManage,
  parentAccessAllowed = true,
}: {
  rows: readonly MscHazardAssessmentRow[]
  sites: readonly MscSiteChoiceRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscHazardAssessmentsListSurfaceConfiguration(
    rows,
    {
      empty: t("hazardsEmpty"),
      colTitle: t("colTitle"),
      colType: t("colType"),
      colStatus: t("colStatus"),
      colSite: t("colSite"),
      colExpires: t("colExpires"),
      typeLabelFor: (type) =>
        t(`hazardTypeLabels.${type as HrmMscHazardAssessmentType}`),
      statusLabelFor: (status) =>
        t(`hazardStatusLabels.${status as HrmMscHazardAssessmentStatus}`),
      notRecorded: t("notRecorded"),
    }
  )

  return (
    <Card size="sm" data-testid="msc-hazard-assessments-section">
      <CardHeader>
        <CardTitle>{t("hazardsTitle")}</CardTitle>
        <CardDescription>{t("hazardsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscHazardCreateDialog sites={sites} />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={MSC_LIST_SURFACE_IDS.hazardAssessments}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
