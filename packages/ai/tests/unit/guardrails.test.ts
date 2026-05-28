import { describe, expect, it } from "vitest";
import {
  AiBudgetError,
  AiPermissionError,
  AiSensitiveContentError,
  assertAiBudget,
  assertCapabilityAllowed,
  assertNoSensitiveCredentialContent,
  hasSensitiveCredentialPattern,
  isAiBudgetError,
  isAiPermissionError,
  isAiSensitiveContentError,
  estimateTokenCount,
} from "../../src/guardrails";

describe("estimateTokenCount", () => {
  it("approximates token count at ~4 chars per token", () => {
    expect(estimateTokenCount("hello")).toBe(2); // 5 / 4 = 1.25 → ceil = 2
    expect(estimateTokenCount("a".repeat(400))).toBe(100);
  });
});

describe("assertAiBudget", () => {
  it("passes when under budget", () => {
    expect(() =>
      assertAiBudget({ estimatedTokens: 100, feature: "erp-assistant" }),
    ).not.toThrow();
  });

  it("throws AiBudgetError when over budget", () => {
    expect(() =>
      assertAiBudget({
        estimatedTokens: 99999,
        feature: "erp-assistant",
        maxTokens: 8000,
      }),
    ).toThrow(AiBudgetError);
  });

  it("isAiBudgetError identifies correct instance", () => {
    const err = new AiBudgetError("erp-assistant", 9000, 8000);
    expect(isAiBudgetError(err)).toBe(true);
    expect(isAiBudgetError(new Error("other"))).toBe(false);
  });
});

describe("assertCapabilityAllowed", () => {
  it("passes when capability is present", () => {
    expect(() =>
      assertCapabilityAllowed({
        capability: "finance.view",
        capabilities: ["finance.view", "dashboard.view"],
      }),
    ).not.toThrow();
  });

  it("throws AiPermissionError when capability is missing", () => {
    expect(() =>
      assertCapabilityAllowed({
        capability: "system-admin.view",
        capabilities: ["finance.view"],
      }),
    ).toThrow(AiPermissionError);
  });

  it("isAiPermissionError identifies correct instance", () => {
    const err = new AiPermissionError("system-admin.view");
    expect(isAiPermissionError(err)).toBe(true);
    expect(isAiPermissionError(new Error("other"))).toBe(false);
    expect(err.code).toBe("AI_PERMISSION_DENIED");
  });
});

describe("hasSensitiveCredentialPattern", () => {
  it("detects password-like strings", () => {
    expect(hasSensitiveCredentialPattern("my password is secret")).toBe(true);
    expect(hasSensitiveCredentialPattern("api_key=abc123")).toBe(true);
    expect(hasSensitiveCredentialPattern("TOKEN=xyz")).toBe(true);
  });

  it("does not flag benign text", () => {
    expect(hasSensitiveCredentialPattern("hello world")).toBe(false);
    expect(hasSensitiveCredentialPattern("invoice total 100")).toBe(false);
  });
});

describe("assertNoSensitiveCredentialContent", () => {
  it("throws AiSensitiveContentError on credential content", () => {
    expect(() =>
      assertNoSensitiveCredentialContent("my api_key is abc123"),
    ).toThrow(AiSensitiveContentError);
  });

  it("isAiSensitiveContentError identifies correct instance", () => {
    const err = new AiSensitiveContentError();
    expect(isAiSensitiveContentError(err)).toBe(true);
    expect(err.code).toBe("AI_SENSITIVE_CREDENTIAL_CONTENT");
  });

  it("passes clean text", () => {
    expect(() =>
      assertNoSensitiveCredentialContent("quarterly revenue 5.2M"),
    ).not.toThrow();
  });
});
