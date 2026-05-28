import { buildTimeClockAbnormalPunchFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import { TCI_LIST_SURFACE_IDS } from "../data/tci-surface-metadata.shared"
import type { TimeClockAbnormalPunchFindingRow } from "../data/tci-abnormal-punch-detection.server"
import type { TimeClockLoadError } from "../data/tci-load-error.shared"
import {
  renderTimeClockLamDayFindingsSection,
  type TimeClockLamDayFindingsSectionConfig,
} from "./tci-lam-day-findings-section"

const ABNORMAL_PUNCH_FINDINGS_CONFIG = {
  messageNamespace: "Erp.Hrm.timeClock.abnormalPunchFindings",
  codeLabelsNamespace: "Erp.Hrm.timeClock.abnormalPunchCodeLabels",
  surfaceKey: TCI_LIST_SURFACE_IDS.abnormalPunchFindings,
  buildListConfiguration:
    buildTimeClockAbnormalPunchFindingsListSurfaceConfiguration,
} as const satisfies TimeClockLamDayFindingsSectionConfig<TimeClockAbnormalPunchFindingRow>

export async function TimeClockAbnormalPunchFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockAbnormalPunchFindingRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  return renderTimeClockLamDayFindingsSection({
    rows,
    orgSlug,
    parentAccessAllowed,
    loadError,
    config: ABNORMAL_PUNCH_FINDINGS_CONFIG,
  })
}
