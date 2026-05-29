import { buildTimeClockMissingPunchFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import { TCI_LIST_SURFACE_IDS } from "../data/tci-surface-metadata.shared"
import type { TimeClockMissingPunchFindingRow } from "../data/tci-missing-punch-detection.server"
import type { TimeClockLoadError } from "../data/tci-load-error.shared"
import {
  renderTimeClockLamDayFindingsSection,
  type TimeClockLamDayFindingsSectionConfig,
} from "./tci-lam-day-findings-section"

const MISSING_PUNCH_FINDINGS_CONFIG = {
  messageNamespace: "Erp.Hrm.timeClock.missingPunchFindings",
  codeLabelsNamespace: "Erp.Hrm.timeClock.missingPunchCodeLabels",
  surfaceKey: TCI_LIST_SURFACE_IDS.missingPunchFindings,
  buildListConfiguration:
    buildTimeClockMissingPunchFindingsListSurfaceConfiguration,
} as const satisfies TimeClockLamDayFindingsSectionConfig<TimeClockMissingPunchFindingRow>

export async function TimeClockMissingPunchFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockMissingPunchFindingRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  return renderTimeClockLamDayFindingsSection({
    rows,
    orgSlug,
    parentAccessAllowed,
    loadError,
    config: MISSING_PUNCH_FINDINGS_CONFIG,
  })
}
