/**
 * Layer 3 — per-file export and shadcn structure contract drift.
 */
import type { AuditViolation } from "./shared.ts";
import {
  getPrimitiveContract,
  listPrimitiveContracts,
} from "./primitive-contracts.ts";
import { extractNamedExports } from "./shared.ts";
import type { UiSourceCache, UiSourceFile } from "./source-cache.ts";

function auditContractExports(file: UiSourceFile): AuditViolation[] {
  const contract = getPrimitiveContract(file.fileName);
  if (!contract) return [];

  const actual = extractNamedExports(file.content);
  const actualSet = new Set(actual);
  const violations: AuditViolation[] = [];

  for (const expected of contract.exports) {
    if (!actualSet.has(expected)) {
      violations.push({
        layer: "primitive-contract",
        file: file.rel,
        line: 0,
        rule: "missing-export",
        match: expected,
        hint: "Expected primitive export disappeared — restore or run audit:shadcn-upstream:sync",
        severity: "error",
      });
    }
  }

  for (const name of actual) {
    if (!contract.exports.includes(name)) {
      violations.push({
        layer: "primitive-contract",
        file: file.rel,
        line: 0,
        rule: "unexpected-export",
        match: name,
        hint: "New export not in upstream manifest — run audit:shadcn-upstream:sync if intentional",
        severity: "warn",
      });
    }
  }

  return violations;
}

function auditRequiredPatterns(file: UiSourceFile): AuditViolation[] {
  const contract = getPrimitiveContract(file.fileName);
  if (!contract) return [];

  const violations: AuditViolation[] = [];
  for (const pattern of contract.requiredPatterns) {
    if (!pattern.test(file.content)) {
      violations.push({
        layer: "primitive-contract",
        file: file.rel,
        line: 0,
        rule: "missing-required-pattern",
        match: pattern.source,
        hint: "Required shadcn structure pattern missing from primitive",
        severity: "error",
      });
    }
  }
  return violations;
}

export function auditPrimitiveContractsFromCache(cache: UiSourceCache): AuditViolation[] {
  const violations: AuditViolation[] = [];
  const seenFiles = new Set<string>();

  for (const file of cache.files) {
    seenFiles.add(file.fileName);
    violations.push(...auditContractExports(file));
    violations.push(...auditRequiredPatterns(file));
  }

  for (const contract of listPrimitiveContracts()) {
    if (!seenFiles.has(contract.file) && contract.file !== "shell-frame.client.tsx") {
      violations.push({
        layer: "primitive-contract",
        file: `packages/ui/src/${contract.file}`,
        line: 0,
        rule: "missing-contract-file",
        match: contract.file,
        hint: "Contract declares a primitive file that does not exist in src",
        severity: "error",
      });
    }
  }

  return violations;
}
