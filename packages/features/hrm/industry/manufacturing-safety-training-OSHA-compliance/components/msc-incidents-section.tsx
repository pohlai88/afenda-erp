import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscIncidentsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscEmployeeObligationRow,
  MscIncidentRow,
  MscSiteChoiceRow,
} from "../data/msc.types.shared"
import type {
  HrmMscIncidentStatus,
  HrmMscIncidentType,
} from "../schemas/msc-workflow-state.shared"
import { MscIncidentCreateDialog } from "./msc-incident-create-dialog.client"

export async function MscIncidentsSection({
  rows,
  sites,
  obligations,
  canManage,
  parentAccessAllowed = true,
}: {
  rows: readonly MscIncidentRow[]
  sites: readonly MscSiteChoiceRow[]
  obligations: readonly MscEmployeeObligationRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscIncidentsListSurfaceConfiguration(rows, {
    empty: t("incidentsEmpty"),
    colDate: t("colIncidentDate"),
    colType: t("colType"),
    colStatus: t("colStatus"),
    colSeverity: t("colSeverity"),
    colSite: t("colSite"),
    colEmployee: t("colEmployee"),
    typeLabelFor: (type) =>
      t(`incidentTypeLabels.${type as HrmMscIncidentType}`),
    statusLabelFor: (status) =>
      t(`incidentStatusLabels.${status as HrmMscIncidentStatus}`),
    notRecorded: t("notRecorded"),
  })

  return (
    <Card size="sm" data-testid="msc-incidents-section">
      <CardHeader>
        <CardTitle>{t("incidentsTitle")}</CardTitle>
        <CardDescription>{t("incidentsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscIncidentCreateDialog sites={sites} obligations={obligations} />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={MSC_LIST_SURFACE_IDS.incidents}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
