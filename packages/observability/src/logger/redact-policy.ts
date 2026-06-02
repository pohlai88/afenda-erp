import {
  maxLoggedStringLength,
  maxRedactionDepth,
  redactedValue,
  sensitiveLogKeyFragments,
} from "./logger.constants";

function isSensitiveKey(key: string) {
  const normalizedKey = key.toLowerCase().replace(/[-\s]/g, "_");

  return sensitiveLogKeyFragments.some((fragment) =>
    normalizedKey.includes(fragment),
  );
}

function redactValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (depth > maxRedactionDepth) {
    return "[max-depth]";
  }

  if (typeof value === "string") {
    return value.length > maxLoggedStringLength
      ? `${value.slice(0, maxLoggedStringLength)}...[truncated]`
      : value;
  }

  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "undefined"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(value.stack ? { stack: value.stack } : {}),
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry, depth + 1, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[circular]";
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        isSensitiveKey(key)
          ? redactedValue
          : redactValue(entry, depth + 1, seen),
      ]),
    );
  }

  return String(value);
}

export function redactLogPayload<T>(payload: T): T {
  return redactValue(payload, 0, new WeakSet()) as T;
}
