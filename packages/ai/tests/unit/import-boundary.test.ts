import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { findRootAiImportViolations } from "../../scripts/check-import-boundary.shared";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("@afenda/ai import boundaries", () => {
  it("keeps runtime consumers on explicit server/client doors", () => {
    expect(findRootAiImportViolations(repoRoot)).toEqual([]);
  });
});
