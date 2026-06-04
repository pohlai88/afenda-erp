import { describe, expect, it } from "vitest";
import {
  getLynxChatStatus,
  getLynxRunStepState,
  isSafeLynxHref,
  linkLynxCitations,
} from "../../src/lyn-chat-format.shared";
import {
  getLynxToolStateLabel,
  getLynxToolStateTone,
} from "../../src/lyn-tool-state.shared";
import { getLynxToolDisplayName } from "../../src/lyn-tool-output.component.client";

describe("Lynx chat formatting", () => {
  it("maps AI SDK statuses to Lynx-facing states", () => {
    expect(getLynxChatStatus("ready")).toBe("ready");
    expect(getLynxChatStatus("submitted")).toBe("listening");
    expect(getLynxChatStatus("streaming")).toBe("resolving");
    expect(getLynxChatStatus("error")).toBe("blocked");
  });

  it("links numbered citations outside fenced code blocks", () => {
    const markdown = [
      "Answer [1] and [2].",
      "```",
      "Keep [3] plain inside code.",
      "```",
      "Already linked [4](#existing).",
    ].join("\n");

    expect(linkLynxCitations(markdown, "evidence")).toBe(
      [
        "Answer [[1]](#evidence-1) and [[2]](#evidence-2).",
        "```",
        "Keep [3] plain inside code.",
        "```",
        "Already linked [4](#existing).",
      ].join("\n"),
    );
  });

  it("allows only internal anchors, internal routes, and https links", () => {
    expect(isSafeLynxHref("#evidence-1")).toBe(true);
    expect(isSafeLynxHref("/lynx")).toBe(true);
    expect(isSafeLynxHref("https://example.com")).toBe(true);
    expect(isSafeLynxHref("http://example.com")).toBe(false);
    expect(isSafeLynxHref("javascript:alert(1)")).toBe(false);
  });

  it("maps runtime states to run step states", () => {
    expect(getLynxRunStepState("output-available")).toBe("verified");
    expect(getLynxRunStepState("approval-requested")).toBe("resolving");
    expect(getLynxRunStepState("approval-responded")).toBe("resolving");
    expect(getLynxRunStepState("output-denied")).toBe("blocked");
    expect(getLynxRunStepState("output-error")).toBe("blocked");
    expect(getLynxRunStepState(undefined)).toBe("listening");
  });
});

describe("Lynx tool state formatting", () => {
  it("prefers AI SDK dynamic tool names over generic part types", () => {
    expect(
      getLynxToolDisplayName({
        state: "input-available",
        toolCallId: "call_1",
        toolName: "inspectLynxReadiness",
        type: "dynamic-tool",
      }),
    ).toBe("inspectLynxReadiness");

    expect(
      getLynxToolDisplayName({
        state: "input-available",
        type: "tool-readiness",
      }),
    ).toBe("readiness");
  });

  it("normalizes AI SDK tool states for operator display", () => {
    expect(getLynxToolStateLabel("input-streaming")).toBe("resolving");
    expect(getLynxToolStateLabel("output-available")).toBe("completed");
    expect(getLynxToolStateLabel("output-error")).toBe("blocked");
    expect(getLynxToolStateLabel("output-denied")).toBe("rejected");
    expect(getLynxToolStateLabel("approval-requested")).toBe(
      "awaiting approval",
    );
    expect(getLynxToolStateLabel("approval-responded")).toBe(
      "approval recorded",
    );
  });

  it("maps tool states to semantic tones", () => {
    expect(getLynxToolStateTone("output-available")).toBe("success");
    expect(getLynxToolStateTone("approval-requested")).toBe("warning");
    expect(getLynxToolStateTone("approval-responded")).toBe("warning");
    expect(getLynxToolStateTone("output-denied")).toBe("critical");
    expect(getLynxToolStateTone("output-error")).toBe("critical");
  });
});
