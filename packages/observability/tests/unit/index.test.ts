import { describe, expect, it } from "vitest";
import {
  getProductionHardeningChecklist,
  getWorkspaceObservabilitySummary,
  summarizeDrainPayload,
  verifyVercelSignature,
} from "../../src/index";

describe("@afenda/observability", () => {
  it("summarizes json-array drain payloads", () => {
    expect(
      summarizeDrainPayload(
        JSON.stringify([{ level: "info" }, { level: "warn" }]),
      ),
    ).toEqual({
      eventCount: 2,
      payloadType: "json-array",
    });
  });

  it("summarizes ndjson drain payloads", () => {
    expect(
      summarizeDrainPayload('{"level":"info"}\n{"level":"error"}\n'),
    ).toEqual({
      eventCount: 2,
      payloadType: "ndjson",
    });
  });

  it("rejects invalid vercel signatures", async () => {
    await expect(
      verifyVercelSignature({
        rawBody: '{"events":[]}',
        signature: null,
        secret: "test-secret",
      }),
    ).resolves.toBe(false);
  });

  it("exposes workspace observability indicators", () => {
    const summary = getWorkspaceObservabilitySummary();

    expect(summary.indicators.length).toBeGreaterThan(0);
    expect(
      getProductionHardeningChecklist().some((item) => item.area === "RLS"),
    ).toBe(true);
  });
});
