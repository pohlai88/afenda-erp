import { describe, expect, it } from "vitest";
import {
  describeHrSection,
  hrSectionManifest,
  hrSectionSlugs,
  isHrRecordsDetailRoute,
  resolveHrEmployeeRecordId,
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

  it("routes lifecycle through the hr-suite feature package", () => {
    const lifecycle = describeHrSection("lifecycle");

    expect(lifecycle.featurePackage).toBe("@afenda/feature-hr-suite");
    expect(lifecycle.featureRoot).toBe(
      "packages/features/hr-suite/src/employee-management/employee-lifecycle-management",
    );
    expect(lifecycle.url).toBe("/hr/lifecycle");
  });

  it("resolves employee record detail paths", () => {
    expect(resolveHrEmployeeRecordId(["records", "emp_123"])).toBe("emp_123");
    expect(isHrRecordsDetailRoute(["records", "emp_123"])).toBe(true);
    expect(resolveHrEmployeeRecordId(["employees"])).toBeNull();
    expect(resolveHrEmployeeRecordId(["records"])).toBeNull();
    expect(resolveHrEmployeeRecordId(["records", ""])).toBeNull();
    expect(isHrRecordsDetailRoute(["compliance"])).toBe(false);
  });
});
