import { describe, expect, it } from "vitest";
import {
  describeHrSection,
  hrSectionManifest,
  hrSectionSlugs,
} from "@/lib/hr-sections/registry.server";

describe("HR section registry", () => {
  it("keeps manifest slugs aligned with route loaders", () => {
    expect(hrSectionSlugs).toEqual(Object.keys(hrSectionManifest));
  });

  it("routes compliance through the hr-suite feature package", () => {
    const compliance = describeHrSection("compliance");

    expect(compliance.featurePackage).toBe("@afenda/feature-hr-suite");
    expect(compliance.featureRoot).toBe(
      "packages/features/hr-suite/src/employee-management/compliance-regulatory-tracking",
    );
    expect(compliance.url).toBe("/hr/compliance");
  });
});
