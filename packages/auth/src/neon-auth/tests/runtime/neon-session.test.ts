import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../../runtime/neon-auth.server", () => ({
  getNeonAuthServer: vi.fn(),
  isNeonAuthReady: vi.fn(),
}));

import { getNeonAuthServer, isNeonAuthReady } from "../../runtime/neon-auth.server";
import { readNeonAuthSessionPayload } from "../../runtime/neon-session.server";

describe("readNeonAuthSessionPayload", () => {
  it("returns null when Neon Auth is not ready", async () => {
    vi.mocked(isNeonAuthReady).mockReturnValue(false);
    await expect(readNeonAuthSessionPayload()).resolves.toBeNull();
    expect(getNeonAuthServer).not.toHaveBeenCalled();
  });

  it("returns session user from auth.getSession()", async () => {
    vi.mocked(isNeonAuthReady).mockReturnValue(true);
    vi.mocked(getNeonAuthServer).mockReturnValue({
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            id: "session_123",
            expiresAt: "2026-01-01T00:00:00.000Z",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-02T00:00:00.000Z",
          },
          user: {
            id: "user_123",
            name: "Ada Lovelace",
            email: "ada@example.com",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-02T00:00:00.000Z",
          },
        },
        error: null,
      }),
    } as never);

    await expect(readNeonAuthSessionPayload()).resolves.toMatchObject({
      user: { id: "user_123", email: "ada@example.com" },
    });
  });
});
