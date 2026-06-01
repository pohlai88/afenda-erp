import {
  HR_SUCCESSION_LIST_SURFACE_KEYS,
  type HrSuccessionListSurfaceKey,
} from "../data/hr.talent.succession-search-params.parse.shared";

export {
  HR_SUCCESSION_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_SUCCESSION_LIST_SEARCH_PARAMS_BY_KEY,
  HR_SUCCESSION_LIST_SURFACE_KEYS,
  HR_SUCCESSION_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  type HrSuccessionListSurfaceKey,
} from "../data/hr.talent.succession-search-params.parse.shared";

export const HR_SUCCESSION_LIST_SURFACE_COLUMNS_BY_KEY = Object.fromEntries(
  HR_SUCCESSION_LIST_SURFACE_KEYS.map((key) => [key, key]),
) as Record<HrSuccessionListSurfaceKey, HrSuccessionListSurfaceKey>;

export function getHrSuccessionListSurfaceKeys() {
  return HR_SUCCESSION_LIST_SURFACE_KEYS;
}

export const getHrSuccessionPlanningListSurfaceKeys =
  getHrSuccessionListSurfaceKeys;
