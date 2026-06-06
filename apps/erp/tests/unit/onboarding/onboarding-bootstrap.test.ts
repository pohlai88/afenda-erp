import { describe, expect, it } from "vitest";

import {
  isValidOnboardingOrganizationName,
  MAX_ONBOARDING_ORGANIZATION_NAME_LENGTH,
  MIN_ONBOARDING_ORGANIZATION_NAME_LENGTH,
  normalizeOnboardingOrganizationName,
} from "@/routes/onboarding-bootstrap.shared";

describe("onboarding bootstrap normalization", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeOnboardingOrganizationName("  Afenda   Ops  ")).toBe(
      "Afenda Ops",
    );
  });

  it("accepts plain strings and form values", () => {
    expect(normalizeOnboardingOrganizationName("Acme")).toBe("Acme");
    expect(normalizeOnboardingOrganizationName(null)).toBe("");
  });
});

describe("onboarding bootstrap validation bounds", () => {
  it("uses the documented organization name length window", () => {
    expect(MIN_ONBOARDING_ORGANIZATION_NAME_LENGTH).toBe(3);
    expect(MAX_ONBOARDING_ORGANIZATION_NAME_LENGTH).toBe(120);
  });

  it("accepts names inside the valid range", () => {
    expect(isValidOnboardingOrganizationName("abc")).toBe(true);
    expect(isValidOnboardingOrganizationName("a".repeat(120))).toBe(true);
  });

  it("rejects names outside the valid range", () => {
    expect(isValidOnboardingOrganizationName("ab")).toBe(false);
    expect(isValidOnboardingOrganizationName("a".repeat(121))).toBe(false);
  });
});
