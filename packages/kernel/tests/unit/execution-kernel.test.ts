import { beforeEach, describe, expect, it } from "vitest";
import {
  requireExecutionPermission,
  resolveExecutionAccessVerdict,
} from "../../src/ker-execution-access";
import { resolveExecutionAuditEntityType } from "../../src/ker-execution-audit";
import {
  defineExecutionCapability,
  getExecutionCapability,
  listExecutionCapabilitiesForModule,
  resetExecutionCapabilityRegistryForTest,
} from "../../src/ker-execution-capabilities";
import type { ExecutionContext } from "../../src/ker-execution-context-types";
import { toExecutionAuthorityContext } from "../../src/ker-execution-context-types";
import {
  ExecutionAccessDeniedError,
  ExecutionInvalidStateError,
  ExecutionPolicyDeniedError,
} from "../../src/ker-execution-errors";
import {
  defineExecutionPolicy,
  resetExecutionPolicyRegistryForTest,
  resolveExecutionPolicyVerdict,
} from "../../src/ker-execution-policy";
import {
  executionStates,
  isExecutionState,
} from "../../src/ker-execution-state";

const context: ExecutionContext = {
  organizationId: "org_123",
  organizationSlug: "afenda-ops",
  userId: "user_123",
  membershipId: "member_123",
  locale: "en-MY",
  actorType: "user",
  capabilities: ["dashboard.view", "finance.view"],
  role: "owner",
  sessionSource: "dev",
};

describe("execution kernel", () => {
  beforeEach(() => {
    resetExecutionCapabilityRegistryForTest();
    resetExecutionPolicyRegistryForTest();
  });

  it("strips session-derived fields for authority-only boundaries", () => {
    expect(toExecutionAuthorityContext(context)).toEqual({
      organizationId: "org_123",
      organizationSlug: "afenda-ops",
      userId: "user_123",
      membershipId: "member_123",
      locale: "en-MY",
      actorType: "user",
    });
  });

  it("exposes built-in capability routing from current module contracts", () => {
    const capability = getExecutionCapability("system-admin.audit.read");

    expect(capability?.route).toBe("/system-admin/audit");
    expect(
      listExecutionCapabilitiesForModule("system-admin").some(
        (item) => item.key === "system-admin.audit.read",
      ),
    ).toBe(true);
  });

  it("rejects duplicate capability keys", () => {
    expect(() =>
      defineExecutionCapability({
        key: "finance.view",
        moduleKey: "finance",
        label: "Finance duplicate",
        requiredPermission: "finance.view",
        auditArea: "finance",
        status: "active",
      }),
    ).toThrow(ExecutionInvalidStateError);
  });

  it("returns a structured access verdict and denies missing permissions", () => {
    expect(resolveExecutionAccessVerdict(context, "finance.view")).toEqual({
      allowed: true,
      permission: "finance.view",
    });

    expect(() =>
      requireExecutionPermission(context, "system-admin.view"),
    ).toThrow(ExecutionAccessDeniedError);
  });

  it("separates policy denials from permission checks", async () => {
    defineExecutionPolicy("finance.period.close", ({ policy }) => ({
      allowed: false,
      action: policy.action,
      targetType: policy.targetType,
      targetId: policy.targetId,
      reason: "Closed periods cannot be edited.",
    }));

    const verdict = await resolveExecutionPolicyVerdict(context, {
      action: "finance.period.close",
      targetType: "erp-record",
      targetId: "record_123",
    });

    expect(verdict).toEqual({
      allowed: false,
      action: "finance.period.close",
      targetType: "erp-record",
      targetId: "record_123",
      reason: "Closed periods cannot be edited.",
    });

    expect(
      new ExecutionPolicyDeniedError(
        verdict.action,
        verdict.targetType,
        verdict.targetId,
        verdict.reason,
      ).code,
    ).toBe("EXECUTION_POLICY_DENIED");
  });

  it("normalizes audit target types to current database entity types", () => {
    expect(resolveExecutionAuditEntityType("record")).toBe("erp-record");
    expect(resolveExecutionAuditEntityType("custom-target")).toBe("system");
  });

  it("keeps the shared execution state vocabulary bounded", () => {
    expect(executionStates).toContain("resolving");
    expect(isExecutionState("released")).toBe(true);
    expect(isExecutionState("pending_review")).toBe(false);
  });
});
