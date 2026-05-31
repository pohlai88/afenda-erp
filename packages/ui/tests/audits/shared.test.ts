import { describe, expect, it, vi } from "vitest";

import {
  MAX_VIOLATIONS_SHOWN,
  extractNamedExports,
  printViolations,
} from "../../audits/shared.ts";

describe("extractNamedExports", () => {
  it("parses a simple export block", () => {
    const content = `export { Button, buttonVariants }`;
    expect(extractNamedExports(content)).toEqual(["Button", "buttonVariants"]);
  });

  it("handles aliased exports", () => {
    const content = `export { Foo as Bar, Baz }`;
    expect(extractNamedExports(content)).toEqual(["Bar", "Baz"]);
  });

  it("returns empty array when no export block exists", () => {
    expect(extractNamedExports(`export default function X() {}`)).toEqual([]);
  });

  it("uses only the first export block", () => {
    const content = `export { Alpha }\nexport { Beta }`;
    expect(extractNamedExports(content)).toEqual(["Alpha"]);
  });
});

describe("printViolations", () => {
  it("counts all violations when output is truncated", () => {
    const violations = Array.from({ length: MAX_VIOLATIONS_SHOWN + 5 }, (_, index) => ({
      layer: "test",
      file: "file.tsx",
      line: index + 1,
      rule: "test-rule",
      match: "match",
      hint: "hint",
      severity: index % 2 === 0 ? ("error" as const) : ("warn" as const),
    }));

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { errors, warnings } = printViolations("Test layer", violations, 3);

    expect(errors).toBe(Math.ceil((MAX_VIOLATIONS_SHOWN + 5) / 2));
    expect(warnings).toBe(Math.floor((MAX_VIOLATIONS_SHOWN + 5) / 2));
    expect(logSpy.mock.calls.some(([line]) => String(line).includes("truncated"))).toBe(
      true,
    );

    logSpy.mockRestore();
  });
});
