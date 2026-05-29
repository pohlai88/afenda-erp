import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src",
);

/** Root shim buckets removed per file-audit.md — content belongs in domain verticals. */
const FORBIDDEN_ROOT_SHIM_DIRS = [
  "actions",
  "components",
  "contracts",
  "data",
  "events",
  "schemas",
  "surfaces",
] as const;

describe("system admin package structure", () => {
  it("does not reintroduce root shim directories under src/", () => {
    const entries = new Set(readdirSync(srcRoot));
    const found = FORBIDDEN_ROOT_SHIM_DIRS.filter((dir) => entries.has(dir));

    expect(
      found,
      `Remove src/{${found.join(",")}} — relocate into a domain vertical (see file-audit.md)`,
    ).toEqual([]);
  });

  it("keeps export-door files at src/ root", () => {
    const exportDoors = ["client.ts", "index.ts", "metadata.ts", "server.ts"];

    for (const file of exportDoors) {
      expect(existsSync(path.join(srcRoot, file)), `missing src/${file}`).toBe(
        true,
      );
    }
  });
});
