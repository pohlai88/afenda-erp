import "server-only";

import { upsertUserProfile } from "@afenda/db";
import {
  handleNeonAuthCustomDeliveryRequired,
  registerNeonAuthWebhookHooks,
  type NeonAuthWebhookEnvelope,
} from "@afenda/auth/neon-auth/server";

async function handleUserCreated(payload: NeonAuthWebhookEnvelope) {
  const user = payload.user;
  if (!user?.id || !user.email || !user.name) return;

  await upsertUserProfile({
    authUserId: user.id,
    email: user.email,
    name: user.name,
  });
}

let registered = false;

export function registerErpNeonAuthWebhookHooks() {
  if (registered) return;
  registered = true;

  registerNeonAuthWebhookHooks({
    onUserCreated: handleUserCreated,
    onCustomDeliveryRequired: handleNeonAuthCustomDeliveryRequired,
  });
}

registerErpNeonAuthWebhookHooks();
