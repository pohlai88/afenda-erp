import { GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS } from "@afenda/governed-surface"

/**
 * TCI workbench URL keys (bookmarkable band focus).
 * Server: `schemas/tci.search-params.ts` (nuqs loader/serializer).
 * Client: `TimeClockBandFocusClient` under scoped `NuqsAdapter`.
 */
export const TCI_WORKBENCH_SEARCH_PARAMS = {
  band: GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS.band,
  focus: GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS.focus,
  device: GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS.device,
} as const

export const TCI_WORKBENCH_BAND_VALUES = [
  "setup",
  "capture",
  "quality",
  "downstream",
  "operations",
  "admin",
] as const

export type TciWorkbenchBand = (typeof TCI_WORKBENCH_BAND_VALUES)[number]

export function tciBandSectionHref(band: TciWorkbenchBand): string {
  return `?${TCI_WORKBENCH_SEARCH_PARAMS.band}=${band}#time-clock-${band}`
}
