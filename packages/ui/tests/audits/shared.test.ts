import { describe, expect, it, vi } from "vitest";

import {
  MAX_VIOLATIONS_SHOWN,
  extractNamedExports,
  hasExportParserBlindSpot,
  printViolations,
} from "../../audits/shared";

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

  it("parses split export blocks", () => {
    const content = `export { Alpha }\nexport { Beta }`;
    expect(extractNamedExports(content)).toEqual(["Alpha", "Beta"]);
  });

  it("parses named function declarations", () => {
    const content = `export function AfendaThemeProvider() { return null }`;
    expect(extractNamedExports(content)).toEqual(["AfendaThemeProvider"]);
  });
});

describe("hasExportParserBlindSpot", () => {
  it("detects export syntax that extractNamedExports misses", () => {
    expect(
      hasExportParserBlindSpot(`export default function X() {}`, []),
    ).toBe(true);
  });

  it("returns false when exports were parsed", () => {
    expect(hasExportParserBlindSpot(`export { Button }`, ["Button"])).toBe(
      false,
    );
  });

  it("returns false for parsed named function exports", () => {
    expect(
      hasExportParserBlindSpot(
        `export function AfendaThemeProvider() { return null }`,
        ["AfendaThemeProvider"],
      ),
    ).toBe(false);
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
