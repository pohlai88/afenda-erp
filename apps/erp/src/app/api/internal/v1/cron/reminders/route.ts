import { runReminderSweep } from "@afenda/workflows";
import { runCronJob } from "@/kitchen-sinks/cron.run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "reminders",
    operation: "cron.reminders",
    execute: async () => runReminderSweep(),
  });
}
