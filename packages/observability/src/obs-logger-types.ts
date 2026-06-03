import type { LogLevel } from "@afenda/config/env";

export type StructuralLogLevel = LogLevel;

export type ServerLogLevel = "info" | "warn" | "error";

export type LoggerOutcome = "success" | "failure" | "denied";

export type LoggerContext = {
  requestId?: string;
  correlationId?: string;
  operationId?: string;
  organizationId?: string;
  tenantId?: string;
  actorId?: string;
  userId?: string;
  package?: string;
  domain?: string;
  module?: string;
  operation?: string;
} & Record<string, unknown>;

export type StructuralLogEvent = LoggerContext & {
  event: string;
  durationMs?: number;
  outcome?: LoggerOutcome;
  route?: string;
  status?: number;
  error?: SerializedError;
} & Record<string, unknown>;

export type ServerLogContext = {
  requestId?: string;
  organizationId?: string;
  userId?: string;
  module: string;
  operation: string;
};

export type ServerLogEvent = ServerLogContext & {
  level: ServerLogLevel;
  message: string;
  durationMs?: number;
  status?: number;
  route?: string;
  timestamp: string;
};

export type ServerLogMetadata = Partial<
  Omit<
    ServerLogEvent,
    keyof ServerLogContext | "level" | "message" | "timestamp"
  >
> &
  Record<string, unknown>;

export type SerializedError = {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
};

export type StructuralLogger = {
  child(bindings: LoggerContext): StructuralLogger;
  trace(event: StructuralLogEvent, message?: string): void;
  debug(event: StructuralLogEvent, message?: string): void;
  info(event: StructuralLogEvent, message?: string): void;
  warn(event: StructuralLogEvent, message?: string): void;
  error(event: StructuralLogEvent, message?: string): void;
  fatal(event: StructuralLogEvent, message?: string): void;
};
