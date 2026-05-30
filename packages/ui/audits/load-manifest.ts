/**
 * Cached loader for `.upstream/shadcn/manifest.json` — single source of export truth.
 */
import { existsSync, readFileSync } from "node:fs";

import type { ShadcnUpstreamManifest } from "./fingerprint.ts";
import { normalizeManifest } from "./fingerprint.ts";
import { upstreamManifestPath } from "./shared.ts";

let cachedManifest: ShadcnUpstreamManifest | null | undefined;

export function loadUpstreamManifest(): ShadcnUpstreamManifest | null {
  if (cachedManifest !== undefined) return cachedManifest;
  if (!existsSync(upstreamManifestPath)) {
    cachedManifest = null;
    return null;
  }
  cachedManifest = normalizeManifest(
    JSON.parse(readFileSync(upstreamManifestPath, "utf8")) as ShadcnUpstreamManifest,
  );
  return cachedManifest;
}

export function manifestExportMap(): Record<string, string[]> {
  const manifest = loadUpstreamManifest();
  if (!manifest) return {};
  const map: Record<string, string[]> = {};
  for (const [file, fp] of Object.entries(manifest.files)) {
    map[file] = fp.exports;
  }
  return map;
}

/** Test hook — reset module cache. */
export function resetManifestCache(): void {
  cachedManifest = undefined;
}
