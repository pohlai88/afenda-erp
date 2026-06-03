import {
  runCronJob as runWorkflowCronJob,
  type CronJobName,
} from "@afenda/workflows";
const CRON_JOB_ROUTE: Record<CronJobName, string> = {
  reminders: "/api/internal/v1/cron/reminders",
  syncs: "/api/internal/v1/cron/syncs",
  housekeeping: "/api/internal/v1/cron/housekeeping",
  "knowledge-sync": "/api/internal/v1/cron/knowledge-sync",
  "lynx-outcomes": "/api/internal/v1/cron/lynx-outcomes",
  "hr-time-clock-sync": "/api/internal/v1/cron/hr-time-clock-sync",
  "document-retention-sweep": "/api/internal/v1/cron/document-retention-sweep",
  "document-scan-sweep": "/api/internal/v1/cron/document-scan-sweep",
};

export type { CronJobName };

export function runCronJob(input: {
  request: Request;
  jobName: CronJobName;
  operation: string;
  execute: () => Promise<Record<string, unknown>>;
}) {
  return runWorkflowCronJob({
    ...input,
    route: CRON_JOB_ROUTE[input.jobName],
  });
}
