import { describe, expect, it } from "vitest";

import { auditShadcnUpstreamFromCache } from "../../audits/audit-shadcn-boundary";
import type { ShadcnFileFingerprint } from "../../audits/fingerprint";
import type { UiSourceCache, UiSourceFile } from "../../audits/source-cache";

function emptyFingerprint(
  overrides: Partial<ShadcnFileFingerprint> = {},
): ShadcnFileFingerprint {
  return {
    exports: [],
    rootFunctions: [],
    dataSlots: [],
    displayNames: [],
    hasCva: false,
    hasSlot: false,
    hasCn: false,
    hasReactImport: false,
    ...overrides,
  };
}

function mockShadcnFile(
  fileName: string,
  content: string,
  fingerprint: ShadcnFileFingerprint,
): UiSourceFile {
  return {
    path: `/fake/${fileName}`,
    fileName,
    rel: `packages/ui/src/${fileName}`,
    content,
    lines: content.split("\n"),
    fingerprint,
  };
}

function emptyCache(): UiSourceCache {
  return { files: [], shadcnByName: new Map() };
}

describe("auditShadcnUpstreamFromCache", () => {
  it("returns a single error when upstream manifest is missing", () => {
    const violations = auditShadcnUpstreamFromCache(emptyCache(), {
      status: "missing",
    });

    expect(violations).toEqual([
      expect.objectContaining({
        rule: "missing-upstream-manifest",
        severity: "error",
      }),
    ]);
  });

  it("returns a single error when upstream manifest is invalid", () => {
    const violations = auditShadcnUpstreamFromCache(emptyCache(), {
      status: "invalid",
      message: "bad json",
    });

    expect(violations).toEqual([
      expect.objectContaining({
        rule: "invalid-upstream-manifest",
        match: "bad json",
        severity: "error",
      }),
    ]);
  });

  it("warns when export syntax is not parsed by the first export block heuristic", () => {
    const fileName = "button.tsx";
    const content = `export type ButtonProps = { label: string }\nexport default function Button() {}`;
    const file = mockShadcnFile(fileName, content, emptyFingerprint());
    const cache: UiSourceCache = {
      files: [file],
      shadcnByName: new Map([[fileName, file]]),
    };

    const violations = auditShadcnUpstreamFromCache(cache, {
      status: "ok",
      manifest: {
        version: 1,
        generatedAt: "2026-01-01T00:00:00.000Z",
        note: "test",
        files: { [fileName]: emptyFingerprint() },
      },
    });

    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: "export-parser-blind-spot",
        severity: "warn",
        file: `packages/ui/src/${fileName}`,
      }),
    );
  });
});
