import { runLynxOutcomeSweep } from "@afenda/feature-lynx/server";
import { runCronJob } from "@/kitchen-sinks/cron.run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "lynx-outcomes",
    operation: "cron.lynx-outcomes",
    execute: async () => runLynxOutcomeSweep(),
  });
}
