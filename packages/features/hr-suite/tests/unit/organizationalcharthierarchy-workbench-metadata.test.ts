import { describe, expect, it } from "vitest";

import {
  HR_ORG_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_ORG_LIST_SURFACE_KEYS,
} from "../../src/metadata";

describe("hr org workbench metadata registry", () => {
  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_ORG_LIST_SURFACE_KEYS) {
      expect(HR_ORG_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
    }
  });
});
