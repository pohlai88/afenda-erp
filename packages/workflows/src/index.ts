import { getCronSecret } from "@afenda/config/env";
import {
  createCronRunHistory,
  finishCronRunHistory,
  runTenantHousekeepingSweep,
  runTenantReminderSweep,
  runTenantSyncSweep,
  type TenantWorkflowSweepResult,
} from "@afenda/db";
import { getWorkflowAutomationDefinitions } from "@afenda/kernel";
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
} from "@afenda/kernel";

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

export type CronJobName =
  | "reminders"
  | "syncs"
  | "housekeeping"
  | "knowledge-sync"
  | "lynx-outcomes"
  | "hr-time-clock-sync"
  | "document-retention-sweep"
  | "document-scan-sweep";

export function authorizeCronRequest(request: Request) {
  const cronSecret = getCronSecret();
  const authorization = request.headers.get("authorization");

  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
}

function getWorkflowRequestId(request: Request) {
  return (
    request.headers.get("x-vercel-id") ??
    request.headers.get("x-request-id") ??
    undefined
  );
}

function logWorkflowEvent(
  level: "info" | "warn" | "error",
  message: string,
  context: Record<string, unknown>,
  metadata: Record<string, unknown> = {},
) {
  const line = JSON.stringify({
    level,
    message,
    ...context,
    ...metadata,
    timestamp: new Date().toISOString(),
  });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export async function runCronJob(input: {
  request: Request;
  jobName: CronJobName;
  route: string;
  operation: string;
  execute: () => Promise<Record<string, unknown>>;
}) {
  const startedAt = Date.now();
  const startedDate = new Date();
  const requestId = getWorkflowRequestId(input.request);
  const context = {
    requestId,
    module: "cron",
    operation: input.operation,
  };
  let cronRunId: string | null = null;

  if (!authorizeCronRequest(input.request)) {
    await safeCreateCronRunHistory({
      jobName: input.jobName,
      route: input.route,
      operation: input.operation,
      status: "rejected",
      requestId,
      startedAt: startedDate,
      finishedAt: new Date(),
      durationMs: Date.now() - startedAt,
      errorMessage: "Unauthorized cron request.",
    });
    logWorkflowEvent("warn", "Cron request rejected.", context, {
      route: input.route,
      status: 401,
    });
    return Response.json({ success: false }, { status: 401 });
  }

  try {
    logWorkflowEvent("info", "Cron job started.", context, {
      route: input.route,
    });
    cronRunId = await safeCreateCronRunHistory({
      jobName: input.jobName,
      route: input.route,
      operation: input.operation,
      status: "started",
      requestId,
      startedAt: startedDate,
    });

    const result = await input.execute();
    const durationMs = Date.now() - startedAt;

    if (cronRunId) {
      await safeFinishCronRunHistory({
        id: cronRunId,
        status: "success",
        durationMs,
        result,
      });
    }

    logWorkflowEvent("info", "Cron job completed.", context, {
      route: input.route,
      status: 200,
      durationMs,
      ...result,
    });
    return Response.json({ success: true, job: input.jobName, ...result });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (cronRunId) {
      await safeFinishCronRunHistory({
        id: cronRunId,
        status: "failed",
        durationMs,
        errorMessage,
      });
    } else {
      await safeCreateCronRunHistory({
        jobName: input.jobName,
        route: input.route,
        operation: input.operation,
        status: "failed",
        requestId,
        startedAt: startedDate,
        finishedAt: new Date(),
        durationMs,
        errorMessage,
      });
    }

    logWorkflowEvent("error", "Cron job failed.", context, {
      route: input.route,
      status: 500,
      durationMs,
      error: errorMessage,
    });
    return Response.json(
      { success: false, job: input.jobName, error: "Cron job failed." },
      { status: 500 },
    );
  }
}

async function safeCreateCronRunHistory(
  input: Parameters<typeof createCronRunHistory>[0],
) {
  try {
    return await createCronRunHistory(input);
  } catch (error) {
    logWorkflowEvent(
      "warn",
      "Cron run history write failed.",
      {
        requestId: input.requestId,
        module: "cron",
        operation: "cron.history.create",
      },
      {
        jobName: input.jobName,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return null;
  }
}

async function safeFinishCronRunHistory(
  input: Parameters<typeof finishCronRunHistory>[0],
) {
  try {
    await finishCronRunHistory(input);
  } catch (error) {
    logWorkflowEvent(
      "warn",
      "Cron run history update failed.",
      {
        module: "cron",
        operation: "cron.history.finish",
      },
      {
        cronRunId: input.id,
        error: error instanceof Error ? error.message : String(error),
      },
    );
  }
}
