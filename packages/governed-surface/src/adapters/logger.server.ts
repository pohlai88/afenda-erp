import "server-only";

type LogLevel = "info" | "warn" | "error";

function emitLog(
  level: LogLevel,
  message: string,
  metadata: Record<string, unknown> = {},
) {
  const event = {
    level,
    message,
    module: "governed-surface",
    timestamp: new Date().toISOString(),
    ...metadata,
  };
  const line = JSON.stringify(event);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function logUnexpectedServerError(
  message: string,
  error: unknown,
  metadata: Record<string, unknown> = {},
) {
  emitLog("error", message, {
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    ...metadata,
  });
}

export const rootLogger = {
  info(metadata: Record<string, unknown>, message: string) {
    emitLog("info", message, metadata);
  },
};
