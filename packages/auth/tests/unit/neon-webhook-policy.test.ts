import { describe, expect, it } from "vitest";
import {
  parseBlockedSignupEmailDomains,
  resolveUserBeforeCreateResponse,
} from "../../src/neon-auth/webhooks/policy.server";

describe("neon auth webhook signup policy", () => {
  it("allows signups when no domains are blocked", () => {
    expect(
      resolveUserBeforeCreateResponse({
        email: "user@example.com",
        blockedDomains: parseBlockedSignupEmailDomains(undefined),
      }),
    ).toEqual({ allowed: true });
  });

  it("rejects blocked email domains", () => {
    const blocked = parseBlockedSignupEmailDomains("spam.test, Evil.COM");

    expect(
      resolveUserBeforeCreateResponse({
        email: "User@evil.com",
        blockedDomains: blocked,
      }),
    ).toEqual({
      allowed: false,
      error_message: "Signups from this email domain are not allowed.",
      error_code: "DOMAIN_BLOCKED",
    });
  });
});
