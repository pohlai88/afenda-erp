import { describe, expect, it } from "vitest";

import {
  __CONSTANT_PREFIX___ACCEPTANCE_CRITERIA_COVERAGE,
  __CONSTANT_PREFIX___REQUIREMENT_COVERAGE,
  assert__IDENTIFIER__ScaffoldOnly,
} from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/data/__DOMAIN_KEY__-coverage.shared";

describe("__CAPABILITY_TITLE__ scaffold coverage", () => {
  it("does not claim shipped coverage before implementation", () => {
    expect(() => assert__IDENTIFIER__ScaffoldOnly()).not.toThrow();
    expect(__CONSTANT_PREFIX___REQUIREMENT_COVERAGE).toHaveLength(1);
    expect(__CONSTANT_PREFIX___ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(1);
    expect(
      __CONSTANT_PREFIX___REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "scaffold-only" && entry.code === "TBD",
      ),
    ).toBe(true);
    expect(
      __CONSTANT_PREFIX___ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "scaffold-only" && entry.code === "TBD",
      ),
    ).toBe(true);
  });
});
