import { describe, expect, it } from "vitest";

import { auditTokenDriftFromCache } from "../../audits/audit-token-drift";
import type { UiSourceCache, UiSourceFile } from "../../audits/source-cache";

function mockFile(
  fileName: string,
  lines: string[],
  content = lines.join("\n"),
): UiSourceFile {
  return {
    path: `/fake/${fileName}`,
    fileName,
    rel: `packages/ui/src/${fileName}`,
    content,
    lines,
    fingerprint: null,
  };
}

function cacheWith(...files: UiSourceFile[]): UiSourceCache {
  return {
    files,
    shadcnByName: new Map(files.map((file) => [file.fileName, file])),
  };
}

describe("auditTokenDriftFromCache", () => {
  it("allows progress indicator inline transform via contract whitelist", () => {
    const line =
      '        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}';
    const violations = auditTokenDriftFromCache(
      cacheWith(mockFile("progress.tsx", [line])),
    );

    expect(violations.filter((v) => v.rule === "no-inline-style")).toEqual([]);
  });

  it("flags inline style on primitives without whitelist", () => {
    const line = '      style={{ opacity: 0.5 }}';
    const violations = auditTokenDriftFromCache(
      cacheWith(mockFile("input.tsx", [line])),
    );

    expect(violations.some((v) => v.rule === "no-inline-style")).toBe(true);
  });

  it("flags raw palette tokens", () => {
    const line = '      className="bg-slate-500 text-white"';
    const violations = auditTokenDriftFromCache(
      cacheWith(mockFile("badge.tsx", [line])),
    );

    expect(violations).toContainEqual(
      expect.objectContaining({ rule: "no-raw-palette-in-ui" }),
    );
  });

  it("does not false-exit description slots when braces appear in template literals", () => {
    const lines = [
      "function CardDescription({ className }: { className?: string }) {",
      '  const label = `{${"{not a block}"}}`;',
      '  return <p className="text-sm text-muted-foreground">{label}</p>;',
      "}",
    ];
    const violations = auditTokenDriftFromCache(
      cacheWith(mockFile("card.tsx", lines, lines.join("\n"))),
    );

    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: "primitive-description-drift",
        line: 3,
      }),
    );
  });
});
