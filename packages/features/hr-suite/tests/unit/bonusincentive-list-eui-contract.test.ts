import { describe, expect, it } from "vitest";

import { buildHrBonusGuaranteedRulesListSurface } from "../../src/payroll-compensation/bonus-incentive-management/surface/hr.payroll.bonus-governed-lists.surface";

describe("hr bonus guaranteed rules list EUI contract", () => {
  it("exposes search toolbar bound to the guaranteed rules registry param", () => {
    const surface = buildHrBonusGuaranteedRulesListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
      searchValue: "annual",
    });

    expect(surface.presentation?.toolbar?.search?.param).toBe("bonusGuaranteedSearch");
    expect(surface.presentation?.toolbar?.search?.value).toBe("annual");
    expect(surface.surface?.header?.title).toBe("Guaranteed bonus rules");
    expect(surface.requiresErpPermission).toEqual({
      module: "hr",
      object: "bonus",
      function: "read",
    });
    expect(surface.dataNature).toBe("table");
  });
});
