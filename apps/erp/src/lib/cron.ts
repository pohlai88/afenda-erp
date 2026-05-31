import { getCronSecret } from "@afenda/config/env";
import { createCronRunHistory, finishCronRunHistory } from "@afenda/db";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { NextResponse } from "next/server";

export type CronJobName =
  | "reminders"
  | "syncs"
  | "housekeeping"
  | "knowledge-sync"
  | "lynx-outcomes"
  | "hr-time-clock-sync";

export function authorizeCronRequest(request: Request) {
  const cronSecret = getCronSecret();
  const authorization = request.headers.get("authorization");

  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
}

export async function runCronJob(input: {
  request: Request;
  jobName: CronJobName;
  operation: string;
  execute: () => Promise<Record<string, unknown>>;
}) {
  const startedAt = Date.now();
  const startedDate = new Date();
  const requestId = getRequestId(input.request);
  const route = `/api/cron/${input.jobName}`;
  const context = {
    requestId,
    module: "cron",
    operation: input.operation,
  };
  let cronRunId: string | null = null;

  if (!authorizeCronRequest(input.request)) {
    await safeCreateCronRunHistory({
      jobName: input.jobName,
      route,
      operation: input.operation,
      status: "rejected",
      requestId,
      startedAt: startedDate,
      finishedAt: new Date(),
      durationMs: Date.now() - startedAt,
      errorMessage: "Unauthorized cron request.",
    });

    logServerEvent("warn", "Cron request rejected.", context, {
      route,
      status: 401,
    });

    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    logServerEvent("info", "Cron job started.", context, { route });
    cronRunId = await safeCreateCronRunHistory({
      jobName: input.jobName,
      route,
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

    logServerEvent("info", "Cron job completed.", context, {
      route,
      status: 200,
      durationMs,
      ...result,
    });

    return NextResponse.json({
      success: true,
      job: input.jobName,
      ...result,
    });
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
        route,
        operation: input.operation,
        status: "failed",
        requestId,
        startedAt: startedDate,
        finishedAt: new Date(),
        durationMs,
        errorMessage,
      });
    }

    logServerEvent("error", "Cron job failed.", context, {
      route,
      status: 500,
      durationMs,
      error: errorMessage,
    });

    return NextResponse.json(
      {
        success: false,
        job: input.jobName,
        error: "Cron job failed.",
      },
      { status: 500 },
    );
  }
}

async function safeCreateCronRunHistory(input: Parameters<typeof createCronRunHistory>[0]) {
  try {
    return await createCronRunHistory(input);
  } catch (error) {
    logServerEvent(
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

async function safeFinishCronRunHistory(input: Parameters<typeof finishCronRunHistory>[0]) {
  try {
    await finishCronRunHistory(input);
  } catch (error) {
    logServerEvent(
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
