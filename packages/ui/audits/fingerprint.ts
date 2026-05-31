/**
 * Structural fingerprints for shadcn upstream contract snapshots.
 *
 * compareFingerprints is intentionally asymmetric: removals (exports, slots,
 * structure flags) are errors; additions are warnings for exports only — new
 * root functions, data-slots, and structure flags are not flagged.
 */
import type { AuditViolation } from "./shared";
import {
  extractDataSlots,
  extractDisplayNames,
  extractNamedExports,
  extractRootFunctions,
  readUiFile,
} from "./shared";

export type ShadcnFileFingerprint = {
  exports: string[];
  rootFunctions: string[];
  dataSlots: string[];
  displayNames: string[];
  hasCva: boolean;
  hasSlot: boolean;
  hasCn: boolean;
  hasReactImport: boolean;
};

export type ShadcnUpstreamManifest = {
  version: 1;
  generatedAt: string;
  note: string;
  files: Record<string, ShadcnFileFingerprint>;
};

export function fingerprintContent(content: string): ShadcnFileFingerprint {
  return {
    exports: extractNamedExports(content),
    rootFunctions: extractRootFunctions(content),
    dataSlots: extractDataSlots(content),
    displayNames: extractDisplayNames(content),
    hasCva: /\bcva\s*\(/.test(content),
    hasSlot: /\bSlot\b/.test(content),
    hasCn: /\bcn\s*\(/.test(content),
    hasReactImport: /import \* as React from "react"/.test(content),
  };
}

export function fingerprintFile(filePath: string): ShadcnFileFingerprint {
  const { content } = readUiFile(filePath);
  return fingerprintContent(content);
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function diffRemoved(current: string[], baseline: string[]): string[] {
  const currentSet = new Set(current);
  return baseline.filter((value) => !currentSet.has(value));
}

function diffAdded(current: string[], baseline: string[]): string[] {
  const baselineSet = new Set(baseline);
  return current.filter((value) => !baselineSet.has(value));
}

export function compareFingerprints(
  file: string,
  current: ShadcnFileFingerprint,
  baseline: ShadcnFileFingerprint,
): AuditViolation[] {
  const violations: AuditViolation[] = [];

  for (const name of diffRemoved(current.exports, baseline.exports)) {
    violations.push({
      layer: "shadcn-upstream",
      file,
      line: 0,
      rule: "export-removed",
      match: name,
      hint: "Expected export disappeared — restore or run audit:shadcn-upstream:sync after intentional change",
      severity: "error",
    });
  }

  for (const name of diffAdded(current.exports, baseline.exports)) {
    violations.push({
      layer: "shadcn-upstream",
      file,
      line: 0,
      rule: "export-added",
      match: name,
      hint: "New export not in upstream manifest — run audit:shadcn-upstream:sync if intentional",
      severity: "warn",
    });
  }

  for (const name of diffRemoved(current.rootFunctions, baseline.rootFunctions)) {
    violations.push({
      layer: "shadcn-upstream",
      file,
      line: 0,
      rule: "root-function-removed",
      match: name,
      hint: "Root primitive function removed or renamed",
      severity: "error",
    });
  }

  for (const name of diffRemoved(current.dataSlots, baseline.dataSlots)) {
    violations.push({
      layer: "shadcn-upstream",
      file,
      line: 0,
      rule: "data-slot-removed",
      match: name,
      hint: "data-slot attribute removed — shadcn structure drift",
      severity: "error",
    });
  }

  for (const name of diffRemoved(current.displayNames, baseline.displayNames)) {
    violations.push({
      layer: "shadcn-upstream",
      file,
      line: 0,
      rule: "display-name-removed",
      match: name,
      hint: "displayName removed from primitive part",
      severity: "error",
    });
  }

  const structureFlags: Array<{
    key: keyof Pick<
      ShadcnFileFingerprint,
      "hasCva" | "hasSlot" | "hasCn" | "hasReactImport"
    >;
    label: string;
  }> = [
    { key: "hasCva", label: "cva(" },
    { key: "hasSlot", label: "Slot" },
    { key: "hasCn", label: "cn(" },
    { key: "hasReactImport", label: 'import * as React from "react"' },
  ];

  for (const { key, label } of structureFlags) {
    if (baseline[key] && !current[key]) {
      violations.push({
        layer: "shadcn-upstream",
        file,
        line: 0,
        rule: "structure-regressed",
        match: label,
        hint: `Required shadcn pattern missing: ${label}`,
        severity: "error",
      });
    }
  }

  return violations;
}

export function normalizeManifest(manifest: ShadcnUpstreamManifest): ShadcnUpstreamManifest {
  const files: Record<string, ShadcnFileFingerprint> = {};
  for (const [file, fp] of Object.entries(manifest.files)) {
    files[file] = {
      exports: sortedUnique(fp.exports),
      rootFunctions: sortedUnique(fp.rootFunctions),
      dataSlots: sortedUnique(fp.dataSlots),
      displayNames: sortedUnique(fp.displayNames),
      hasCva: fp.hasCva,
      hasSlot: fp.hasSlot,
      hasCn: fp.hasCn,
      hasReactImport: fp.hasReactImport,
    };
  }
  return { ...manifest, files };
}
