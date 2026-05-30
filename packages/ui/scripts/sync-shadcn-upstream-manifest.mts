/**
 * Regenerates `.upstream/shadcn/manifest.json` from current `packages/ui/src`.
 *
 * Run after intentional shadcn add/upgrade or Afenda fork edits that change exports/structure.
 *
 *   pnpm audit:shadcn-upstream:sync
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  fingerprintFile,
  type ShadcnUpstreamManifest,
} from "../audits/fingerprint.ts";
import {
  fileNameFromPath,
  isShadcnPrimitiveFile,
  upstreamDir,
  upstreamManifestPath,
  walkUiTsxFiles,
} from "../audits/shared.ts";

function main(): void {
  mkdirSync(upstreamDir, { recursive: true });

  const files: ShadcnUpstreamManifest["files"] = {};
  for (const filePath of walkUiTsxFiles()) {
    const fileName = fileNameFromPath(filePath);
    if (!isShadcnPrimitiveFile(fileName)) continue;
    files[fileName] = fingerprintFile(filePath);
  }

  const manifest: ShadcnUpstreamManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    note:
      "Approved shadcn structure snapshot for @afenda/ui. Regenerate only after intentional primitive changes.",
    files,
  };

  writeFileSync(upstreamManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${upstreamManifestPath} (${Object.keys(files).length} primitives)`);
}

main();
