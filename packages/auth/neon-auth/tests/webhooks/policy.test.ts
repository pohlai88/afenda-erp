import { describe, expect, it } from "vitest";
import {
  parseBlockedSignupEmailDomains,
  resolveUserBeforeCreateResponse,
} from "../../webhooks/policy.server";

describe("neon-auth webhooks policy", () => {
  it("allows signups when domain is not blocked", () => {
    const blocked = parseBlockedSignupEmailDomains("mailinator.com");
    expect(
      resolveUserBeforeCreateResponse({ email: "a@example.com", blockedDomains: blocked }),
    ).toEqual({ allowed: true });
  });

  it("blocks signups for configured domains", () => {
    const blocked = parseBlockedSignupEmailDomains("mailinator.com");
    expect(
      resolveUserBeforeCreateResponse({ email: "a@mailinator.com", blockedDomains: blocked }).allowed,
    ).toBe(false);
  });
});
