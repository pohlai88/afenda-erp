import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import { evaluateKnowledgeEvalGate, type EvalRunMetrics } from "../../src/server/eval";

vi.mock("server-only", () => ({}));

const passingMetrics: EvalRunMetrics = {
  recallAtK: 0.9,
  mrr: 0.9,
  evidenceOverlap: 0.7,
  faithfulness: 0.9,
  citationPrecision: 0.9,
  unsupportedClaimRate: 0,
  noAnswerCorrectness: 1,
  promptInjectionResilience: 1,
};

describe("Knowledge eval gates", () => {
  it("passes enterprise thresholds", () => {
    expect(evaluateKnowledgeEvalGate(passingMetrics)).toEqual([]);
  });

  it("flags low citation precision", () => {
    expect(
      evaluateKnowledgeEvalGate({
        ...passingMetrics,
        citationPrecision: 0.5,
      }),
    ).toContain("low-citation-precision");
  });

  it("flags unsupported claims", () => {
    expect(
      evaluateKnowledgeEvalGate({
        ...passingMetrics,
        unsupportedClaimRate: 1,
      }),
    ).toContain("unsupported-claim");
  });

  it("flags prompt injection leaks", () => {
    expect(
      evaluateKnowledgeEvalGate({
        ...passingMetrics,
        promptInjectionResilience: 0,
      }),
    ).toContain("prompt-injection-leak");
  });
});
