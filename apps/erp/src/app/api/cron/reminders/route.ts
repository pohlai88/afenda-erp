import { runReminderSweep } from "@afenda/workflows";
import { runCronJob } from "@/lib/cron";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "reminders",
    operation: "cron.reminders",
    execute: async () => runReminderSweep(),
  });
}
