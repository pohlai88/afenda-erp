import { logServerEvent } from "./obs-log-server-event.server";

export function createTestLogger() {
  return {
    emit: logServerEvent,
  };
}
