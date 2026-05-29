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

    expect(extensions.map((item) => item.id)).toEqual(["lynx"]);
  });

  it("resolves navigation extension metadata by id", async () => {
    const { getNavigationExtensionById } =
      await import("../../src/shell/navigation-extensions");
    const extension = getNavigationExtensionById("lynx");

    expect(extension?.href).toBe("/lynx");
    expect(extension?.label).toBe("Lynx Console");
  });
});
