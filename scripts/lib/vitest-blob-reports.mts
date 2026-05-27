/**
 * Vitest blob reporter writes to `.vitest-reports/` (hardcoded in Vitest).
 * Junction/symlink that path → `.artifacts/vitest-reports` keeps the repo root clean.
 */
import fs from "node:fs";
import path from "node:path";

import {
  VITEST_BLOB_REPORTS_DIR,
  VITEST_BLOB_REPORTS_LINK,
} from "./artifacts-paths.mts";

export function ensureVitestBlobReportsLink(root: string) {
  const artifactsDir = path.join(root, VITEST_BLOB_REPORTS_DIR);
  const linkPath = path.join(root, VITEST_BLOB_REPORTS_LINK);

  fs.mkdirSync(artifactsDir, { recursive: true });

  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      for (const entry of fs.readdirSync(linkPath)) {
        const from = path.join(linkPath, entry);
        const to = path.join(artifactsDir, entry);
        if (fs.existsSync(to)) {
          fs.rmSync(to, { recursive: true, force: true });
        }
        fs.renameSync(from, to);
      }
      fs.rmdirSync(linkPath);
    } else {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
  }

  const relativeTarget = path.relative(path.dirname(linkPath), artifactsDir);
  const linkType = process.platform === "win32" ? "junction" : "dir";
  fs.symlinkSync(relativeTarget, linkPath, linkType);
}
