import { createModuleFeatureMetadata } from "@afenda/kernel/feature-metadata";
import { describe, expect, it } from "vitest";
import {
  getModuleFeatureMetadata,
  resolveModuleFeatureMetadata,
} from "@/kitchen-sinks/module-feature.metadata";

describe("module feature metadata resolver", () => {
  it("resolves HR metadata through @afenda/feature-hr-suite/metadata", () => {
    const metadata = getModuleFeatureMetadata("hr");
    const kernelHr = createModuleFeatureMetadata("hr");

    expect(metadata.moduleId).toBe("hr");
    expect(metadata.getListSurfaceKeys()).toEqual(
      kernelHr.getListSurfaceKeys(),
    );
  });

  it("rejects non-core module ids", () => {
    expect(resolveModuleFeatureMetadata("dashboard")).toBeNull();
  });
});
