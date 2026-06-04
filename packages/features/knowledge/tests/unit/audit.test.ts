import { beforeEach, describe, expect, it, vi } from "vitest";

const auditWriter = vi.hoisted(() => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
  writeExecutionAuditEventInTransaction: vi.fn(async () => undefined),
}));

vi.mock("server-only", () => ({}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: auditWriter.writeExecutionAuditEvent,
  writeExecutionAuditEventInTransaction:
    auditWriter.writeExecutionAuditEventInTransaction,
}));

import {
  createKnowledgeAuditEvent,
  createKnowledgeExecutionAuditEvent,
  emitKnowledgeAuditEvent,
} from "../../src/kno-audit.server";

describe("knowledge audit events", () => {
  beforeEach(() => {
    auditWriter.writeExecutionAuditEvent.mockClear();
    auditWriter.writeExecutionAuditEventInTransaction.mockClear();
  });

  it("redacts credential-like metadata keys", () => {
    const event = createKnowledgeAuditEvent({
      action: "erp.knowledge.document.embedded",
      organizationId: "org_1",
      sourceId: "src_1",
      documentId: "doc_1",
      result: "completed",
      metadata: {
        apiKey: "secret",
        nested: {
          authorization: "Bearer token",
          safe: "visible",
        },
      },
    });

    expect(event.action).toBe("erp.knowledge.document.embedded");
    expect(event.organizationId).toBe("org_1");
    expect(event.metadata).toMatchObject({
      apiKey: "[redacted]",
      nested: {
        authorization: "[redacted]",
        safe: "visible",
      },
    });
  });

  it("persists failed audit events through the kernel audit ledger", async () => {
    await emitKnowledgeAuditEvent({
      action: "erp.knowledge.source.sync.fail",
      organizationId: "org_1",
      sourceId: "src_1",
      result: "failed",
      error: new Error("sync failed token=secret-value"),
    });

    expect(auditWriter.writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "erp.knowledge.source.sync.fail",
        actorId: "system:knowledge",
        actorType: "service",
        channel: "cron",
        module: "knowledge",
        organizationId: "org_1",
        outcome: "failure",
        subjectId: "src_1",
        subjectType: "knowledge-source",
        targetId: "src_1",
        targetType: "system",
        metadata: expect.objectContaining({
          error: {
            name: "Error",
            message: "sync failed token=[redacted]",
          },
          result: "failed",
        }),
      }),
    );
  });

  it("creates execution audit events for knowledge documents", () => {
    const event = createKnowledgeExecutionAuditEvent({
      action: "erp.knowledge.document.embedded",
      organizationId: "org_1",
      sourceId: "src_1",
      documentId: "doc_1",
      result: "completed",
      durationMs: 25,
      metadata: {
        chunksInserted: 3,
      },
    });

    expect(event).toMatchObject({
      action: "erp.knowledge.document.embedded",
      actorId: "system:knowledge",
      actorType: "service",
      channel: "server_action",
      module: "knowledge",
      organizationId: "org_1",
      outcome: "success",
      subjectId: "doc_1",
      subjectType: "knowledge-document",
      targetId: "doc_1",
      targetType: "document",
      metadata: {
        chunksInserted: 3,
        durationMs: 25,
        level: "info",
        result: "completed",
      },
    });
  });
});
