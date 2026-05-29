import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscCorrectiveActionsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscCorrectiveActionRow,
  MscHazardAssessmentRow,
  MscIncidentRow,
} from "../data/msc.types.shared"
import type {
  HrmMscCorrectivePriority,
  HrmMscCorrectiveStatus,
} from "../schemas/msc-workflow-state.shared"
import { MscCorrectiveCreateDialog } from "./msc-corrective-create-dialog.client"

export async function MscCorrectiveActionsSection({
  rows,
  incidents,
  hazards,
  canManage,
  parentAccessAllowed = true,
}: {
  rows: readonly MscCorrectiveActionRow[]
  incidents: readonly MscIncidentRow[]
  hazards: readonly MscHazardAssessmentRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscCorrectiveActionsListSurfaceConfiguration(
    rows,
    {
      empty: t("correctiveEmpty"),
      colTitle: t("colTitle"),
      colSource: t("colSource"),
      colPriority: t("colPriority"),
      colStatus: t("colStatus"),
      colDue: t("colDueDate"),
      sourceLabelFor: (kind) =>
        t(
          `correctiveSourceLabels.${kind as "incident" | "hazard" | "training_gap" | "audit_finding"}`
        ),
      priorityLabelFor: (priority) =>
        t(`correctivePriorityLabels.${priority as HrmMscCorrectivePriority}`),
      statusLabelFor: (status) =>
        t(`correctiveStatusLabels.${status as HrmMscCorrectiveStatus}`),
      notRecorded: t("notRecorded"),
    }
  )

  return (
    <Card size="sm" data-testid="msc-corrective-actions-section">
      <CardHeader>
        <CardTitle>{t("correctiveTitle")}</CardTitle>
        <CardDescription>{t("correctiveDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscCorrectiveCreateDialog
              incidents={incidents}
              hazards={hazards}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={MSC_LIST_SURFACE_IDS.correctiveActions}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
