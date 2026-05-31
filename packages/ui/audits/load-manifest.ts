/**
 * Cached loader for `.upstream/shadcn/manifest.json` — single source of export truth.
 */
import { existsSync, readFileSync } from "node:fs";

import type { ShadcnUpstreamManifest } from "./fingerprint.ts";
import { normalizeManifest } from "./fingerprint.ts";
import { upstreamManifestPath } from "./shared.ts";

export type UpstreamManifestState =
  | { status: "ok"; manifest: ShadcnUpstreamManifest }
  | { status: "missing" }
  | { status: "invalid"; message: string };

let cachedState: UpstreamManifestState | undefined;

/** Parse manifest JSON — exported for unit tests. */
export function parseUpstreamManifestJson(raw: string): UpstreamManifestState {
  try {
    const parsed = JSON.parse(raw) as ShadcnUpstreamManifest;
    if (parsed.version !== 1 || typeof parsed.files !== "object" || parsed.files == null) {
      return { status: "invalid", message: "manifest must be version 1 with a files map" };
    }
    return { status: "ok", manifest: normalizeManifest(parsed) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "invalid", message };
  }
}

export function loadUpstreamManifestState(): UpstreamManifestState {
  if (cachedState !== undefined) return cachedState;
  if (!existsSync(upstreamManifestPath)) {
    cachedState = { status: "missing" };
    return cachedState;
  }
  cachedState = parseUpstreamManifestJson(readFileSync(upstreamManifestPath, "utf8"));
  return cachedState;
}

/** Clears the in-process manifest cache (unit tests only). */
export function resetUpstreamManifestCacheForTests(): void {
  cachedState = undefined;
}

export function loadUpstreamManifest(): ShadcnUpstreamManifest | null {
  const state = loadUpstreamManifestState();
  return state.status === "ok" ? state.manifest : null;
}

export function manifestExportMap(): Record<string, string[]> {
  const state = loadUpstreamManifestState();
  if (state.status !== "ok") return {};
  const map: Record<string, string[]> = {};
  for (const [file, fp] of Object.entries(state.manifest.files)) {
    map[file] = fp.exports;
  }
  return map;
}
