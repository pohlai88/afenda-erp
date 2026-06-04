import { describe, expect, it } from "vitest";

import {
  assertHrMcpRuleVersionEditable,
  assertHrMcpRuleVersionPublishable,
  buildHrMcpRuleVersionSnapshotPayload,
  canTransitionHrMcpRuleVersion,
  formatHrMcpRuleVersionLabel,
  HrMcpRuleVersionError,
  isPublishedHrMcpRuleVersion,
  resolveFinalizedRuleVersionReference,
} from "./hr.payroll.mcp-rule-versioning.shared";

describe("HRM-MCP-023 rule versioning", () => {
  it("formats rule version labels", () => {
    expect(
      formatHrMcpRuleVersionLabel({ versionNumber: 3, versionStatus: "draft" }),
    ).toBe("v3 · Draft");
  });

  it("allows draft to published transition", () => {
    expect(canTransitionHrMcpRuleVersion("draft", "published")).toBe(true);
    expect(canTransitionHrMcpRuleVersion("published", "draft")).toBe(false);
  });

  it("blocks edits on published versions", () => {
    expect(() => assertHrMcpRuleVersionEditable("published")).toThrow(
      HrMcpRuleVersionError,
    );
    expect(() => assertHrMcpRuleVersionPublishable("draft")).not.toThrow();
  });

  it("builds snapshot payload for finalized payroll", () => {
    const snapshot = buildHrMcpRuleVersionSnapshotPayload({
      ruleVersionId: "hr_mcp_rulever_001",
      versionNumber: 2,
      countryConfigId: "hr_mcp_country_001",
      taxRules: [{ code: "PCB" }],
    });

    expect(snapshot.ruleVersionId).toBe("hr_mcp_rulever_001");
    expect(snapshot.taxRules).toHaveLength(1);
  });

  it("resolves finalized payroll rule version reference", () => {
    expect(
      resolveFinalizedRuleVersionReference({
        payrollRunRef: "RUN-2026-05",
        ruleVersionId: "hr_mcp_rulever_001",
        versionNumber: 2,
      }),
    ).toBe("RUN-2026-05::hr_mcp_rulever_001::v2");
  });

  it("detects published rule versions", () => {
    expect(isPublishedHrMcpRuleVersion("published")).toBe(true);
    expect(isPublishedHrMcpRuleVersion("draft")).toBe(false);
  });
});

describe("HRM-MCP-024 finalized rule snapshot reference", () => {
  it("embeds payroll run, rule version, and version number", () => {
    const reference = resolveFinalizedRuleVersionReference({
      payrollRunRef: "PR-001",
      ruleVersionId: "rv-001",
      versionNumber: 5,
    });

    expect(reference).toContain("PR-001");
    expect(reference).toContain("rv-001");
    expect(reference).toContain("v5");
  });
});
