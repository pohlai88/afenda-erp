import { runHousekeepingSweep } from "@afenda/workflows";
import { runCronJob } from "@/kitchen-sinks/cron.run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "housekeeping",
    operation: "cron.housekeeping",
    execute: async () => runHousekeepingSweep(),
  });
}
