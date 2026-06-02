import { executeDocumentScanSweepCommand } from "@afenda/feature-system-admin/server";

import { runCronJob } from "@/app-cron/run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "document-scan-sweep",
    operation: "cron.document-scan-sweep",
    execute: async () =>
      executeDocumentScanSweepCommand({
        organizationId: process.env.CRON_ORGANIZATION_ID?.trim() || null,
      }),
  });
}
