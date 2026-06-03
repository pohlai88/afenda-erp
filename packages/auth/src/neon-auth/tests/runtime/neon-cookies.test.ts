import { describe, expect, it } from "vitest";
import {
  hasNeonAuthSessionToken,
  NEON_AUTH_SESSION_TOKEN_COOKIE,
} from "../../runtime/neon-cookies.shared";

describe("neon-auth cookies", () => {
  it("detects the session token cookie by exact name", () => {
    expect(hasNeonAuthSessionToken(`${NEON_AUTH_SESSION_TOKEN_COOKIE}=abc123`)).toBe(true);
  });

  it("does not false-positive on substring cookie names", () => {
    expect(
      hasNeonAuthSessionToken(`prefix-${NEON_AUTH_SESSION_TOKEN_COOKIE}=abc123`),
    ).toBe(false);
  });

  it("returns false when the cookie is absent", () => {
    expect(hasNeonAuthSessionToken("other=value")).toBe(false);
  });
});
