import type { StructuralLogEvent, StructuralLogLevel } from "./obs-logger-types";

export const structuralLogLevels = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const satisfies readonly StructuralLogLevel[];

export function isStructuralLogLevel(
  value: unknown,
): value is StructuralLogLevel {
  return (
    typeof value === "string" &&
    structuralLogLevels.includes(value as StructuralLogLevel)
  );
}

export type StructuralLogContract = Pick<StructuralLogEvent, "event"> &
  Partial<
    Pick<
      StructuralLogEvent,
      "requestId" | "operationId" | "organizationId"
    >
  > & {
    level: StructuralLogLevel;
  };

export function hasStructuredLogEvent(
  input: unknown,
): input is Pick<StructuralLogEvent, "event"> {
  return (
    typeof input === "object" &&
    input !== null &&
    "event" in input &&
    typeof (input as { event?: unknown }).event === "string" &&
    (input as { event: string }).event.length > 0
  );
}

export function hasStructuralLogContract(
  input: unknown,
): input is StructuralLogContract {
  if (!hasStructuredLogEvent(input)) {
    return false;
  }

  const candidate = input as {
    level?: unknown;
    operationId?: unknown;
    organizationId?: unknown;
    requestId?: unknown;
  };

  return (
    isOptionalString(candidate.operationId) &&
    isOptionalString(candidate.organizationId) &&
    isOptionalString(candidate.requestId) &&
    isStructuralLogLevel(candidate.level)
  );
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}
