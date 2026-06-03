import "server-only";

import type { NeonAuthWebhookEnvelope } from "./aut-contract";

export type NeonAuthWebhookHooks = {
  onUserCreated?: (payload: NeonAuthWebhookEnvelope) => void | Promise<void>;
  onPhoneNumberVerified?: (payload: NeonAuthWebhookEnvelope) => void | Promise<void>;
  onCustomDeliveryRequired?: (
    payload: NeonAuthWebhookEnvelope,
  ) => Response | Promise<Response> | void;
};

let hooks: NeonAuthWebhookHooks = {};

export function registerNeonAuthWebhookHooks(next: NeonAuthWebhookHooks) {
  hooks = { ...hooks, ...next };
}

export function getNeonAuthWebhookHooks() {
  return hooks;
}

export function resetNeonAuthWebhookHooksForTests() {
  hooks = {};
}
