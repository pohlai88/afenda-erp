import { executeKnowledgeScheduledSyncSweepCommand } from "@afenda/feature-knowledge/server";

import { runCronJob } from "@/kitchen-sinks/cron.run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "knowledge-sync",
    operation: "cron.knowledge-sync",
    execute: async () =>
      executeKnowledgeScheduledSyncSweepCommand({
        organizationId: process.env.CRON_ORGANIZATION_ID?.trim() || null,
      }),
  });
}
