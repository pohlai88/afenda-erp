import { describe, expect, it } from "vitest";

import { buildHrOrgUnitsListSurface } from "../../src/employee-management/organizational-chart-hierarchy/hr.workforce.org-units-list.surface";

describe("hr org units list EUI contract", () => {
  it("exposes search toolbar bound to the units registry param", () => {
    const surface = buildHrOrgUnitsListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
      searchValue: "operations",
    });

    expect(surface.presentation?.toolbar?.search?.param).toBe("orgUnitsSearch");
    expect(surface.presentation?.toolbar?.search?.value).toBe("operations");
    expect(surface.surface?.header?.title).toBe("Organization units");
  });
});
