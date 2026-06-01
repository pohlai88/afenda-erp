import { describe, expect, it } from "vitest";

import {
  GEO_REQUIREMENT_CODES,
  GEO_SPEC_MAP,
} from "../../src/time-attendance/geolocation-remote-checkin/data/geolocation-spec-map.shared";

describe("HRM-GEO spec map", () => {
  it("maps GEO-001..032 to stable area slugs", () => {
    expect(GEO_REQUIREMENT_CODES).toHaveLength(32);
    for (let index = 1; index <= 32; index += 1) {
      const code = `HRM-GEO-${String(index).padStart(3, "0")}` as const;
      expect(GEO_SPEC_MAP[code as keyof typeof GEO_SPEC_MAP]).toBeTruthy();
    }
  });
});
