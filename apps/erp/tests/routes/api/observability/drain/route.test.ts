import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

vi.mock("server-only", () => ({}));

vi.mock("@afenda/observability/server", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@afenda/observability/server")>();

  return {
    ...actual,
    getRequestId: vi.fn(() => "req_drain"),
    logServerEvent: vi.fn(),
    verifyVercelSignature: vi.fn(),
    summarizeDrainPayload: vi.fn(() => ({
      eventCount: 1,
      payloadType: "json-array" as const,
    })),
  };
});

import { verifyVercelSignature } from "@afenda/observability/server";
import { POST } from "@/app/api/internal/v1/observability/drain/route";

describe("observability drain route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_DRAIN_SECRET;
  });

  it("returns 503 when drain secret is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/v1/observability/drain", {
        method: "POST",
        body: "[]",
      }),
    );

    expect(response.status).toBe(503);
  });

  it("returns 403 for invalid signatures", async () => {
    process.env.VERCEL_DRAIN_SECRET = "drain-secret";
    vi.mocked(verifyVercelSignature).mockResolvedValue(false);

    const response = await POST(
      new Request("http://localhost/api/internal/v1/observability/drain", {
        method: "POST",
        headers: {
          "x-vercel-signature": "invalid",
        },
        body: "[]",
      }),
    );

    expect(response.status).toBe(403);
  });

  it("accepts signed drain payloads", async () => {
    process.env.VERCEL_DRAIN_SECRET = "drain-secret";
    const body = '[{"type":"log"}]';
    const signature = createHmac("sha1", "drain-secret")
      .update(body)
      .digest("hex");

    const response = await POST(
      new Request("http://localhost/api/internal/v1/observability/drain", {
        method: "POST",
        headers: {
          "x-vercel-signature": signature,
        },
        body,
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      eventCount: 1,
    });
  });
});
