import { getLogLevel, type LogLevel } from "@afenda/config/env";

export function resolveLogLevel(input: NodeJS.ProcessEnv = process.env): LogLevel {
  return getLogLevel(input);
}
