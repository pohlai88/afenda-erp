/**
 * Layer 1 — shadcn upstream structure drift vs `.upstream/shadcn/manifest.json`.
 */
import type { AuditViolation } from "./shared.ts";
import { relPosix, upstreamManifestPath } from "./shared.ts";
import { compareFingerprints } from "./fingerprint.ts";
import type { UpstreamManifestState } from "./load-manifest.ts";
import type { UiSourceCache } from "./source-cache.ts";

export function auditShadcnUpstreamFromCache(
  cache: UiSourceCache,
  manifestState: UpstreamManifestState,
): AuditViolation[] {
  if (manifestState.status === "missing") {
    return [
      {
        layer: "shadcn-upstream",
        file: relPosix(upstreamManifestPath),
        line: 0,
        rule: "missing-upstream-manifest",
        match: upstreamManifestPath,
        hint: "Run pnpm audit:shadcn-upstream:sync to create the approved upstream snapshot",
        severity: "error",
      },
    ];
  }

  if (manifestState.status === "invalid") {
    return [
      {
        layer: "shadcn-upstream",
        file: relPosix(upstreamManifestPath),
        line: 0,
        rule: "invalid-upstream-manifest",
        match: manifestState.message,
        hint: "Fix manifest JSON or regenerate with pnpm audit:shadcn-upstream:sync",
        severity: "error",
      },
    ];
  }

  const { manifest } = manifestState;
  const violations: AuditViolation[] = [];

  for (const [fileName, baseline] of Object.entries(manifest.files)) {
    const currentFile = cache.shadcnByName.get(fileName);
    if (!currentFile?.fingerprint) {
      violations.push({
        layer: "shadcn-upstream",
        file: `packages/ui/src/${fileName}`,
        line: 0,
        rule: "primitive-file-removed",
        match: fileName,
        hint: "Primitive file removed from src — restore or update upstream manifest",
        severity: "error",
      });
      continue;
    }
    violations.push(
      ...compareFingerprints(
        `packages/ui/src/${fileName}`,
        currentFile.fingerprint,
        baseline,
      ),
    );
  }

  for (const fileName of cache.shadcnByName.keys()) {
    if (!manifest.files[fileName]) {
      violations.push({
        layer: "shadcn-upstream",
        file: `packages/ui/src/${fileName}`,
        line: 0,
        rule: "primitive-file-added",
        match: fileName,
        hint: "New primitive file — run audit:shadcn-upstream:sync after shadcn add",
        severity: "warn",
      });
    }
  }

  return violations;
}
