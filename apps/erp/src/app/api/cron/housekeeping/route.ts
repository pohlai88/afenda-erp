import { runHousekeepingSweep } from "@afenda/workflows";
import { runCronJob } from "@/lib/cron";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "housekeeping",
    operation: "cron.housekeeping",
    execute: async () => runHousekeepingSweep(),
  });
}
