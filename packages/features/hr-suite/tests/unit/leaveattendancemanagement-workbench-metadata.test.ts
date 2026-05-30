import { describe, expect, it } from "vitest";

import {
  getHrLamListSurfaceKeys,
  HR_LAM_LIST_SURFACE_KEYS,
  HR_LAM_LIST_SEARCH_PARAMS_BY_KEY,
} from "../../src/time-attendance/leave-attendance-management/metadata";

describe("hr lam workbench metadata", () => {
  it("exports stable list surface keys", () => {
    expect(getHrLamListSurfaceKeys()).toEqual(HR_LAM_LIST_SURFACE_KEYS);
    expect(HR_LAM_LIST_SURFACE_KEYS).toHaveLength(3);
  });

  it("maps each surface key to a search param", () => {
    for (const key of HR_LAM_LIST_SURFACE_KEYS) {
      expect(HR_LAM_LIST_SEARCH_PARAMS_BY_KEY[key]).toMatch(/^lam/);
    }
  });
});
