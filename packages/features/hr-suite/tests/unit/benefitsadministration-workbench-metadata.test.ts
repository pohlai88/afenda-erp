import { describe, expect, it } from "vitest";

import {
  HR_BENEFITS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_BENEFITS_LIST_SURFACE_KEYS,
} from "../../src/metadata";

describe("hr benefits workbench metadata registry", () => {
  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_BENEFITS_LIST_SURFACE_KEYS) {
      expect(HR_BENEFITS_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
    }
  });
});
