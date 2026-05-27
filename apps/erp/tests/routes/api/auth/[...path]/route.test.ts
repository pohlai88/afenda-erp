import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/auth/neon-auth-server", () => ({
  getNeonAuthServer: vi.fn(),
  isNeonAuthReady: vi.fn(),
}));

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_auth_test"),
  logServerEvent: vi.fn(),
}));

import { authApiRouteCopy } from "@afenda/domain";
import {
  getNeonAuthServer,
  isNeonAuthReady,
} from "@afenda/auth/neon-auth-server";
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
      authApiRouteCopy.neonNotConfigured,
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
    await expect(response.text()).resolves.toBe(authApiRouteCopy.routeFailed);
  });
});
