import { describe, expect, it } from "vitest";
import { LYNX_TOOL_IDS, lynxToolMeta } from "../../src/tools/lynx.tool-meta";

describe("Lynx governed tool metadata", () => {
  it("declares governed metadata for every Lynx tool id", () => {
    expect(Object.keys(lynxToolMeta).sort()).toEqual([...LYNX_TOOL_IDS].sort());

    for (const toolId of LYNX_TOOL_IDS) {
      const meta = lynxToolMeta[toolId];

      expect(meta, `Missing metadata for ${toolId}`).toBeDefined();
      expect(["low", "medium", "high"]).toContain(meta.risk);
      expect(["read", "write"]).toContain(meta.access);
      expect(["silent", "record"]).toContain(meta.audit);
    }
  });
});
