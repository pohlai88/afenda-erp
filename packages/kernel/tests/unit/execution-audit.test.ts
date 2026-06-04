import { describe, expect, it } from "vitest";
import {
  buildExecutionAuditDbInput,
  buildExecutionAuditDiff,
  normalizeExecutionAuditEvent,
  redactExecutionAuditRecord,
  resolveExecutionAuditEntityType,
} from "../../src/ker-execution-audit";

describe("execution audit helpers", () => {
  it("normalizes summary, outcome, and redacts sensitive metadata", () => {
    const occurredAt = new Date("2026-01-02T03:04:05.000Z");

    const normalized = normalizeExecutionAuditEvent({
      organizationId: "org_123",
      actorId: "user_123",
      actorType: "user",
      action: "system_admin.role.assigned",
      targetType: "role",
      targetId: "role_1",
      metadata: {
        apiKey: "secret-value",
        nested: {
          token: "bearer-value",
          safe: "ok",
        },
      },
      before: {
        status: "draft",
        secretToken: "abc123",
      },
      after: {
        status: "active",
        secretToken: "def456",
      },
      occurredAt,
    });

    expect(normalized.summary).toBe(
      "system_admin.role.assigned executed against role:role_1.",
    );
    expect(normalized.outcome).toBe("success");
    expect(normalized.occurredAt).toBe(occurredAt);
    expect(normalized.metadata).toEqual({
      apiKey: "[redacted]",
      nested: {
        token: "[redacted]",
        safe: "ok",
      },
    });
    expect(normalized.before).toEqual({
      status: "draft",
      secretToken: "[redacted]",
    });
    expect(normalized.after).toEqual({
      status: "active",
      secretToken: "[redacted]",
    });
  });

  it("builds a 7W1H db input from the normalized event", () => {
    const normalized = normalizeExecutionAuditEvent({
      organizationId: "org_123",
      actorId: "user_123",
      actorType: "system",
      actorRole: "owner",
      subjectType: "membership",
      subjectId: "member_1",
      action: "system_admin.membership.updated",
      summary: "Updated membership privileges.",
      outcome: "success",
      targetType: "membership",
      targetId: "member_1",
      targetDisplayName: "Ada Lovelace",
      module: "system-admin",
      surface: "settings",
      route: "/system-admin/memberships",
      channel: "server_action",
      reason: "role alignment",
      policyReference: "policy:membership-update",
      approvalId: "approval_1",
      requestId: "req_1",
      operationId: "op_1",
      metadata: { step: "assign-role" },
      occurredAt: new Date("2026-01-02T03:04:05.000Z"),
    });

    const dbInput = buildExecutionAuditDbInput(normalized);

    expect(dbInput).toEqual(
      expect.objectContaining({
        organizationId: "org_123",
        actorAuthUserId: "user_123",
        actorType: "system",
        actorRole: "owner",
        subjectType: "membership",
        subjectId: "member_1",
        entityType: "membership",
        entityId: "member_1",
        action: "system_admin.membership.updated",
        summary: "Updated membership privileges.",
        outcome: "success",
        targetType: "membership",
        targetId: "member_1",
        targetDisplayName: "Ada Lovelace",
        module: "system-admin",
        surface: "settings",
        route: "/system-admin/memberships",
        channel: "server_action",
        reason: "role alignment",
        policyReference: "policy:membership-update",
        approvalId: "approval_1",
        requestId: "req_1",
        operationId: "op_1",
      }),
    );
  });

  it("redacts diff payloads before persistence", () => {
    const normalized = normalizeExecutionAuditEvent({
      organizationId: "org_123",
      actorId: "user_123",
      actorType: "user",
      action: "system_admin.role.updated",
      targetType: "role",
      targetId: "role_1",
      diff: [
        {
          path: "credentials.secret",
          change: "changed",
          before: { secretToken: "before" },
          after: { secretToken: "after" },
        },
      ],
    });

    expect(normalized.diff).toEqual([
      {
        path: "credentials.secret",
        change: "changed",
        before: { secretToken: "[redacted]" },
        after: { secretToken: "[redacted]" },
      },
    ]);
  });

  it("produces stable object diffs and exposes the entity type mapping", () => {
    expect(buildExecutionAuditDiff(
      {
        status: "draft",
        labels: ["one"],
      },
      {
        status: "released",
        labels: ["one", "two"],
      },
    )).toEqual([
      {
        path: "status",
        change: "changed",
        before: "draft",
        after: "released",
      },
      {
        path: "labels.[1]",
        change: "added",
        after: "two",
      },
    ]);

    expect(redactExecutionAuditRecord({
      password: "abc",
      safe: "value",
    })).toEqual({
      password: "[redacted]",
      safe: "value",
    });

    expect(resolveExecutionAuditEntityType("record")).toBe("erp-record");
    expect(resolveExecutionAuditEntityType("custom-target")).toBe("system");
  });
});
