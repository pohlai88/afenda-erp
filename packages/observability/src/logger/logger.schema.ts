import type { StructuralLogLevel } from "./logger.types";

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
