import { createHmac } from "node:crypto";
import {
  listWebhookDispatchTargets,
  recordWebhookDelivery,
} from "@afenda/db";
import {
  DurableWorkflowRetryError,
  runWorkflowWithRetry,
} from "./durable-runner";

export type DispatchTenantWebhookEventInput = {
  organizationId: string;
  eventType: string;
  payload: Record<string, unknown>;
};

function signPayload(input: { body: string; secret: string }) {
  return createHmac("sha256", input.secret).update(input.body).digest("hex");
}

class WebhookDeliveryHttpError extends Error {
  readonly responseCode: number;

  constructor(responseCode: number) {
    super(`Webhook endpoint returned ${responseCode}.`);
    this.name = "WebhookDeliveryHttpError";
    this.responseCode = responseCode;
  }
}

function responseCodeFromError(error: unknown) {
  if (error instanceof WebhookDeliveryHttpError) {
    return error.responseCode;
  }
  if (
    error instanceof DurableWorkflowRetryError &&
    error.cause instanceof WebhookDeliveryHttpError
  ) {
    return error.cause.responseCode;
  }
  return null;
}

export async function dispatchTenantWebhookEvent(
  input: DispatchTenantWebhookEventInput,
) {
  const targets = await listWebhookDispatchTargets({
    organizationId: input.organizationId,
    eventType: input.eventType,
  });
  const body = JSON.stringify({
    type: input.eventType,
    organizationId: input.organizationId,
    data: input.payload,
  });

  const results = await Promise.allSettled(
    targets.map(async (target) => {
      const signingSecret = target.signingSecret;
      if (!signingSecret) {
        await recordWebhookDelivery({
          organizationId: input.organizationId,
          webhookId: target.id,
          eventType: input.eventType,
          status: "failed",
          attemptCount: 0,
          retryOutcome: "not_dispatched",
          errorMessage:
            "Signing secret is not decryptable in this environment.",
        });
        return { webhookId: target.id, status: "failed" as const };
      }

      try {
        const run = await runWorkflowWithRetry({
          execute: async () => {
            const response = await fetch(target.url, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-afenda-event": input.eventType,
                "x-afenda-signature": `sha256=${signPayload({
                  body,
                  secret: signingSecret,
                })}`,
              },
              body,
            });

            if (!response.ok) {
              throw new WebhookDeliveryHttpError(response.status);
            }

            return response;
          },
        });

        await recordWebhookDelivery({
          organizationId: input.organizationId,
          webhookId: target.id,
          eventType: input.eventType,
          status: "delivered",
          attemptCount: run.attempts,
          retryOutcome: run.attempts > 1 ? "delivered_after_retry" : "delivered",
          responseCode: run.result.status,
          errorMessage: null,
        });

        return {
          webhookId: target.id,
          status: "delivered" as const,
        };
      } catch (error) {
        await recordWebhookDelivery({
          organizationId: input.organizationId,
          webhookId: target.id,
          eventType: input.eventType,
          status: "failed",
          attemptCount:
            error instanceof DurableWorkflowRetryError ? error.attempts : 1,
          retryOutcome: "exhausted",
          responseCode: responseCodeFromError(error),
          errorMessage: error instanceof Error ? error.message : String(error),
        });

        return { webhookId: target.id, status: "failed" as const };
      }
    }),
  );

  return {
    targetCount: targets.length,
    deliveredCount: results.filter(
      (result) =>
        result.status === "fulfilled" && result.value.status === "delivered",
    ).length,
    failedCount: results.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && result.value.status === "failed"),
    ).length,
  };
}
