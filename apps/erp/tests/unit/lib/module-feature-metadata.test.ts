import { describe, expect, it } from "vitest";
import {
  getModuleFeatureMetadata,
  resolveModuleFeatureMetadata,
} from "@/lib/module-feature-metadata";

describe("module feature metadata resolver", () => {
  it("resolves HR metadata through @afenda/feature-hr/metadata", () => {
    const metadata = getModuleFeatureMetadata("hr");

    expect(metadata.moduleId).toBe("hr");
    expect(metadata.getListSurfaceKeys()).toEqual({
      records: "hr.records.list",
      workItems: "hr.work-items.list",
      savedViews: "hr.saved-views.list",
      documents: "hr.documents.list",
      employees: "hr.workforce.employees.list",
      workforceDocuments: "hr.workforce.documents.list",
      workforceLifecycle: "hr.workforce.lifecycle.list",
      workforceOffboarding: "hr.workforce.offboarding.list",
    });
  });

  it("rejects non-core module ids", () => {
    expect(resolveModuleFeatureMetadata("dashboard")).toBeNull();
  });
});
