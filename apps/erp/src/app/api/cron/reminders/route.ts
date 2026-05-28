import { runReminderSweep } from "@afenda/workflows";
import { runCronJob } from "@/app-cron/run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "reminders",
    operation: "cron.reminders",
    execute: async () => runReminderSweep(),
  });
}
