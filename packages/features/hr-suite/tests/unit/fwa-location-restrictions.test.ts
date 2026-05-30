import { describe, expect, it } from "vitest";

import { assertHrFwaLocationRestrictions } from "../../src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-location.server";

describe("FWA-017 location restrictions", () => {
  it("blocks disallowed location kinds", () => {
    expect(() =>
      assertHrFwaLocationRestrictions({
        locationKind: "client_site",
        countryCode: "SG",
        restrictions: {
          allowedLocationKinds: ["home_office", "branch"],
        },
      }),
    ).toThrow(/not allowed/i);
  });

  it("blocks countries outside allow list", () => {
    expect(() =>
      assertHrFwaLocationRestrictions({
        locationKind: "home_office",
        countryCode: "MY",
        restrictions: {
          allowedCountryCodes: ["SG"],
        },
      }),
    ).toThrow(/not in the approved country list/i);
  });

  it("allows matching home office in approved country", () => {
    expect(() =>
      assertHrFwaLocationRestrictions({
        locationKind: "home_office",
        countryCode: "sg",
        regionCode: "SG-01",
        restrictions: {
          allowedLocationKinds: ["home_office"],
          allowedCountryCodes: ["SG"],
          allowedRegionCodes: ["SG-01"],
        },
      }),
    ).not.toThrow();
  });
});
