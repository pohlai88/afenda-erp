import "server-only";

import {
  parseMetadataUiActionContract,
  type MetadataUiActionContract,
  type MetadataUiActionContractInput,
} from "../contracts/action.contract";
import {
  createMetadataUiActionSubmitFailure,
  createMetadataUiActionSubmitSuccess,
  type MetadataUiActionSubmission,
  type MetadataUiActionSubmitResult,
} from "./action-fields.shared";
import {
  resolveMetadataUiActionPolicy,
  type MetadataUiActionPolicyContext,
  type MetadataUiServerActionContract,
} from "./action-policy.server";

export type MetadataUiServerActionHandler<Data = unknown> = (
  context: MetadataUiServerActionHandlerContext,
) => Promise<Data> | Data;

export type MetadataUiServerActionHandlerContext = Readonly<{
  action: MetadataUiServerActionContract;
  submission: MetadataUiActionSubmission;
}>;

export type MetadataUiServerActionRegistryEntry<Data = unknown> = Readonly<{
  action: MetadataUiActionContractInput | MetadataUiActionContract;
  handler: MetadataUiServerActionHandler<Data>;
}>;

export type MetadataUiServerActionRegistry = Readonly<{
  has(actionKey: string): boolean;
  get(actionKey: string): MetadataUiServerActionRegistryEntry | undefined;
  keys(): readonly string[];
  execute(
    submission: MetadataUiActionSubmission,
    context?: MetadataUiActionPolicyContext,
  ): Promise<MetadataUiActionSubmitResult>;
}>;

function getMetadataUiServerActionKey(
  action: MetadataUiActionContract,
): string | undefined {
  return action.execution.kind === "server-action"
    ? action.execution.actionKey
    : undefined;
}

export function createMetadataUiServerActionRegistry(
  entries: readonly MetadataUiServerActionRegistryEntry[],
): MetadataUiServerActionRegistry {
  const registry = new Map<string, MetadataUiServerActionRegistryEntry>();

  for (const entry of entries) {
    const action = parseMetadataUiActionContract(entry.action);
    const actionKey = getMetadataUiServerActionKey(action);

    if (!actionKey) {
      throw new Error(
        `Action "${action.id}" is not a server-action registry entry.`,
      );
    }

    if (registry.has(actionKey)) {
      throw new Error(`Duplicate server action registration: ${actionKey}`);
    }

    registry.set(actionKey, {
      action,
      handler: entry.handler,
    });
  }

  return {
    has(actionKey) {
      return registry.has(actionKey);
    },
    get(actionKey) {
      return registry.get(actionKey);
    },
    keys() {
      return Array.from(registry.keys());
    },
    async execute(submission, context = {}) {
      const entry = registry.get(submission.actionKey);

      if (!entry) {
        return createMetadataUiActionSubmitFailure({
          actionKey: submission.actionKey,
          code: "handler-not-registered",
          message: `No Metadata UI server action handler is registered for "${submission.actionKey}".`,
        });
      }

      const policy = await resolveMetadataUiActionPolicy(
        entry.action,
        submission,
        context,
      );

      if (!policy.allowed) {
        return createMetadataUiActionSubmitFailure({
          actionKey: submission.actionKey,
          code: policy.code,
          message: policy.message,
        });
      }

      try {
        const data = await entry.handler({
          action: policy.action,
          submission,
        });

        return createMetadataUiActionSubmitSuccess({
          actionKey: submission.actionKey,
          data,
        });
      } catch (error) {
        return createMetadataUiActionSubmitFailure({
          actionKey: submission.actionKey,
          code: "handler-failed",
          message:
            error instanceof Error
              ? error.message
              : "Metadata UI server action handler failed.",
        });
      }
    },
  };
}

export const EMPTY_METADATA_UI_SERVER_ACTION_REGISTRY =
  createMetadataUiServerActionRegistry([]);
