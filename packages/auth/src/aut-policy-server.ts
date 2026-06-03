export function parseBlockedSignupEmailDomains(raw?: string) {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveUserBeforeCreateResponse(input: {
  email?: string;
  blockedDomains: readonly string[];
}) {
  const domain = input.email?.split("@")[1]?.toLowerCase();
  if (domain && input.blockedDomains.includes(domain)) {
    return {
      allowed: false,
      error_message: "Signups from this email domain are not allowed.",
      error_code: "DOMAIN_BLOCKED",
    };
  }
  return { allowed: true };
}
