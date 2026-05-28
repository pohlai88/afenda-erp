import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildTimeClockMappingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockMappingRow } from "../data/tci.queries.server"
import type { TciMappingState } from "../schemas/tci-workflow-state.shared"

import { TimeClockMappingUpsertDialog } from "./tci-device-forms.client"

type EmployeeChoice = { readonly id: string; readonly label: string }

export async function TimeClockMappingsSection({
  rows,
  canManage,
  orgSlug,
  employeeChoices,
  deviceChoices,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockMappingRow[]
  canManage: boolean
  orgSlug?: string
  employeeChoices: ReadonlyArray<EmployeeChoice>
  deviceChoices: ReadonlyArray<EmployeeChoice>
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.mappings")

  const listConfiguration = buildTimeClockMappingsListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colEmployee: t("colEmployee"),
      colDevice: t("colDevice"),
      colClockUser: t("colClockUser"),
      colBadge: t("colBadge"),
      colBiometric: t("colBiometric"),
      colStatus: t("colStatus"),
      formatMappingState: (state) =>
        t(`mappingStateLabels.${state as TciMappingState}`),
    },
    { orgSlug }
  )

  return (
    <GovernedPatternCListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:mappings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
      headerSlot={
        canManage ? (
          <div className="flex justify-end">
            <TimeClockMappingUpsertDialog
              employees={employeeChoices}
              devices={deviceChoices}
            />
          </div>
        ) : null
      }
    />
  )
}
