import { describe, expect, it } from "vitest";
import {
  getAccessibleModules,
  getErpModuleById,
  getNavigationExtensions,
  isModuleId,
} from "../../src/index";

describe("domain modules", () => {
  it("validates module ids", () => {
    expect(isModuleId("finance")).toBe(true);
    expect(isModuleId("unknown")).toBe(false);
  });

  it("returns module definitions by id", () => {
    const finance = getErpModuleById("finance");

    expect(finance).not.toBeNull();
    expect(finance?.href).toBe("/finance");
    expect(finance?.requiredCapability).toBe("finance.view");
  });

  it("filters accessible modules by capability", () => {
    const modules = getAccessibleModules(["dashboard.view", "finance.view"]);

    expect(modules.map((module) => module.id)).toEqual([
      "dashboard",
      "finance",
    ]);
  });

  it("exposes navigation extensions from metadata", () => {
    const extensions = getNavigationExtensions(["dashboard.view"]);

    expect(extensions.map((item) => item.id)).toEqual(["solution-console"]);
  });

  it("resolves navigation extension metadata by id", async () => {
    const { getNavigationExtensionById } =
      await import("../../src/navigation-extensions");
    const extension = getNavigationExtensionById("solution-console");

    expect(extension?.href).toBe("/solution-console");
    expect(extension?.label).toBe("Solution Console");
  });
});
