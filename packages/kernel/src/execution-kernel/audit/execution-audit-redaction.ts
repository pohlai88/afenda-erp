const REDACTED = "[redacted]";
const TRUNCATED = "[truncated]";
const MAX_DEPTH = 6;
const MAX_ARRAY_LENGTH = 20;
const MAX_OBJECT_KEYS = 50;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

function shouldRedactKey(key: string) {
  const normalized = key.toLowerCase();

  return (
    normalized.includes("password") ||
    normalized.includes("secret") ||
    normalized.includes("token") ||
    normalized.includes("cookie") ||
    normalized.includes("authorization") ||
    normalized.includes("privatekey") ||
    normalized.includes("api_key") ||
    normalized.includes("apikey") ||
    normalized.includes("clientsecret") ||
    normalized.includes("sessiontoken") ||
    normalized.includes("accesstoken") ||
    normalized.includes("refreshtoken") ||
    normalized.includes("requestbody") ||
    normalized.includes("responsebody") ||
    normalized.includes("filecontent") ||
    normalized.includes("documentcontent") ||
    normalized.includes("payment") ||
    normalized.includes("card") ||
    normalized.includes("nationalid") ||
    normalized.includes("taxid") ||
    normalized.includes("ssn")
  );
}

function redact(value: unknown, key?: string, depth = 0): unknown {
  if (key && shouldRedactKey(key)) {
    return REDACTED;
  }

  if (depth >= MAX_DEPTH) {
    return TRUNCATED;
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      return [
        ...value.slice(0, MAX_ARRAY_LENGTH).map((entry) =>
          redact(entry, undefined, depth + 1),
        ),
        TRUNCATED,
      ];
    }

    return value.map((entry) => redact(entry, undefined, depth + 1));
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};

    for (const [entryKey, entryValue] of Object.entries(value).slice(
      0,
      MAX_OBJECT_KEYS,
    )) {
      output[entryKey] = redact(entryValue, entryKey, depth + 1);
    }

    if (Object.keys(value).length > MAX_OBJECT_KEYS) {
      output.__truncated = true;
    }

    return output;
  }

  return value;
}

export function redactExecutionAuditRecord<T extends Record<string, unknown>>(
  record: T | undefined,
): T | undefined {
  if (!record) {
    return record;
  }

  return redact(record) as T;
}

