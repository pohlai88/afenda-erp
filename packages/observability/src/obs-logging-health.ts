import { isStructuralLogLevel } from "./obs-logger-schema";

export function getLoggingHealth(input: NodeJS.ProcessEnv = process.env) {
  const level = input.LOG_LEVEL ?? "info";

  return {
    configured: isStructuralLogLevel(level),
    level,
  };
}
