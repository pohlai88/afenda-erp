import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockGetNeonAuthServer = vi.fn();

vi.mock("../src/aut-neon-auth-server", () => ({
  getNeonAuthServer: () => mockGetNeonAuthServer(),
}));

describe("Neon Auth admin adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed when the installed SDK does not expose an admin method", async () => {
    mockGetNeonAuthServer.mockReturnValue({ admin: {} });

    const { banNeonAuthAdminUser } = await import(
      "../src/aut-neon-auth-admin-server"
    );

    await expect(
      banNeonAuthAdminUser({ userId: "user_1" }),
    ).rejects.toThrow("Neon Auth admin method banUser is not available.");
  });

  it("calls the Neon Auth admin method and returns data", async () => {
    const banUser = vi.fn().mockResolvedValue({ data: { ok: true } });
    mockGetNeonAuthServer.mockReturnValue({ admin: { banUser } });

    const { banNeonAuthAdminUser } = await import(
      "../src/aut-neon-auth-admin-server"
    );

    await expect(
      banNeonAuthAdminUser({
        userId: "user_1",
        banReason: "Compromised account",
      }),
    ).resolves.toEqual({ ok: true });
    expect(banUser).toHaveBeenCalledWith({
      userId: "user_1",
      banReason: "Compromised account",
    });
  });

  it("normalizes Neon Auth admin errors", async () => {
    const revokeUserSessions = vi.fn().mockResolvedValue({
      error: { message: "Admin role required." },
    });
    mockGetNeonAuthServer.mockReturnValue({
      admin: { revokeUserSessions },
    });

    const { revokeNeonAuthAdminUserSessions } = await import(
      "../src/aut-neon-auth-admin-server"
    );

    await expect(
      revokeNeonAuthAdminUserSessions({ userId: "user_1" }),
    ).rejects.toThrow("Admin role required.");
  });
});
