import { describe, expect, it } from "vitest";

import {
  getHrGeoListSurfaceKeys,
  HR_GEO_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_GEO_LIST_SEARCH_PARAMS_BY_KEY,
  HR_GEO_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_GEO_LIST_SURFACE_KEYS,
  parseHrGeoSearchParams,
} from "../../src/metadata";

describe("hr geolocation workbench metadata registry", () => {
  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_GEO_LIST_SURFACE_KEYS) {
      expect(HR_GEO_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
    }
    expect(getHrGeoListSurfaceKeys()).toEqual(HR_GEO_LIST_SURFACE_KEYS);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_GEO_LIST_SURFACE_KEYS) {
      const searchParam = HR_GEO_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_GEO_LIST_SEARCH_PARAM_MODEL_FIELDS).toContain(searchParam);
    }
  });

  it("parses list-specific search params from the metadata registry", () => {
    const parsed = parseHrGeoSearchParams({
      geoGeofencesSearch: "hq",
      geoPendingSearch: "outside",
    });

    expect(parsed.geoGeofencesSearch).toBe("hq");
    expect(parsed.geoPendingSearch).toBe("outside");
    expect(parsed.geoPoliciesSearch).toBeUndefined();
  });
});
