/**
 * Layer 4 — visual behavior drift via interface-lab previews + Playwright snapshots.
 *
 * Static gate: required preview routes and spec exist.
 * Runtime gate: pnpm test:visual (Playwright @visual).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { AuditViolation } from "./shared";
import { repoRoot, relPosix } from "./shared";

const INTERFACE_LAB_ROOT = join(
  repoRoot,
  "apps",
  "erp",
  "src",
  "app",
  "interface-lab",
);

const REQUIRED_PREVIEW_ROUTES = [
  "primitives/page.tsx",
] as const;

const VISUAL_SPEC = join(
  repoRoot,
  "apps",
  "erp",
  "tests",
  "e2e",
  "ui-primitives-visual.spec.ts",
);

export function auditVisualBehavior(options?: {
  strict?: boolean;
  /** Override for unit tests — defaults to fs.existsSync. */
  exists?: (path: string) => boolean;
}): AuditViolation[] {
  const strict = options?.strict ?? false;
  const exists = options?.exists ?? existsSync;
  const violations: AuditViolation[] = [];

  if (!exists(INTERFACE_LAB_ROOT)) {
    violations.push({
      layer: "visual-behavior",
      file: relPosix(INTERFACE_LAB_ROOT),
      line: 0,
      rule: "missing-interface-lab",
      match: "interface-lab",
      hint: "Create apps/erp/src/app/interface-lab for primitive screenshot previews",
      severity: strict ? "error" : "warn",
    });
    return violations;
  }

  for (const route of REQUIRED_PREVIEW_ROUTES) {
    const path = join(INTERFACE_LAB_ROOT, route);
    if (!exists(path)) {
      violations.push({
        layer: "visual-behavior",
        file: relPosix(path),
        line: 0,
        rule: "missing-preview-route",
        match: route,
        hint: "Add primitive preview page for visual regression",
        severity: strict ? "error" : "warn",
      });
    }
  }

  if (!exists(VISUAL_SPEC)) {
    violations.push({
      layer: "visual-behavior",
      file: relPosix(VISUAL_SPEC),
      line: 0,
      rule: "missing-visual-spec",
      match: "ui-primitives-visual.spec.ts",
      hint: "Add Playwright visual spec — run pnpm test:visual",
      severity: strict ? "error" : "warn",
    });
  }

  return violations;
}
