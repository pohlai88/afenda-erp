import type { NeonAuthWebhookBeforeCreateResponse } from "./contract";

export function parseBlockedSignupEmailDomains(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveUserBeforeCreateResponse(input: {
  email: string | undefined;
  blockedDomains: Set<string>;
}): NeonAuthWebhookBeforeCreateResponse {
  const email = input.email?.trim().toLowerCase();
  if (!email) return { allowed: true };
  const at = email.lastIndexOf("@");
  if (at < 0) return { allowed: true };
  const domain = email.slice(at + 1);
  if (!input.blockedDomains.has(domain)) return { allowed: true };
  return {
    allowed: false,
    error_message: "Signups from this email domain are not allowed.",
    error_code: "DOMAIN_BLOCKED",
  };
}
