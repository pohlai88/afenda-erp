import {
  SYSTEM_ADMIN_AUDIT_METADATA_REDACT_MAX_DEPTH,
  SYSTEM_ADMIN_AUDIT_METADATA_REDACT_MAX_STRING_LENGTH,
} from "./sys-audit-viewer.limits.shared";

const SECRET_KEY_PATTERN =
  /(password|secret|token|hash|ciphertext|signing|api[_-]?key|private|credential)/i;

export function redactAuditMetadata(
  value: unknown,
  depth = 0,
): unknown {
  if (depth > SYSTEM_ADMIN_AUDIT_METADATA_REDACT_MAX_DEPTH) {
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

  if (typeof value === "string" && value.length > SYSTEM_ADMIN_AUDIT_METADATA_REDACT_MAX_STRING_LENGTH) {
    return `${value.slice(0, SYSTEM_ADMIN_AUDIT_METADATA_REDACT_MAX_STRING_LENGTH)}…`;
  }

  return value;
}
