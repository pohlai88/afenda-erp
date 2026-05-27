/**
 * Ensures `.artifacts/` layout and Vitest blob junction.
 *
 *   pnpm artifacts:init
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ensureArtifactsSubdirs,
  migrateLegacyFlatArtifacts,
  migrateLegacyPlaywrightArtifacts,
} from "./lib/artifacts-paths.mts";
import { ensureVitestBlobReportsLink } from "./lib/vitest-blob-reports.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

ensureArtifactsSubdirs(root);
migrateLegacyFlatArtifacts(root);
migrateLegacyPlaywrightArtifacts(root);
ensureVitestBlobReportsLink(root);

console.log(
  "[artifacts:init] .artifacts layout ready (coverage/, logs/, reports/, playwright/, vitest-reports junction)",
);
