import { runSyncSweep } from "@afenda/workflows";
import { runCronJob } from "@/kitchen-sinks/cron.run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "syncs",
    operation: "cron.syncs",
    execute: async () => runSyncSweep(),
  });
}
