import { executeDocumentRetentionExpirySweepCommand } from "@afenda/feature-system-admin/server";

import { runCronJob } from "@/kitchen-sinks/cron.run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "document-retention-sweep",
    operation: "cron.document-retention-sweep",
    execute: async () =>
      executeDocumentRetentionExpirySweepCommand({
        organizationId: process.env.CRON_ORGANIZATION_ID?.trim() || null,
      }),
  });
}
