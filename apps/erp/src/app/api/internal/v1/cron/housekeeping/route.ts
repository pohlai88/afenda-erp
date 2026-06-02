import { runHousekeepingSweep } from "@afenda/workflows";
import { runCronJob } from "@/app-cron/run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "housekeeping",
    operation: "cron.housekeeping",
    execute: async () => runHousekeepingSweep(),
  });
}
