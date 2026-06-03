import { describe, expect, it, vi } from "vitest";

vi.mock("../../runtime/neon-auth.server", () => ({
  isNeonAuthReady: () => false,
  getNeonAuthServer: vi.fn(),
}));

import { readNeonAuthSessionPayload } from "../../runtime/neon-session.server";

describe("neon-auth session", () => {
  it("returns null when neon auth is disabled", async () => {
    await expect(readNeonAuthSessionPayload()).resolves.toBeNull();
  });
});
