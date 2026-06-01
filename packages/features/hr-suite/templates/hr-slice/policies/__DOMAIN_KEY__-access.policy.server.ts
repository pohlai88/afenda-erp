import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../../hr-suite-integration/server";
import { __CONSTANT_PREFIX___READ_CAPABILITY } from "../schemas/__DOMAIN_KEY__-constants.shared";

export type __IDENTIFIER__ExecutionGuard = {
  readonly context: HrModuleExecutionGuard["context"];
  readonly organization: { readonly id: string };
  readonly session: { readonly id: string };
  readonly canReadAudit: boolean;
};

function to__IDENTIFIER__ExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): __IDENTIFIER__ExecutionGuard {
  const { context } = moduleGuard;
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canReadAudit: isLeadership,
  };
}

export async function require__IDENTIFIER__Read() {
  return to__IDENTIFIER__ExecutionGuard(
    await requireHrCapability(__CONSTANT_PREFIX___READ_CAPABILITY),
  );
}
