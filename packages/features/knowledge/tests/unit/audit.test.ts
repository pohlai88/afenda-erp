import { describe, expect, it, vi } from "vitest";
import {
  createKnowledgeAuditEvent,
  emitKnowledgeAuditEvent,
} from "../../src/data/knowledge.audit.server";

describe("knowledge audit events", () => {
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

  it("emits failed audit events to stderr", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    emitKnowledgeAuditEvent({
      action: "erp.knowledge.source.sync.fail",
      organizationId: "org_1",
      sourceId: "src_1",
      result: "failed",
      error: new Error("sync failed token=secret-value"),
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const event = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(event).toMatchObject({
      level: "error",
      audit: true,
      action: "erp.knowledge.source.sync.fail",
      result: "failed",
      error: {
        message: "sync failed token=[redacted]",
      },
    });

    spy.mockRestore();
  });
});
