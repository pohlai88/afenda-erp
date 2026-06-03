import { describe, expect, it } from "vitest";

import {
  hasNeonAuthSessionToken,
  NEON_AUTH_SESSION_TOKEN_COOKIE,
} from "../../runtime/neon-cookies.shared";

describe("hasNeonAuthSessionToken", () => {
  it("detects the Neon session token cookie", () => {
    expect(
      hasNeonAuthSessionToken(`${NEON_AUTH_SESSION_TOKEN_COOKIE}=abc123; other=value`),
    ).toBe(true);
  });

  it("returns false when cookie is absent", () => {
    expect(hasNeonAuthSessionToken("other=value")).toBe(false);
  });
});
