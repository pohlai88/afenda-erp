import { emitServerLogEvent } from "../logger/emit-server-log-event";

export function createTestLogger() {
  return {
    emit: emitServerLogEvent,
  };
}
