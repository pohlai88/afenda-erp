import {
  runCronJob as runWorkflowCronJob,
  type CronJobName,
} from "@afenda/workflows";
import { ERP_CRON_HTTP_ROUTES } from "@/contracts/erp-http.contract";

const CRON_JOB_ROUTE: Record<CronJobName, string> = {
  reminders: ERP_CRON_HTTP_ROUTES.reminders,
  syncs: ERP_CRON_HTTP_ROUTES.syncs,
  housekeeping: ERP_CRON_HTTP_ROUTES.housekeeping,
  "knowledge-sync": ERP_CRON_HTTP_ROUTES.knowledgeSync,
  "lynx-outcomes": ERP_CRON_HTTP_ROUTES.lynxOutcomes,
  "hr-time-clock-sync": ERP_CRON_HTTP_ROUTES.hrTimeClockSync,
  "document-retention-sweep": ERP_CRON_HTTP_ROUTES.documentRetentionSweep,
  "document-scan-sweep": ERP_CRON_HTTP_ROUTES.documentScanSweep,
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
