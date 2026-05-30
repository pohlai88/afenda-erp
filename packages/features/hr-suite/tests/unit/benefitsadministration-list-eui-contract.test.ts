import { describe, expect, it } from "vitest";

import { buildHrBenefitsPlansListSurface } from "../../src/payroll-compensation/benefits-administration/surface/hr.payroll.benefits-plans-list.surface";

describe("hr benefits plans list EUI contract", () => {
  it("exposes search toolbar bound to the plans registry param", () => {
    const surface = buildHrBenefitsPlansListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
      searchValue: "medical",
    });

    expect(surface.presentation?.toolbar?.search?.param).toBe("benefitsPlansSearch");
    expect(surface.presentation?.toolbar?.search?.value).toBe("medical");
    expect(surface.surface?.header?.title).toBe("Benefit plans");
  });
});
