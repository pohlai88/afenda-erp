import { describe, expect, it } from "vitest";
import {
  evaluateLynxEvalGate,
  getAggregateLynxReadinessStatus,
  getWorstLynxReadinessStatus,
  lynxReadinessSnapshotSchema,
} from "../../src/readiness-contract";

describe("Lynx readiness contract", () => {
  it("marks missing evals unavailable", () => {
    const gate = evaluateLynxEvalGate({});

    expect(gate.status).toBe("unavailable");
    expect(gate.reasons.join(" ")).toContain("No Lynx eval");
  });

  it("marks failed eval samples partial", () => {
    const gate = evaluateLynxEvalGate({
      latestEvalAt: new Date(),
      qualityMetrics: {
        recallAtK: 0.9,
        citationPrecision: 0.9,
        faithfulness: 0.9,
        unsupportedClaimRate: 0,
        noAnswerCorrectness: 1,
        promptInjectionResilience: 1,
      },
      failureSampleCount: 1,
    });

    expect(gate.status).toBe("partial");
    expect(gate.reasons).toContain("Recent eval run includes failed cases.");
  });

  it("parses a serializable readiness snapshot", () => {
    const snapshot = lynxReadinessSnapshotSchema.parse({
      organizationId: "org_1",
      generatedAt: new Date().toISOString(),
      status: "partial",
      summary: "Lynx is partially ready.",
      knowledge: {
        status: "partial",
        sourceCount: 1,
        documentCount: 1,
        chunkCount: 0,
        latestEvalAt: null,
        evalGate: {
          status: "unavailable",
          reasons: ["No Lynx eval run has been recorded."],
        },
      },
      modules: [],
      tools: [],
      enterpriseControls: [],
    });

    expect(snapshot.status).toBe("partial");
  });

  it("returns the lowest readiness status", () => {
    expect(getWorstLynxReadinessStatus(["available", "partial"])).toBe(
      "partial",
    );
    expect(getWorstLynxReadinessStatus(["available", "unavailable"])).toBe(
      "unavailable",
    );
  });

  it("aggregates mixed readiness as partial for enterprise rollout", () => {
    expect(
      getAggregateLynxReadinessStatus(["available", "unavailable"]),
    ).toBe("partial");
    expect(getAggregateLynxReadinessStatus(["unavailable"])).toBe(
      "unavailable",
    );
  });
});
