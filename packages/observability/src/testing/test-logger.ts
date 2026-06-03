import { logServerEvent } from "../server";

export function createTestLogger() {
  return {
    emit: logServerEvent,
  };
}
