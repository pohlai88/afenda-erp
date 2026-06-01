import { describe, expect, it } from "vitest";

import {
  asGovernedRoute,
  isGovernedRoute,
} from "../../src/utils/governed-safe-route";

describe("governed safe route", () => {
  it("accepts internal app routes", () => {
    expect(isGovernedRoute("/dashboard")).toBe(true);
    expect(isGovernedRoute("/hr/records?page=2")).toBe(true);
    expect(isGovernedRoute("/system-admin/approvals#queue")).toBe(true);
    expect(asGovernedRoute("/lynx")).toBe("/lynx");
  });

  it("rejects unsafe routes", () => {
    expect(isGovernedRoute("https://evil.example/phish")).toBe(false);
    expect(isGovernedRoute("//evil.example/phish")).toBe(false);
    expect(isGovernedRoute("javascript:alert(1)")).toBe(false);
    expect(() => asGovernedRoute("https://evil.example/phish")).toThrow(
      "[governed-route] Unsafe route: https://evil.example/phish",
    );
  });
});
