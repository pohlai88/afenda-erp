import { runHrTimeClockScheduledSyncSweep } from "@afenda/feature-hr-suite/server";

import { runCronJob } from "@/app-cron/run";

/** HRM-TCI-011 — scheduled sync from external time clock systems. */
export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "hr-time-clock-sync",
    operation: "cron.hr-time-clock-sync",
    execute: async () =>
      runHrTimeClockScheduledSyncSweep({
        organizationId: process.env.CRON_ORGANIZATION_ID?.trim() || null,
      }),
  });
}
