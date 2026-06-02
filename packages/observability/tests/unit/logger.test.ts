import { describe, expect, it, vi } from "vitest";
import { getRequestId, logServerEvent } from "../../src/index";
import { createChildLogger } from "../../src/logger/create-child-logger";
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

  it("keeps logServerEvent compatible and redacted", () => {
    const captured = captureConsoleLogs(() => {
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
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]?.level).toBe("log");

    const event = JSON.parse(captured[0]?.line ?? "{}") as Record<
      string,
      unknown
    >;

    expect(event).toMatchObject({
      level: "info",
      message: "Route completed.",
      module: "observability",
      operation: "test",
      requestId: "req_test",
      status: 200,
      token: "[redacted]",
    });
    expect(typeof event.timestamp).toBe("string");
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

  it("does not throw when console transport fails", () => {
    const originalLog = console.log;
    console.log = () => {
      throw new Error("transport unavailable");
    };

    try {
      expect(() => {
        logServerEvent("info", "Test.", {
          module: "observability",
          operation: "best-effort",
        });
      }).not.toThrow();
    } finally {
      console.log = originalLog;
    }
  });

  it("serializes errors", () => {
    const error = new Error("Failed");

    expect(serializeError(error)).toMatchObject({
      name: "Error",
      message: "Failed",
    });
  });
});
