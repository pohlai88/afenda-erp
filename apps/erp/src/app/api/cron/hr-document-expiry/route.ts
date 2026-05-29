import { runHrDocumentExpirySweep } from "@afenda/db";
import { runCronJob } from "@/app-cron/run";

export function GET(request: Request) {
  return runCronJob({
    request,
    jobName: "hr-document-expiry",
    operation: "cron.hr-document-expiry",
    execute: async () => {
      const result = await runHrDocumentExpirySweep();
      return { ...result };
    },
  });
}
