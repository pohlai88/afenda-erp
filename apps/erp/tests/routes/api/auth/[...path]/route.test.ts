import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/auth/neon-auth/server", () => {
  const getNeonAuthServer = vi.fn();
  const isNeonAuthReady = vi.fn();
  const createHandler = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE") =>
    async (request: Request, context: { params: Promise<{ path: string[] }> }) => {
      if (!isNeonAuthReady()) {
        return new Response("Neon Auth is not configured.", { status: 503 });
      }

      try {
        const handlers = getNeonAuthServer().handler();
        const handler = handlers[method];
        return handler instanceof Response ? handler : await handler(request, context);
      } catch {
        return new Response("Auth route failed.", { status: 500 });
      }
    };

  return {
    getNeonAuthServer,
    isNeonAuthReady,
    getNeonAuthRouteHandlers: vi.fn(() => ({
      GET: createHandler("GET"),
      POST: createHandler("POST"),
      PUT: createHandler("PUT"),
      PATCH: createHandler("PATCH"),
      DELETE: createHandler("DELETE"),
    })),
  };
});

vi.mock("@afenda/observability/server", () => ({
  getRequestId: vi.fn(() => "req_auth_test"),
  logServerEvent: vi.fn(),
}));

import {
  getNeonAuthServer,
  isNeonAuthReady,
} from "@afenda/auth/neon-auth/server";
import { GET } from "@/app/api/auth/[...path]/route";

describe("auth proxy route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when Neon Auth is not configured", async () => {
    vi.mocked(isNeonAuthReady).mockReturnValue(false);

    const response = await GET(
      new Request("http://localhost/api/auth/session"),
      { params: Promise.resolve({ path: ["session"] }) },
    );

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toBe(
      "Neon Auth is not configured.",
    );
  });

  it("delegates to the Neon Auth handler when configured", async () => {
    vi.mocked(isNeonAuthReady).mockReturnValue(true);
    vi.mocked(getNeonAuthServer).mockReturnValue({
      handler: () => ({
        GET: vi.fn(
          async () =>
            new Response(JSON.stringify({ ok: true }), { status: 200 }),
        ),
        POST: vi.fn(),
        PUT: vi.fn(),
        PATCH: vi.fn(),
        DELETE: vi.fn(),
      }),
    } as never);

    const response = await GET(
      new Request("http://localhost/api/auth/session"),
      { params: Promise.resolve({ path: ["session"] }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns 500 when the Neon Auth handler throws", async () => {
    vi.mocked(isNeonAuthReady).mockReturnValue(true);
    vi.mocked(getNeonAuthServer).mockReturnValue({
      handler: () => ({
        GET: vi.fn(async () => {
          throw new Error("handler failed");
        }),
        POST: vi.fn(),
        PUT: vi.fn(),
        PATCH: vi.fn(),
        DELETE: vi.fn(),
      }),
    } as never);

    const response = await GET(
      new Request("http://localhost/api/auth/session"),
      { params: Promise.resolve({ path: ["session"] }) },
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Auth route failed.");
  });
});
