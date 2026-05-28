import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildKpiGoalMilestonesListSurfaceConfiguration,
  type KpiGoalMilestoneListRow,
} from "../data/kpi-goal-milestones-list-surface.server"
import { KpiGoalMilestonesTrailingCell } from "./kpi-goal-milestones-trailing-cell.client"

type KpiGoalMilestonesListSectionProps = {
  orgSlug: string
  milestones: readonly KpiGoalMilestoneListRow[]
  isHrmAdmin: boolean
}

export async function KpiGoalMilestonesListSection({
  orgSlug,
  milestones,
  isHrmAdmin,
}: KpiGoalMilestonesListSectionProps) {
  const t = await getTranslations("Erp.Hrm.kpi")

  const listConfiguration = buildKpiGoalMilestonesListSurfaceConfiguration(
    milestones,
    {
      empty: t("goalMilestonesEmpty"),
      colTitle: t("goalMilestoneColTitle"),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:kpi:goal-milestones"
      trailingColumn={
        isHrmAdmin
          ? {
              header: t("goalMilestoneColActions"),
              Cell: KpiGoalMilestonesTrailingCell,
              context: {
                orgSlug,
                removeLabel: t("goalMilestoneRemove"),
              },
            }
          : undefined
      }
    />
  )
}
