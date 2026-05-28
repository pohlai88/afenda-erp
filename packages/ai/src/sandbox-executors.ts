import {
  createTenantWorkItemForApprovedSandbox,
  erpModuleIds,
  getAiActionSandboxById,
  type AiActionSandboxRecord,
  type ErpModuleId,
} from "@afenda/db";

export type SandboxExecutorResult = {
  createdRowIds: readonly string[];
};

export type SandboxExecutor = (input: {
  sandbox: AiActionSandboxRecord;
  organizationId: string;
  actorAuthUserId: string;
}) => Promise<SandboxExecutorResult>;

const sandboxExecutors = new Map<string, SandboxExecutor>();

export function registerSandboxExecutor(
  actionType: string,
  executor: SandboxExecutor,
): void {
  sandboxExecutors.set(actionType, executor);
}

export function getSandboxExecutor(
  actionType: string,
): SandboxExecutor | undefined {
  return sandboxExecutors.get(actionType);
}

function isErpModuleId(moduleId: string): moduleId is ErpModuleId {
  return (erpModuleIds as readonly string[]).includes(moduleId);
}

function readSourceRecordId(
  sandbox: AiActionSandboxRecord,
): string | undefined {
  const diff = sandbox.diff as {
    affectedRecords?: readonly string[];
  };
  const first = diff.affectedRecords?.[0];
  if (typeof first !== "string" || first.length === 0) {
    return undefined;
  }

  if (first.startsWith("work_")) {
    return undefined;
  }

  return first;
}

async function executeRecoveryWorkItemSandbox(input: {
  sandbox: AiActionSandboxRecord;
  organizationId: string;
  actorAuthUserId: string;
}): Promise<SandboxExecutorResult> {
  if (!isErpModuleId(input.sandbox.moduleId)) {
    throw new Error(
      `Sandbox module ${input.sandbox.moduleId} cannot create ERP work items.`,
    );
  }

  const riskLevel = (input.sandbox.riskAssessment as { riskLevel?: string })
    ?.riskLevel;
  const priority =
    riskLevel === "high" ? "high" : riskLevel === "low" ? "low" : "medium";

  const workItemId = await createTenantWorkItemForApprovedSandbox({
    organizationId: input.organizationId,
    moduleId: input.sandbox.moduleId,
    sandboxId: input.sandbox.id,
    title: input.sandbox.title,
    actorAuthUserId: input.actorAuthUserId,
    sourceRecordId: readSourceRecordId(input.sandbox),
    priority,
  });

  return { createdRowIds: [workItemId] };
}

registerSandboxExecutor("solution-action-proposal", executeRecoveryWorkItemSandbox);
registerSandboxExecutor("recovery-task-draft", executeRecoveryWorkItemSandbox);

export function resolveSandboxExecutor(
  actionType: string,
): SandboxExecutor | undefined {
  const direct = getSandboxExecutor(actionType);
  if (direct) {
    return direct;
  }

  if (actionType.startsWith("approval-")) {
    return executeRecoveryWorkItemSandbox;
  }

  return undefined;
}

export async function executeApprovedSandbox(input: {
  sandboxId: string;
  organizationId: string;
  actorAuthUserId: string;
}): Promise<SandboxExecutorResult> {
  const sandbox = await getAiActionSandboxById({
    id: input.sandboxId,
    organizationId: input.organizationId,
  });

  if (!sandbox) {
    throw new Error("AI action sandbox was not found for this organization.");
  }

  if (sandbox.status !== "approved") {
    throw new Error(
      `Sandbox executor refused to run while status is ${sandbox.status}.`,
    );
  }

  const executor = resolveSandboxExecutor(sandbox.actionType);
  if (!executor) {
    throw new Error(
      `No domain executor is registered for action type ${sandbox.actionType}.`,
    );
  }

  return executor({
    sandbox,
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
  });
}
