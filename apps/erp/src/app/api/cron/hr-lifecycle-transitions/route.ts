import { runHrLifecycleTransitionSweep } from "@afenda/db";
import { runCronJob } from "@/app-cron/run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "hr-lifecycle-transitions",
    operation: "cron.hr-lifecycle-transitions",
    execute: async () => {
      const result = await runHrLifecycleTransitionSweep();
      return { ...result };
    },
  });
}
