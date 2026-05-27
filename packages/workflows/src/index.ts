import {
  runTenantHousekeepingSweep,
  runTenantReminderSweep,
  runTenantSyncSweep,
  type TenantWorkflowSweepResult,
} from "@afenda/db";
import { getWorkflowAutomationDefinitions } from "@afenda/domain";

export const workflowNamespaces = ["approvals", "reminders", "sync"] as const;

export type WorkflowAutomationRun = ReturnType<
  typeof getWorkflowAutomationDefinitions
>[number];

export type ScheduledWorkflowResult = TenantWorkflowSweepResult;

export {
  getRecoveryPlaybookDefinitions,
  getResolvedWorkflowAutomationRuns,
  getWorkflowAutomationDefinitions,
} from "@afenda/domain";

export async function runReminderSweep() {
  return runTenantReminderSweep();
}

export async function runSyncSweep() {
  const [tenantSweep, automations] = await Promise.all([
    runTenantSyncSweep(),
    Promise.resolve(getWorkflowAutomationDefinitions()),
  ]);
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
  } satisfies ScheduledWorkflowResult;
}

export async function runHousekeepingSweep() {
  return runTenantHousekeepingSweep();
}
