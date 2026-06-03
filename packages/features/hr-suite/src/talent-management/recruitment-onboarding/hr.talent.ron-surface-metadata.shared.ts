import {
  HR_RON_LIST_SURFACE_KEYS,
  type HrRonListSurfaceKey,
} from "./hr.talent.ron-search-params.parse.shared";

export {
  HR_RON_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_RON_LIST_SEARCH_PARAMS_BY_KEY,
  HR_RON_LIST_SURFACE_KEYS,
  HR_RON_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  type HrRonListSurfaceKey,
} from "./hr.talent.ron-search-params.parse.shared";

export const HR_RON_LIST_SURFACE_COLUMNS_BY_KEY = Object.fromEntries(
  HR_RON_LIST_SURFACE_KEYS.map((key) => [key, key]),
) as Record<HrRonListSurfaceKey, HrRonListSurfaceKey>;

export function getHrRonListSurfaceKeys() {
  return HR_RON_LIST_SURFACE_KEYS;
}
