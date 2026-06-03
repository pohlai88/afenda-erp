import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getRequestId } from "../../src/index";
import { logServerEvent } from "../../src/server";
import { createChildLogger } from "../../src/logger/create-child-logger";
import { hasStructuralLogContract } from "../../src/logger/logger.schema";
import { redactLogPayload } from "../../src/logger/redact-policy";
import { serializeError } from "../../src/logger/serializers";
import { captureConsoleLogs } from "../../src/testing/log-capture";

describe("structural logger", () => {
  it("redacts secret-like keys", () => {
    const redacted = redactLogPayload({
      authorization: "Bearer token",
      nested: {
        apiKey: "secret",
        visible: "ok",
      },
    });

    expect(redacted).toEqual({
      authorization: "[redacted]",
      nested: {
        apiKey: "[redacted]",
        visible: "ok",
      },
    });
  });

  it("binds child logger context", () => {
    const child = vi.fn();
    const logger = { child };

    createChildLogger(logger as never, {
      domain: "system-admin",
      requestId: "req_test",
      authorization: "Bearer token",
    });

    expect(child).toHaveBeenCalledWith({
      domain: "system-admin",
      requestId: "req_test",
      authorization: "[redacted]",
    });
  });

  it("keeps server logServerEvent best-effort", () => {
    expect(() => {
      logServerEvent(
        "info",
        "Route completed.",
        {
          module: "observability",
          operation: "test",
          requestId: "req_test",
        },
        {
          status: 200,
          token: "secret",
        },
      );
    }).not.toThrow();
  });

  it("validates the structural log contract", () => {
    expect(
      hasStructuralLogContract({
        event: "workflow.execution.completed",
        level: "info",
        requestId: "req_test",
        operationId: "op_test",
        organizationId: "org_test",
      }),
    ).toBe(true);
    expect(hasStructuralLogContract({ event: "" })).toBe(false);
    expect(
      hasStructuralLogContract({
        event: "workflow.execution.completed",
        level: "verbose",
      }),
    ).toBe(false);
    expect(
      hasStructuralLogContract({
        event: "workflow.execution.completed",
        organizationId: 123,
      }),
    ).toBe(false);
  });

  it("redacts high-risk payload fields and caps snapshots", () => {
    const redacted = redactLogPayload({
      event: "upload.received",
      rawBody: "secret body",
      paymentCredentials: {
        cardNumber: "4111111111111111",
      },
      documentId: "doc_visible_identifier",
      items: Array.from({ length: 25 }, (_, index) => index),
    });

    expect(redacted).toMatchObject({
      event: "upload.received",
      rawBody: "[redacted]",
      paymentCredentials: "[redacted]",
      documentId: "doc_visible_identifier",
    });
    expect(redacted.items).toHaveLength(20);
  });

  it("extracts request IDs with Vercel header precedence", () => {
    const request = new Request("https://example.test", {
      headers: {
        "x-vercel-id": "vercel_req",
        "x-request-id": "plain_req",
      },
    });

    expect(getRequestId(request)).toBe("vercel_req");
  });

  it("falls back to x-request-id", () => {
    const request = new Request("https://example.test", {
      headers: {
        "x-request-id": "plain_req",
      },
    });

    expect(getRequestId(request)).toBe("plain_req");
  });

  it("captures console logs for legacy test helpers", () => {
    const captured = captureConsoleLogs(() => {
      console.log("test", { ok: true });
    });

    expect(captured).toEqual([{ level: "log", line: 'test {"ok":true}' }]);
  });

  it("serializes errors", () => {
    const error = new Error("Failed");

    expect(serializeError(error)).toMatchObject({
      name: "Error",
      message: "Failed",
    });
  });
});
