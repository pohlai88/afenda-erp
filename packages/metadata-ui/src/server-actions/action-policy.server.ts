import "server-only";

import {
  parseMetadataUiActionContract,
  type MetadataUiActionContract,
  type MetadataUiActionContractInput,
  type MetadataUiActionPermission,
} from "../contracts/action.contract";
import type {
  MetadataUiActionSubmission,
  MetadataUiActionSubmitFailureCode,
} from "./action-fields.shared";
import { resolveMetadataUiActionLifecycle } from "./action-lifecycle.shared";

export type MetadataUiActionPermissionDecision = Readonly<{
  allowed: boolean;
  reason?: string;
}>;

export type MetadataUiActionPermissionEvaluator = (
  permission: MetadataUiActionPermission,
  action: MetadataUiActionContract,
  submission: MetadataUiActionSubmission,
) => MetadataUiActionPermissionDecision | Promise<MetadataUiActionPermissionDecision>;

export type MetadataUiActionPolicyContext = Readonly<{
  evaluatePermission?: MetadataUiActionPermissionEvaluator;
}>;

export type MetadataUiServerActionContract = Extract<
  MetadataUiActionContract,
  { execution: { kind: "server-action" } }
>;

export type MetadataUiActionPolicyDecision =
  | Readonly<{
      allowed: true;
      action: MetadataUiServerActionContract;
    }>
  | Readonly<{
      allowed: false;
      action?: MetadataUiActionContract;
      code: MetadataUiActionSubmitFailureCode;
      message: string;
    }>;

function denyMetadataUiAction(
  code: MetadataUiActionSubmitFailureCode,
  message: string,
  action?: MetadataUiActionContract,
): MetadataUiActionPolicyDecision {
  return {
    allowed: false,
    action,
    code,
    message,
  };
}

export async function resolveMetadataUiActionPolicy(
  actionInput: MetadataUiActionContractInput | MetadataUiActionContract,
  submission: MetadataUiActionSubmission,
  context: MetadataUiActionPolicyContext = {},
): Promise<MetadataUiActionPolicyDecision> {
  const action = parseMetadataUiActionContract(actionInput);

  if (action.execution.kind !== "server-action") {
    return denyMetadataUiAction(
      "not-server-action",
      "Only server-action metadata may be submitted through this boundary.",
      action,
    );
  }

  const serverAction = action as MetadataUiServerActionContract;

  if (action.visibility === "hidden") {
    return denyMetadataUiAction(
      "action-hidden",
      "Hidden actions cannot be submitted.",
      action,
    );
  }

  if (action.visibility === "disabled") {
    return denyMetadataUiAction(
      "action-disabled",
      action.disabledReason ?? "Disabled actions cannot be submitted.",
      action,
    );
  }

  const lifecycle = resolveMetadataUiActionLifecycle(action);
  if (lifecycle.state === "blocked") {
    return denyMetadataUiAction(
      "action-disabled",
      lifecycle.disabledReason ?? "Blocked actions cannot be submitted.",
      action,
    );
  }

  if (
    (action.risk === "high" || action.risk === "critical") &&
    !submission.confirmationAccepted
  ) {
    return denyMetadataUiAction(
      "confirmation-required",
      "This action requires explicit confirmation.",
      action,
    );
  }

  if (action.audit?.reasonRequired && !submission.auditReason) {
    return denyMetadataUiAction(
      "audit-reason-required",
      "This action requires an audit reason.",
      action,
    );
  }

  if (action.permission) {
    if (!context.evaluatePermission) {
      return denyMetadataUiAction(
        "permission-denied",
        "No permission evaluator is configured for this action.",
        action,
      );
    }

    const decision = await context.evaluatePermission(
      action.permission,
      action,
      submission,
    );

    if (!decision.allowed) {
      return denyMetadataUiAction(
        "permission-denied",
        decision.reason ?? "Permission denied.",
        action,
      );
    }
  }

  return {
    allowed: true,
    action: serverAction,
  };
}
