import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const sourceRoots = ["apps", "packages"];
const rootAiImportPattern =
  /\b(?:import|export)\b[\s\S]*?\bfrom\s+["']@afenda\/ai["']|vi\.mock\(["']@afenda\/ai["']/;

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (["dist", "node_modules"].includes(entry)) {
        return [];
      }

      return collectSourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe("@afenda/ai import boundaries", () => {
  it("keeps runtime consumers on explicit server/client doors", () => {
    const violations = sourceRoots
      .flatMap((sourceRoot) => collectSourceFiles(join(repoRoot, sourceRoot)))
      .filter((file) => rootAiImportPattern.test(readFileSync(file, "utf8")))
      .map((file) => relative(repoRoot, file));

    expect(violations).toEqual([]);
  });
});
