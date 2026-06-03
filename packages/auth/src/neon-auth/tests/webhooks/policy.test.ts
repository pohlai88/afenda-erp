import { describe, expect, it } from "vitest";

import {
  parseBlockedSignupEmailDomains,
  resolveUserBeforeCreateResponse,
} from "../../webhooks/policy.server";

describe("webhook signup policy", () => {
  it("parses blocked domains", () => {
    expect(parseBlockedSignupEmailDomains(" Example.COM , bad.net ")).toEqual([
      "example.com",
      "bad.net",
    ]);
  });

  it("blocks signup for listed domains", () => {
    expect(
      resolveUserBeforeCreateResponse({
        email: "user@blocked.com",
        blockedDomains: ["blocked.com"],
      }),
    ).toEqual({
      allowed: false,
      error_message: "Signups from this email domain are not allowed.",
      error_code: "DOMAIN_BLOCKED",
    });
  });

  it("allows other domains", () => {
    expect(
      resolveUserBeforeCreateResponse({
        email: "user@allowed.com",
        blockedDomains: ["blocked.com"],
      }),
    ).toEqual({ allowed: true });
  });
});
