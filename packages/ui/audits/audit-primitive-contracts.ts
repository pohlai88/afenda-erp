/**
 * Layer 3 — representative shadcn structure contract drift (exports owned by layer 1).
 */
import type { AuditViolation } from "./shared.ts";
import {
  getPrimitiveContract,
  listPrimitiveContracts,
} from "./primitive-contracts.ts";
import type { UiSourceCache, UiSourceFile } from "./source-cache.ts";

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
