import { runLynxOutcomeSweep } from "@afenda/feature-lynx/server";
import { runCronJob } from "@/lib/cron";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "lynx-outcomes",
    operation: "cron.lynx-outcomes",
    execute: async () => runLynxOutcomeSweep(),
  });
}
