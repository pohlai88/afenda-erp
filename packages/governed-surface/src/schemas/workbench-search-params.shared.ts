/**
 * Shared nuqs / searchParams keys for metadata workbench drill-down.
 * Modules may extend with segment-specific keys in `*.search-params.ts`.
 */
export const GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS = {
  range: "range",
  band: "band",
  focus: "focus",
  dept: "dept",
  device: "device",
} as const

export type GovernedWorkbenchSearchParamKey =
  (typeof GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS)[keyof typeof GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS]
