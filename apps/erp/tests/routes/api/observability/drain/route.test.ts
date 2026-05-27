import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/observability", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/observability")>();

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

import { verifyVercelSignature } from "@afenda/observability";
import { POST } from "@/app/api/observability/drain/route";

describe("observability drain route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_DRAIN_SECRET;
  });

  it("returns 503 when drain secret is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/observability/drain", {
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
      new Request("http://localhost/api/observability/drain", {
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
    vi.mocked(verifyVercelSignature).mockResolvedValue(true);

    const response = await POST(
      new Request("http://localhost/api/observability/drain", {
        method: "POST",
        headers: {
          "x-vercel-signature": "valid",
        },
        body: "[]",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      eventCount: 1,
    });
  });
});
