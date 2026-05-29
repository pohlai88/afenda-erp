const SECRET_KEY_PATTERN =
  /(password|secret|token|hash|ciphertext|signing|api[_-]?key|private|credential)/i;

export function redactAuditMetadata(
  value: unknown,
  depth = 0,
): unknown {
  if (depth > 6) {
    return "[truncated]";
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactAuditMetadata(entry, depth + 1));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        if (SECRET_KEY_PATTERN.test(key)) {
          return [key, "[redacted]"];
        }

        return [key, redactAuditMetadata(entry, depth + 1)];
      }),
    );
  }

  if (typeof value === "string" && value.length > 500) {
    return `${value.slice(0, 500)}…`;
  }

  return value;
}
