/**
 * Layer 4 — visual behavior drift via interface-lab previews + Playwright snapshots.
 *
 * Static gate: required preview routes and spec exist.
 * Runtime gate: pnpm test:visual (Playwright @visual).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { AuditViolation } from "./shared.ts";
import { repoRoot, relPosix } from "./shared.ts";

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

export function auditVisualBehavior(options?: { strict?: boolean }): AuditViolation[] {
  const strict = options?.strict ?? false;
  const violations: AuditViolation[] = [];

  if (!existsSync(INTERFACE_LAB_ROOT)) {
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
    if (!existsSync(path)) {
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

  if (!existsSync(VISUAL_SPEC)) {
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
