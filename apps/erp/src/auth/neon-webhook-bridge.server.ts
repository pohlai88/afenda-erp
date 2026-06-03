import "server-only";

import { upsertUserProfile } from "@afenda/db";
import { registerNeonAuthWebhookHooks } from "@afenda/auth/server";
import type { NeonAuthWebhookEnvelope } from "@afenda/auth/server";

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

/** Registers ERP side effects for Neon Auth webhooks (call once at app startup). */
export function registerErpNeonAuthWebhookHooks() {
  if (registered) return;
  registered = true;

  registerNeonAuthWebhookHooks({
    onUserCreated: handleUserCreated,
  });
}

registerErpNeonAuthWebhookHooks();
