import type { SerializedError } from "./logger.types";

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
      ...(error.cause ? { cause: error.cause } : {}),
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}
