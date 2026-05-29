import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import {
  buildLmsOverviewStatConfiguration,
  type LmsOverviewKpiCopy,
} from "../data/lms-overview-surface.server"
import type {
  LMS_OVERVIEW_EMPLOYEE_SURFACE_KEY,
  LMS_OVERVIEW_HR_SURFACE_KEY,
  LMS_OVERVIEW_MANAGER_SURFACE_KEY,
} from "../data/lms-overview-surface.server"
import type { LmsOverviewSnapshot } from "../data/lms-overview.queries.server"

export async function LmsOverviewSection({
  snapshot,
  copy,
  surfaceKey,
}: {
  snapshot: LmsOverviewSnapshot
  copy: LmsOverviewKpiCopy
  surfaceKey:
    | typeof LMS_OVERVIEW_EMPLOYEE_SURFACE_KEY
    | typeof LMS_OVERVIEW_MANAGER_SURFACE_KEY
    | typeof LMS_OVERVIEW_HR_SURFACE_KEY
}) {
  const configuration = buildLmsOverviewStatConfiguration(snapshot, copy)

  return (
    <GovernedPatternBStatSection
      title={copy.title}
      surfaceKey={surfaceKey}
      statGroups={[
        {
          groupKey: "overview",
          configuration,
        },
      ]}
    />
  )
}
