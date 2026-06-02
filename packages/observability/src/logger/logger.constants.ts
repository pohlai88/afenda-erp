export const loggerServiceName = "afenda-erp";

export const redactedValue = "[redacted]";

export const sensitiveLogKeyFragments = [
  "authorization",
  "cookie",
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "privatekey",
  "private_key",
  "session",
] as const;

export const maxLoggedStringLength = 2_000;
export const maxRedactionDepth = 8;
