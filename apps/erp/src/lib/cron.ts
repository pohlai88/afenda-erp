import { getCronSecret } from "@afenda/config/env";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { NextResponse } from "next/server";

export type CronJobName = "reminders" | "syncs" | "housekeeping";

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
  const requestId = getRequestId(input.request);
  const route = `/api/cron/${input.jobName}`;
  const context = {
    requestId,
    module: "cron",
    operation: input.operation,
  };

  if (!authorizeCronRequest(input.request)) {
    logServerEvent("warn", "Cron request rejected.", context, {
      route,
      status: 401,
    });

    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    logServerEvent("info", "Cron job started.", context, { route });

    const result = await input.execute();

    logServerEvent("info", "Cron job completed.", context, {
      route,
      status: 200,
      durationMs: Date.now() - startedAt,
      ...result,
    });

    return NextResponse.json({
      success: true,
      job: input.jobName,
      ...result,
    });
  } catch (error) {
    logServerEvent("error", "Cron job failed.", context, {
      route,
      status: 500,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
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
