import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestLoggerContext } from "./obs-request-context-types";

const requestContextStorage = new AsyncLocalStorage<RequestLoggerContext>();

export function getRequestContext() {
  return requestContextStorage.getStore();
}

export function withRequestContext<T>(
  context: RequestLoggerContext,
  callback: () => T,
) {
  return requestContextStorage.run(context, callback);
}
