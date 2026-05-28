import {
  runTenantHousekeepingSweep,
  runTenantReminderSweep,
  runTenantSyncSweep,
  type TenantWorkflowSweepResult,
} from "@afenda/db";
import { getWorkflowAutomationDefinitions } from "@afenda/domain";
import { runWorkflowWithRetry } from "./durable-runner";

export const workflowNamespaces = ["approvals", "reminders", "sync"] as const;

export type WorkflowAutomationRun = ReturnType<
  typeof getWorkflowAutomationDefinitions
>[number];
export { runWorkflowWithRetry } from "./durable-runner";
export { dispatchTenantWebhookEvent } from "./webhooks";
export type { DispatchTenantWebhookEventInput } from "./webhooks";

export type ScheduledWorkflowResult = TenantWorkflowSweepResult & {
  metadata: {
    attempts: number;
    durationMs: number;
  };
};

export {
  getRecoveryPlaybookDefinitions,
  getResolvedWorkflowAutomationRuns,
  getWorkflowAutomationDefinitions,
} from "@afenda/domain";

export async function runReminderSweep() {
  const run = await runWorkflowWithRetry({
    execute: () => runTenantReminderSweep(),
  });

  return {
    ...run.result,
    metadata: {
      attempts: run.attempts,
      durationMs: run.durationMs,
    },
  };
}

export async function runSyncSweep() {
  const [tenantSweepRun, automations] = await Promise.all([
    runWorkflowWithRetry({
      execute: () => runTenantSyncSweep(),
    }),
    Promise.resolve(getWorkflowAutomationDefinitions()),
  ]);
  const tenantSweep = tenantSweepRun.result;
  const delayedAutomations = automations.filter(
    (run) => run.status === "watch",
  );

  return {
    ...tenantSweep,
    scannedItems: tenantSweep.scannedItems + automations.length,
    escalations: tenantSweep.escalations + delayedAutomations.length,
    status:
      tenantSweep.status === "watch" || delayedAutomations.length > 0
        ? "watch"
        : "healthy",
    metadata: {
      attempts: tenantSweepRun.attempts,
      durationMs: tenantSweepRun.durationMs,
    },
  } satisfies ScheduledWorkflowResult;
}

export async function runHousekeepingSweep() {
  const run = await runWorkflowWithRetry({
    execute: () => runTenantHousekeepingSweep(),
  });

  return {
    ...run.result,
    metadata: {
      attempts: run.attempts,
      durationMs: run.durationMs,
    },
  };
}
