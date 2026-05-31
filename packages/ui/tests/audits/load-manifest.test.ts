import { describe, expect, it } from "vitest";

import { parseUpstreamManifestJson } from "../../audits/load-manifest.ts";

const validManifest = JSON.stringify({
  version: 1,
  generatedAt: "2026-01-01T00:00:00.000Z",
  note: "test",
  files: {
    "button.tsx": {
      exports: ["Button"],
      rootFunctions: ["Button"],
      dataSlots: ["button"],
      displayNames: ["Button"],
      hasCva: true,
      hasSlot: true,
      hasCn: true,
      hasReactImport: true,
    },
  },
});

describe("parseUpstreamManifestJson", () => {
  it("returns ok state for a valid manifest", () => {
    const state = parseUpstreamManifestJson(validManifest);

    expect(state.status).toBe("ok");
    if (state.status === "ok") {
      expect(state.manifest.files["button.tsx"]?.exports).toEqual(["Button"]);
    }
  });

  it("returns invalid state for corrupt JSON", () => {
    const state = parseUpstreamManifestJson("{ not json");

    expect(state).toEqual({ status: "invalid", message: expect.any(String) });
  });

  it("returns invalid state when version or files map is wrong", () => {
    expect(parseUpstreamManifestJson(JSON.stringify({ version: 2, files: {} }))).toEqual({
      status: "invalid",
      message: "manifest must be version 1 with a files map",
    });

    expect(parseUpstreamManifestJson(JSON.stringify({ version: 1 }))).toEqual({
      status: "invalid",
      message: "manifest must be version 1 with a files map",
    });
  });
});
