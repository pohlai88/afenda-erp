import type { NeonAuthWebhookEnvelope } from "./contract";

export type NeonAuthWebhookHooks = {
  onUserCreated?: (payload: NeonAuthWebhookEnvelope) => void | Promise<void>;
  onPhoneNumberVerified?: (payload: NeonAuthWebhookEnvelope) => void | Promise<void>;
  onCustomDeliveryRequired?: (payload: NeonAuthWebhookEnvelope) => Response | Promise<Response>;
};

let registeredHooks: NeonAuthWebhookHooks = {};

export function registerNeonAuthWebhookHooks(hooks: NeonAuthWebhookHooks) {
  registeredHooks = { ...registeredHooks, ...hooks };
}

export function getNeonAuthWebhookHooks() {
  return registeredHooks;
}

export function resetNeonAuthWebhookHooksForTests() {
  registeredHooks = {};
}
