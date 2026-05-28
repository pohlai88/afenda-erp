import "server-only";

import { dispatchTenantWebhookEvent } from "@afenda/workflows";
import { logServerEvent } from "@afenda/observability";
import type { SystemAdminWebhookEvent } from "./catalogs";

export async function dispatchSystemAdminWebhook(input: {
  organizationId: string;
  userId: string;
  eventType: SystemAdminWebhookEvent;
  payload: Record<string, unknown>;
}) {
  try {
    await dispatchTenantWebhookEvent({
      organizationId: input.organizationId,
      eventType: input.eventType,
      payload: input.payload,
    });
  } catch (error) {
    logServerEvent(
      "warn",
      "System admin webhook dispatch failed.",
      {
        organizationId: input.organizationId,
        userId: input.userId,
        module: "system-admin",
        operation: "webhook.dispatch",
      },
      {
        eventType: input.eventType,
        error: error instanceof Error ? error.message : String(error),
      },
    );
  }
}

