import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/ai/server", () => ({
  assertCapabilityAllowed: vi.fn(),
  isAiPermissionError: vi.fn(() => false),
}));

vi.mock("@afenda/auth/server", () => ({
  getApiAuthContext: vi.fn(async () => ({
    session: {
      id: "user_1",
    },
    organization: {
      id: "org_1",
      capabilities: ["system-admin.machine-layer.read"],
    },
  })),
}));

vi.mock("@afenda/db", () => ({
  getLynxRunDetail: vi.fn(async () => ({
    id: "lynxrun_1",
    organizationId: "org_1",
    userAuthId: "user_1",
    route: "/api/lynx/truth-search",
    workflowId: null,
    workflowSessionId: null,
    model: "openai/gpt-5.4",
    status: "completed",
    promptSummary: "What policy applies?",
    latencyMs: 1200,
    metadata: {},
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    completedAt: new Date("2026-01-01T00:00:02.000Z"),
    events: [],
    feedback: [],
  })),
  recordLynxRunFeedback: vi.fn(async () => "lynxfb_1"),
}));

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_test"),
  logServerEvent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { POST } from "@/app/api/lynx/runs/feedback/route";
import { getLynxRunDetail, recordLynxRunFeedback } from "@afenda/db";
import { revalidatePath } from "next/cache";

describe("Lynx live run feedback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records feedback against a tenant-owned Lynx run", async () => {
    const response = await POST(
      new Request("http://localhost/api/lynx/runs/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "lynxrun_1",
          messageId: "msg_1",
          rating: "positive",
          category: "accurate",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      feedbackId: "lynxfb_1",
      ok: true,
    });
    expect(getLynxRunDetail).toHaveBeenCalledWith({
      organizationId: "org_1",
      runId: "lynxrun_1",
    });
    expect(recordLynxRunFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        runId: "lynxrun_1",
        userAuthId: "user_1",
        rating: "positive",
        category: "accurate",
        metadata: expect.objectContaining({
          route: "lynx.live-message",
          messageId: "msg_1",
          runRoute: "/api/lynx/truth-search",
          requestId: "req_test",
        }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/solution-console/runs/lynxrun_1",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/solution-console/runs");
  });

  it("rejects invalid feedback payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/lynx/runs/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "lynxrun_1",
          rating: "positive",
          category: "unclear",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(recordLynxRunFeedback).not.toHaveBeenCalled();
  });

  it("rejects feedback for unknown runs", async () => {
    vi.mocked(getLynxRunDetail).mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api/lynx/runs/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "lynxrun_missing",
          rating: "negative",
          category: "unsupported",
        }),
      }),
    );

    expect(response.status).toBe(404);
    expect(recordLynxRunFeedback).not.toHaveBeenCalled();
  });

  it("returns auth responses unchanged", async () => {
    const { getApiAuthContext } = await import("@afenda/auth/server");
    vi.mocked(getApiAuthContext).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await POST(
      new Request("http://localhost/api/lynx/runs/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "lynxrun_1",
          rating: "positive",
          category: "accurate",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
